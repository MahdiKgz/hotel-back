const { Op, col, fn } = require("sequelize");
const {
  Amenity,
  Hotel,
  HotelAmenity,
  HotelImage,
  Province,
  Reserve,
  Room,
} = require("../../models");
const redis = require("../../redis");
const { errorResponse, successResponse } = require("../../utils/responses");

const OVERVIEW_CACHE_KEY = "landing:overview:v1";
const FILTERS_CACHE_KEY = "landing:filters:v1";
const CACHE_TTL = Math.max(30, Number(process.env.REDIS_CACHE_TTL || 300));
const SORT_OPTIONS = new Set([
  "recommended",
  "price_asc",
  "price_desc",
  "stars_desc",
  "newest",
  "name_asc",
]);

class LandingQueryError extends Error {}

async function readCache(key) {
  if (redis.status !== "ready") return null;

  try {
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
}

async function writeCache(key, value) {
  if (redis.status !== "ready") return;

  try {
    await redis.set(key, JSON.stringify(value), "EX", CACHE_TTL);
  } catch {
    // Cache failures must not make the public API unavailable.
  }
}

function parseInteger(value, field, options = {}) {
  const { min = 0, max = Number.MAX_SAFE_INTEGER, fallback } = options;
  if (value === undefined || value === null || value === "") return fallback;

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < min || parsed > max) {
    throw new LandingQueryError(`${field} must be an integer between ${min} and ${max}.`);
  }
  return parsed;
}

function parseIntegerList(value, field, min, max) {
  if (value === undefined || value === null || value === "") return [];

  const parts = (Array.isArray(value) ? value : [value])
    .flatMap((item) => String(item).split(","))
    .filter(Boolean);
  const values = parts.map((item) => parseInteger(item, field, { min, max }));
  return [...new Set(values)];
}

function isIsoDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function parseSearchQuery(query) {
  const destinationValue = query.destination ?? query.q;
  const destination = destinationValue ? String(destinationValue).trim() : "";
  if (destination.length > 100) {
    throw new LandingQueryError("destination cannot exceed 100 characters.");
  }

  const checkIn = query.checkIn ? String(query.checkIn) : undefined;
  const checkOut = query.checkOut ? String(query.checkOut) : undefined;
  if ((checkIn && !checkOut) || (!checkIn && checkOut)) {
    throw new LandingQueryError("checkIn and checkOut must be provided together.");
  }
  if (checkIn && (!isIsoDate(checkIn) || !isIsoDate(checkOut))) {
    throw new LandingQueryError("checkIn and checkOut must use YYYY-MM-DD format.");
  }
  if (checkIn && checkIn >= checkOut) {
    throw new LandingQueryError("checkOut must be after checkIn.");
  }

  const sort = query.sort ? String(query.sort) : "recommended";
  if (!SORT_OPTIONS.has(sort)) {
    throw new LandingQueryError(`sort must be one of: ${[...SORT_OPTIONS].join(", ")}.`);
  }

  const metroAccess = query.metroAccess
    ? String(query.metroAccess).toUpperCase()
    : undefined;
  if (metroAccess && !["YES", "NO"].includes(metroAccess)) {
    throw new LandingQueryError("metroAccess must be YES or NO.");
  }

  const filters = {
    destination,
    provinceId: parseInteger(
      query.provinceId ?? query.city ?? query.destinationId,
      "provinceId",
      { min: 1 },
    ),
    stars: parseIntegerList(query.stars, "stars", 1, 5),
    amenityIds: parseIntegerList(
      query.amenityIds ?? query.amenities,
      "amenityIds",
      1,
      Number.MAX_SAFE_INTEGER,
    ),
    minPrice: parseInteger(query.minPrice, "minPrice", { min: 0 }),
    maxPrice: parseInteger(query.maxPrice, "maxPrice", { min: 0 }),
    capacity: parseInteger(query.capacity ?? query.guests, "capacity", {
      min: 1,
      max: 100,
    }),
    metroAccess,
    checkIn,
    checkOut,
    sort,
    page: parseInteger(query.page, "page", { min: 1, fallback: 1 }),
    limit: parseInteger(query.limit, "limit", {
      min: 1,
      max: 50,
      fallback: 12,
    }),
  };

  if (
    filters.minPrice !== undefined &&
    filters.maxPrice !== undefined &&
    filters.minPrice > filters.maxPrice
  ) {
    throw new LandingQueryError("minPrice cannot be greater than maxPrice.");
  }

  return filters;
}

