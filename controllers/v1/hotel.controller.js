const Hotel = require("../../models/v1/Hotel.model");
const User = require("../../models/v1/User.model");
const { errorResponse, successResponse } = require("../../utils/responses");
const { createHotelValidator } = require("../../validators/hotel.validator");

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
