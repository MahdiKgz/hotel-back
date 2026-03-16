const Hotel = require("../../models/v1/Hotel.model");
const Room = require("../../models/v1/Room.model");
const User = require("../../models/v1/User.model");
const { errorResponse, successResponse } = require("../../utils/responses");
const {
  createHotelValidator,
  updateHotelValidator,
} = require("../../validators/hotel.validator");

exports.create = async (req, res, next) => {
  try {
    const { slug } = req.body;
    await createHotelValidator.validate(
      { ...req.body, manager_id: req.user.id },
      { abortEarly: false },
    );

    const hotel = await Hotel.findOne({
      where: {
        slug,
      },
    });

    if (hotel !== null) {
      return errorResponse(res, 400, "Hotel already exists");
    }

    await Hotel.create({ ...req.body, manager_id: req.user.id });
    return successResponse(res, 201, "Hotel Created successfully !!");
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