function serializeHotel(hotel, provinceMap, roomSummary = {}) {
  const plain = typeof hotel.toJSON === "function" ? hotel.toJSON() : hotel;
  const rooms = [...(plain.Rooms || [])].sort((a, b) => a.price - b.price);
  const images = [...(plain.images || [])].sort((a, b) => a.order - b.order);
  const computedPrice = rooms.length ? Math.min(...rooms.map((room) => room.price)) : null;
  const summaryPrice = roomSummary.startingPrice;

  return {
    id: plain.id,
    name: plain.name,
    slug: plain.slug,
    cover: plain.cover,
    stars: Number(plain.stars),
    city: plain.city,
    province: provinceMap.get(plain.city) || null,
    address: plain.address,
    description: plain.description,
    metroAccess: plain.metroAccess,
    geometry: plain.geometry,
    startingPrice:
      summaryPrice === undefined || summaryPrice === null
        ? computedPrice
        : Number(summaryPrice),
    matchingRoomCount:
      roomSummary.matchingRoomCount === undefined
        ? rooms.length
        : Number(roomSummary.matchingRoomCount),
    rooms,
    amenities: plain.amenities || [],
    images,
  };
}

async function loadProvinceMap() {
  const provinces = await Province.findAll({
    attributes: ["id", "name"],
    order: [["name", "ASC"]],
    raw: true,
  });
  return new Map(
    provinces.map((province) => [
      province.id,
      { id: province.id, name: province.name },
    ]),
  );
}

function emptySearchResult(filters) {
  return {
    hotels: [],
    pagination: {
      page: filters.page,
      limit: filters.limit,
      totalItems: 0,
      totalPages: 0,
    },
    activeFilters: filters,
  };
}

function getSearchOrder(sort) {
  const minimumPrice = fn("MIN", col("Rooms.price"));

  switch (sort) {
    case "price_desc":
      return [[minimumPrice, "DESC"]];
    case "stars_desc":
      return [["stars", "DESC"], [minimumPrice, "ASC"]];
    case "newest":
      return [["createdAt", "DESC"]];
    case "name_asc":
      return [["name", "ASC"]];
    case "recommended":
      return [["stars", "DESC"], [minimumPrice, "ASC"]];
    case "price_asc":
    default:
      return [[minimumPrice, "ASC"]];
  }
}

exports.getOverview = async (req, res, next) => {
  try {
    const cached = await readCache(OVERVIEW_CACHE_KEY);
    if (cached) {
      res.set("X-Cache", "HIT");
      return successResponse(res, 200, "", cached);
    }

    const [hotels, provinceMap, totalRooms, totalReservations] = await Promise.all([
      Hotel.findAll({
        attributes: [
          "id",
          "name",
          "slug",
          "cover",
          "stars",
          "city",
          "address",
          "description",
          "metroAccess",
          "geometry",
        ],
        include: [
          {
            model: Room,
            attributes: ["id", "name", "slug", "capacity", "price", "status"],
            where: { status: { [Op.ne]: "MAINTAIN" } },
            required: false,
          },
          {
            model: Amenity,
            as: "amenities",
            attributes: ["id", "title", "description"],
            through: { attributes: [] },
            where: { isActive: true },
            required: false,
          },
          {
            model: HotelImage,
            as: "images",
            attributes: ["id", "url", "order", "isCover"],
            required: false,
          },
        ],
        order: [["stars", "DESC"], ["createdAt", "DESC"]],
      }),
      loadProvinceMap(),
      Room.count({ where: { status: { [Op.ne]: "MAINTAIN" } } }),
      Reserve.count(),
    ]);

    const serializedHotels = hotels
      .map((hotel) => serializeHotel(hotel, provinceMap))
      .sort((a, b) => b.stars - a.stars || (a.startingPrice ?? Infinity) - (b.startingPrice ?? Infinity));

    const destinationMap = new Map();
    for (const hotel of serializedHotels) {
      if (!hotel.province) continue;
      const current = destinationMap.get(hotel.province.id) || {
        id: hotel.province.id,
        name: hotel.province.name,
        hotelCount: 0,
        startingPrice: null,
        cover: null,
      };
      current.hotelCount += 1;
      current.cover ||= hotel.cover || hotel.images[0]?.url || null;
      if (
        hotel.startingPrice !== null &&
        (current.startingPrice === null || hotel.startingPrice < current.startingPrice)
      ) {
        current.startingPrice = hotel.startingPrice;
      }
      destinationMap.set(hotel.province.id, current);
    }

    const popularDestinations = [...destinationMap.values()]
      .sort(
        (a, b) =>
          b.hotelCount - a.hotelCount ||
          (a.startingPrice ?? Infinity) - (b.startingPrice ?? Infinity),
      )
      .slice(0, 8);
    const prices = serializedHotels
      .map((hotel) => hotel.startingPrice)
      .filter((price) => price !== null);

    const data = {
      stats: {
        totalHotels: serializedHotels.length,
        totalRooms,
        totalReservations,
        totalDestinations: destinationMap.size,
        lowestNightlyPrice: prices.length ? Math.min(...prices) : null,
      },
      featuredHotels: serializedHotels.slice(0, 8),
      popularDestinations,
    };

    await writeCache(OVERVIEW_CACHE_KEY, data);
    res.set("X-Cache", "MISS");
    return successResponse(res, 200, "", data);
  } catch (error) {
    next(error);
  }
};

