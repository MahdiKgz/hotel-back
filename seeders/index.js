require("dotenv").config();

const bcrypt = require("bcryptjs");
const {
  db,
  User,
  Province,
  Amenity,
  Hotel,
  Room,
  HotelAmenity,
  Reserve,
} = require("../models");
const { provinces, users, amenities, hotels } = require("./data");

const SEED_PASSWORD = "Hotel@123";

async function seedDatabase({ closeConnection = true } = {}) {
  await db.authenticate();
  await db.sync();

  const provinceMap = new Map();
  for (const name of provinces) {
    const [province] = await Province.findOrCreate({ where: { name } });
    provinceMap.set(name, province);
  }

  const password = await bcrypt.hash(SEED_PASSWORD, 12);
  const userMap = new Map();
  for (const data of users) {
    const [user, created] = await User.findOrCreate({
      where: { phone: data.phone },
      defaults: { ...data, password },
    });
    if (!created) {
      await user.update({
        fullName: data.fullName,
        email: data.email,
        role: data.role,
      });
    }
    userMap.set(data.phone, user);
  }

  const amenityMap = new Map();
  for (const data of amenities) {
    const [amenity] = await Amenity.findOrCreate({
      where: { title: data.title },
      defaults: { ...data, isActive: true },
    });
    await amenity.update({ description: data.description, isActive: true });
    amenityMap.set(data.title, amenity);
  }

  const hotelMap = new Map();
  const roomMap = new Map();
  for (const data of hotels) {
    const province = provinceMap.get(data.province);
    const manager = userMap.get(data.managerPhone);
    const [hotel] = await Hotel.findOrCreate({
      where: { slug: data.slug },
      defaults: {
        name: data.name,
        slug: data.slug,
        country: 1,
        city: province.id,
        address: data.address,
        postalCode: data.postalCode,
        stars: data.stars,
        geometry: data.geometry,
        metroAccess: data.metroAccess,
        description: data.description,
        manager_id: manager.id,
      },
    });
    await hotel.update({
      name: data.name,
      city: province.id,
      address: data.address,
      postalCode: data.postalCode,
      stars: data.stars,
      geometry: data.geometry,
      metroAccess: data.metroAccess,
      description: data.description,
      manager_id: manager.id,
    });
    hotelMap.set(data.slug, hotel);

    for (const roomData of data.rooms) {
      const [room] = await Room.findOrCreate({
        where: { slug: roomData.slug },
        defaults: {
          ...roomData,
          status: "EMPTY",
          bookType: "DAILY",
          bathService: 1,
          balcony: 1,
          geoDirection: "SOUTH",
          kitchen: "NO",
          description: "اتاق مجهز با امکان تأیید فوری رزرو.",
          hotel_id: hotel.id,
        },
      });
      await room.update({
        capacity: roomData.capacity,
        price: roomData.price,
        hotel_id: hotel.id,
      });
      roomMap.set(roomData.slug, room);
    }

    for (const title of data.amenities) {
      const amenity = amenityMap.get(title);
      await HotelAmenity.findOrCreate({
        where: { hotelId: hotel.id, amenityId: amenity.id },
        defaults: { hotelId: hotel.id, amenityId: amenity.id },
      });
    }
  }

  const guest = userMap.get("09120000007");
  const sampleReserves = [
    { hotel: "espinas-palace", room: "espinas-standard", startDate: "2026-08-18", endDate: "2026-08-20" },
    { hotel: "zandiyeh-shiraz", room: "zandiyeh-double", startDate: "2026-09-03", endDate: "2026-09-06" },
  ];
  for (const data of sampleReserves) {
    const hotel = hotelMap.get(data.hotel);
    const room = roomMap.get(data.room);
    await Reserve.findOrCreate({
      where: {
        hotelId: hotel.id,
        roomId: room.id,
        userId: guest.id,
        startDate: data.startDate,
        endDate: data.endDate,
      },
      defaults: { note: "رزرو نمونه ایجادشده توسط seeder" },
    });
  }

  const summary = {
    provinces: await Province.count(),
    users: await User.count(),
    amenities: await Amenity.count(),
    hotels: await Hotel.count(),
    rooms: await Room.count(),
    reserves: await Reserve.count(),
  };

  console.log("Database seed completed:", summary);
  console.log("Seed login: 09120000001 / " + SEED_PASSWORD);

  if (closeConnection) await db.close();
  return summary;
}

if (require.main === module) {
  seedDatabase().catch(async (error) => {
    console.error("Database seed failed:", error);
    await db.close();
    process.exitCode = 1;
  });
}

module.exports = seedDatabase;
