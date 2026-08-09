const { where } = require("sequelize");
const Amenity = require("../../models/v1/Amenity.model");
const Hotel = require("../../models/v1/Hotel.model");
const HotelAmenity = require("../../models/v1/HotelAmenity.model");
const HotelImage = require("../../models/v1/HotelImages.model");
const Room = require("../../models/v1/Room.model");
const User = require("../../models/v1/User.model");
const { errorResponse, successResponse } = require("../../utils/responses");
const {
  createHotelValidator,
  updateHotelValidator,
} = require("../../validators/hotel.validator");

const fs = require("fs");

exports.create = async (req, res, next) => {
  try {
    let { slug, manager_id } = req.body;
    await createHotelValidator.validate(
      { ...req.body, manager_id: req.user.id },
      { abortEarly: false },
    );

    const hotel = await Hotel.findOne({
      where: {
        slug,
      },
    });

    const isAlreadyExistsWithManager = await Hotel.findOne({
      where: {
        manager_id: manager_id ?? req.user.id,
      },
    });

    if (isAlreadyExistsWithManager !== null) {
      errorResponse(res, 400, "manager already has one active hotel.");
    }
    if (hotel !== null) {
      return errorResponse(res, 400, "Hotel already exists");
    }

    await Hotel.create({ ...req.body, manager_id: manager_id ?? req.user.id });
    return successResponse(res, 201, "Hotel Created successfully !!");
  } catch (err) {
    next(err);
  }
};

exports.getAll = async (req, res, next) => {
  try {
    const hotels = await Hotel.findAll({
      attributes: ["id", "name", "slug", "stars", "geometry"],
    });

    if (hotels === null) {
      return errorResponse(res, 404, "NO hotel found !!");
    }

    return successResponse(res, 200, "", { hotels });
  } catch (err) {
    next(err);
  }
};

exports.getOneHotel = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const hotel = await Hotel.findOne({
      where: {
        slug,
      },
      include: [
        {
          model: User,
          as: "manager",
          attributes: ["id", "full_name", "phone", "role", "avatar"],
        },
      ],
    });
    return successResponse(res, 200, "", { hotel });
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { slug } = req.params;

    await updateHotelValidator.validate(req.body, { abortEarly: false });

    const hotel = await Hotel.findOne({
      where: {
        slug,
      },
    });

    if (hotel === null) {
      return errorResponse(res, 400, "Hotel NOT found !!!");
    }

    await Hotel.update(
      { ...req.body },
      {
        where: {
          slug,
        },
      },
    );

    return successResponse(res, 200, "Hotel updated successfully !!");
  } catch (err) {
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const hotel = await Hotel.findOne({
      where: {
        slug,
      },
    });
    if (hotel === null) {
      return errorResponse(res, 404, "Hotel NOT found !!");
    }

    await Hotel.destroy({
      where: {
        slug,
      },
    });
    return successResponse(res, 200, "Hotel removed successfully !!");
  } catch (err) {
    next(err);
  }
};

exports.setCover = async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!req.file) {
      return errorResponse(res, 400, "Cover has not been uploaded !!");
    }

    const { path } = req.file;

    const { cover } = await Hotel.findOne({
      where: { slug },
      raw: true,
    });

    if (cover !== null) {
      fs.unlink(cover, (err) => next(err));
    }

    await Hotel.update({ cover: path }, { where: { slug } });

    return successResponse(res, 200, "Cover has been set successfully !!");
  } catch (err) {
    next(err);
  }
};

exports.setImages = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const hotel = await Hotel.findOne({
      where: {
        slug,
      },
      raw: true,
    });

    if (hotel === null) {
      return errorResponse(res, 400, "Hotel NOT found !!");
    }

    if (!req.files.length || req.files.length > 10) {
      return errorResponse(
        res,
        400,
        "You may not upload any file or You have uploaded more than 10 images",
      );
    }

    const images = req.files.map((image, index) => ({
      url: image.path,
      order: index + 1,
      isCover: false,
      hotel_id: hotel.id,
    }));

    const hasImages = await HotelImage.findAll({
      where: { hotel_id: hotel.id },
    });

    if (!hasImages.length) {
      hasImages.map(({ url }) => fs.unlink(url, (err) => next(err)));
    }

    await HotelImage.bulkCreate(images);

    return successResponse(
      res,
      201,
      "Images have been uploaded successfully !!",
    );
  } catch (err) {
    next(err);
  }
};

exports.getRooms = async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const rooms = await Room.findAll({
      where: {
        hotel_id: hotelId,
      },
    });

    return successResponse(res, 200, "", { rooms });
  } catch (err) {
    next(err);
  }
};

exports.addAmenityToHotel = async (req, res, next) => {
  try {
    const { hotelId } = req.params;
    const { amenities } = req.body;

    await HotelAmenity.destroy({
      where: { hotelId },
    });

    const bulkAmenities = amenities.map((amenity) => ({
      hotelId: +hotelId,
      amenityId: amenity,
    }));

    await HotelAmenity.bulkCreate(bulkAmenities);

    return successResponse(res, 201, "امکانات با موفقیت افزوده شدند.");
  } catch (err) {
    next(err);
  }
};

exports.getHotelAmenity = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findOne({
      where: { id: hotelId },
      include: [
        {
          model: Amenity,
          as: "amenities",
          through: { attributes: [] },
          attributes: ["id", "title", "isActive", "description"],
        },
      ],
    });

    if (!hotel || !hotel.amenities.length) {
      return errorResponse(res, 400, "برای این هتل امکاناتی ثبت نشده است");
    }

    return successResponse(res, 200, "", { amenities: hotel.amenities });
  } catch (err) {
    next(err);
  }
};

exports.deleteOneAmenity = async (req, res, next) => {
  try {
    const { hotelId, amenityId } = req.params;

    const hotel = await Hotel.findOne({ where: { id: +hotelId } });
    if (hotel === null) {
      return errorResponse(res, 404, "هتل یافت نشد.");
    }

    const amenity = await Amenity.findOne({ where: { id: +amenityId } });
    if (amenity === null) {
      return errorResponse(res, 404, "امکانات موردنظر یافت نشد.");
    }

    const hotelAmenity = await HotelAmenity.findOne({
      where: {
        hotelId: +hotelId,
        amenityId: +amenityId,
      },
    });
    if (hotelAmenity === null) {
      return errorResponse(res, 404, "این امکان برای هتل ثبت نشده است.");
    }

    await HotelAmenity.destroy({
      where: {
        hotelId: +hotelId,
        amenityId: +amenityId,
      },
    });

    return successResponse(res, 200, "امکانات با موفقیت از این هتل حذف شد.");
  } catch (err) {
    next(err);
  }
};

exports.createHotelGeometry = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findOne({ where: { id: hotelId } });

    if (hotel === null) {
      return errorResponse(res, 404, "هتل یافت نشد");
    }

    await hotel.update({ geometry: req.body }, { where: { id: hotelId } });
    return successResponse(res, 200, "موقعیت جغرافیایی با موفقیت ثبت شد.");
  } catch (err) {
    next();
  }
};

exports.getHotelGeometry = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    const hotel = await Hotel.findOne({ where: { id: hotelId }, raw: true });

    if (hotel === null) {
      return errorResponse(res, 404, "هتل یافت نشد.");
    }

    return successResponse(res, 200, "", { ...hotel.geometry });
  } catch (err) {
    next(err);
  }
};