exports.getFilters = async (req, res, next) => {
  try {
    const cached = await readCache(FILTERS_CACHE_KEY);
    if (cached) {
      res.set("X-Cache", "HIT");
      return successResponse(res, 200, "", cached);
    }

    const [provinces, hotels, amenities, rooms, amenityLinks] = await Promise.all([
      Province.findAll({
        attributes: ["id", "name"],
        order: [["name", "ASC"]],
        raw: true,
      }),
      Hotel.findAll({ attributes: ["id", "city", "stars"], raw: true }),
      Amenity.findAll({
        where: { isActive: true },
        attributes: ["id", "title", "description"],
        order: [["title", "ASC"]],
        raw: true,
      }),
      Room.findAll({
        where: { status: { [Op.ne]: "MAINTAIN" } },
        attributes: ["price", "capacity"],
        raw: true,
      }),
      HotelAmenity.findAll({
        attributes: ["hotelId", "amenityId"],
        raw: true,
      }),
    ]);

    const activeHotelIds = new Set(hotels.map((hotel) => hotel.id));
    const hotelsPerProvince = new Map();
    const hotelsPerStar = new Map();
    for (const hotel of hotels) {
      hotelsPerProvince.set(hotel.city, (hotelsPerProvince.get(hotel.city) || 0) + 1);
      hotelsPerStar.set(Number(hotel.stars), (hotelsPerStar.get(Number(hotel.stars)) || 0) + 1);
    }

    const hotelsPerAmenity = new Map();
    for (const link of amenityLinks) {
      if (!activeHotelIds.has(link.hotelId)) continue;
      hotelsPerAmenity.set(
        link.amenityId,
        (hotelsPerAmenity.get(link.amenityId) || 0) + 1,
      );
    }

    const prices = rooms.map((room) => room.price);
    const capacities = [...new Set(rooms.map((room) => room.capacity))].sort(
      (a, b) => a - b,
    );
    const data = {
      destinations: provinces.map((province) => ({
        value: province.id,
        label: province.name,
        hotelCount: hotelsPerProvince.get(province.id) || 0,
      })),
      amenities: amenities.map((amenity) => ({
        value: amenity.id,
        label: amenity.title,
        description: amenity.description,
        hotelCount: hotelsPerAmenity.get(amenity.id) || 0,
      })),
      stars: [5, 4, 3, 2, 1].map((value) => ({
        value,
        label: `${value} stars`,
        hotelCount: hotelsPerStar.get(value) || 0,
      })),
      capacities,
      priceRange: {
        min: prices.length ? Math.min(...prices) : 0,
        max: prices.length ? Math.max(...prices) : 0,
        currency: "TOMAN",
      },
      metroAccess: [
        { value: "YES", label: "دسترسی به مترو" },
        { value: "NO", label: "بدون دسترسی به مترو" },
      ],
      sortOptions: [
        { value: "recommended", label: "پیشنهاد هُما" },
        { value: "price_asc", label: "کمترین قیمت" },
        { value: "price_desc", label: "بیشترین قیمت" },
        { value: "stars_desc", label: "بیشترین ستاره" },
        { value: "newest", label: "جدیدترین" },
        { value: "name_asc", label: "نام هتل" },
      ],
    };

    await writeCache(FILTERS_CACHE_KEY, data);
    res.set("X-Cache", "MISS");
    return successResponse(res, 200, "", data);
  } catch (error) {
    next(error);
  }
};

exports.searchHotels = async (req, res, next) => {
  let filters;
  try {
    filters = parseSearchQuery(req.query);
  } catch (error) {
    if (error instanceof LandingQueryError) {
      return errorResponse(res, 400, error.message);
    }
    return next(error);
  }

  try {
    const hotelWhere = {};

    if (filters.provinceId) hotelWhere.city = filters.provinceId;
    if (filters.stars.length) hotelWhere.stars = { [Op.in]: filters.stars.map(String) };
    if (filters.metroAccess) hotelWhere.metroAccess = filters.metroAccess;

    if (filters.destination) {
      const matchingProvinces = await Province.findAll({
        where: { name: { [Op.like]: `%${filters.destination}%` } },
        attributes: ["id"],
        raw: true,
      });
      const destinationConditions = [
        { name: { [Op.like]: `%${filters.destination}%` } },
        { address: { [Op.like]: `%${filters.destination}%` } },
        { slug: { [Op.like]: `%${filters.destination}%` } },
      ];
      if (matchingProvinces.length) {
        destinationConditions.push({
          city: { [Op.in]: matchingProvinces.map((province) => province.id) },
        });
      }
      hotelWhere[Op.or] = destinationConditions;
    }

    if (filters.amenityIds.length) {
      const links = await HotelAmenity.findAll({
        where: { amenityId: { [Op.in]: filters.amenityIds } },
        attributes: ["hotelId", "amenityId"],
        raw: true,
      });
      const matches = new Map();
      for (const link of links) {
        if (!matches.has(link.hotelId)) matches.set(link.hotelId, new Set());
        matches.get(link.hotelId).add(link.amenityId);
      }
      const matchingHotelIds = [...matches.entries()]
        .filter(([, amenityIds]) => amenityIds.size === filters.amenityIds.length)
        .map(([hotelId]) => hotelId);
      if (!matchingHotelIds.length) {
        return successResponse(res, 200, "", emptySearchResult(filters));
      }
      hotelWhere.id = { [Op.in]: matchingHotelIds };
    }

    const roomWhere = { status: { [Op.ne]: "MAINTAIN" } };
    if (filters.capacity) roomWhere.capacity = { [Op.gte]: filters.capacity };
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      roomWhere.price = {};
      if (filters.minPrice !== undefined) roomWhere.price[Op.gte] = filters.minPrice;
      if (filters.maxPrice !== undefined) roomWhere.price[Op.lte] = filters.maxPrice;
    }

    if (filters.checkIn && filters.checkOut) {
      const reservedRooms = await Reserve.findAll({
        where: {
          startDate: { [Op.lt]: filters.checkOut },
          endDate: { [Op.gt]: filters.checkIn },
        },
        attributes: ["roomId"],
        raw: true,
      });
      const reservedRoomIds = [...new Set(reservedRooms.map((reserve) => reserve.roomId))];
      if (reservedRoomIds.length) roomWhere.id = { [Op.notIn]: reservedRoomIds };
    }

    const roomFilterInclude = {
      model: Room,
      attributes: [],
      where: roomWhere,
      required: true,
    };
    const offset = (filters.page - 1) * filters.limit;
    const order = [...getSearchOrder(filters.sort), ["id", "ASC"]];

    const [totalItems, pageRows] = await Promise.all([
      Hotel.count({
        where: hotelWhere,
        include: [roomFilterInclude],
        distinct: true,
        col: "id",
      }),
      Hotel.findAll({
        attributes: [
          "id",
          [fn("MIN", col("Rooms.price")), "startingPrice"],
          [fn("COUNT", fn("DISTINCT", col("Rooms.id"))), "matchingRoomCount"],
        ],
        where: hotelWhere,
        include: [roomFilterInclude],
        group: ["Hotel.id"],
        order,
        limit: filters.limit,
        offset,
        subQuery: false,
        raw: true,
      }),
    ]);

    if (!pageRows.length) {
      return successResponse(res, 200, "", emptySearchResult(filters));
    }

    const ids = pageRows.map((row) => row.id);
    const [hotels, provinceMap] = await Promise.all([
      Hotel.findAll({
        where: { id: { [Op.in]: ids } },
        attributes: [
          "id",
          "name",
          "slug",
          "cover",
          "stars",
          "city",
          "address",
          "description",
          "metroAccess",
          "geometry",
        ],
        include: [
          {
            model: Room,
            attributes: ["id", "name", "slug", "capacity", "price", "status"],
            where: roomWhere,
            required: true,
          },
          {
            model: Amenity,
            as: "amenities",
            attributes: ["id", "title", "description"],
            through: { attributes: [] },
            where: { isActive: true },
            required: false,
          },
          {
            model: HotelImage,
            as: "images",
            attributes: ["id", "url", "order", "isCover"],
            required: false,
          },
        ],
      }),
      loadProvinceMap(),
    ]);

    const hotelMap = new Map(hotels.map((hotel) => [hotel.id, hotel]));
    const hotelsInOrder = pageRows
      .map((row) => {
        const hotel = hotelMap.get(row.id);
        return hotel ? serializeHotel(hotel, provinceMap, row) : null;
      })
      .filter(Boolean);

    return successResponse(res, 200, "", {
      hotels: hotelsInOrder,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        totalItems,
        totalPages: Math.ceil(totalItems / filters.limit),
      },
      activeFilters: filters,
    });
  } catch (error) {
    next(error);
  }
};

exports.getHotelDetails = async (req, res, next) => {
  let filters;
  try {
    filters = parseSearchQuery({ ...req.query, page: 1, limit: 50 });
  } catch (error) {
    if (error instanceof LandingQueryError) {
      return errorResponse(res, 400, error.message);
    }
    return next(error);
  }

  try {
    const roomWhere = { status: { [Op.ne]: "MAINTAIN" } };
    if (filters.capacity) roomWhere.capacity = { [Op.gte]: filters.capacity };

    if (filters.checkIn && filters.checkOut) {
      const reservedRooms = await Reserve.findAll({
        where: {
          startDate: { [Op.lt]: filters.checkOut },
          endDate: { [Op.gt]: filters.checkIn },
        },
        attributes: ["roomId"],
        raw: true,
      });
      const reservedRoomIds = [...new Set(reservedRooms.map((reserve) => reserve.roomId))];
      if (reservedRoomIds.length) roomWhere.id = { [Op.notIn]: reservedRoomIds };
    }

    const [hotel, provinceMap] = await Promise.all([
      Hotel.findOne({
        where: { slug: req.params.slug },
        attributes: [
          "id",
          "name",
          "slug",
          "cover",
          "stars",
          "city",
          "address",
          "description",
          "metroAccess",
          "geometry",
        ],
        include: [
          {
            model: Room,
            attributes: [
              "id",
              "name",
              "slug",
              "capacity",
              "price",
              "status",
              "bookType",
              "bathService",
              "balcony",
              "geoDirection",
              "kitchen",
              "description",
            ],
            where: roomWhere,
            required: false,
          },
          {
            model: Amenity,
            as: "amenities",
            attributes: ["id", "title", "description"],
            through: { attributes: [] },
            where: { isActive: true },
            required: false,
          },
          {
            model: HotelImage,
            as: "images",
            attributes: ["id", "url", "order", "isCover"],
            required: false,
          },
        ],
      }),
      loadProvinceMap(),
    ]);

    if (!hotel) return errorResponse(res, 404, "Hotel not found.");

    return successResponse(res, 200, "", {
      hotel: serializeHotel(hotel, provinceMap),
      availability: {
        checkIn: filters.checkIn || null,
        checkOut: filters.checkOut || null,
        capacity: filters.capacity || 1,
      },
    });
  } catch (error) {
    next(error);
  }
};
