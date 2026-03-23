const Room = require("../../models/v1/Room.model");
const { errorResponse, successResponse } = require("../../utils/responses");
const { createRoomValidator } = require("../../validators/room.validator");

exports.create = async (req, res, next) => {
  try {
    const { slug, hotel_id } = req.body;

    await createRoomValidator.validate(req.body, { abortEarly: false });
    const roomExists = await Room.findOne({
      where: {
        slug,
        hotel_id,
      },
    });

    if (roomExists !== null) {
      return errorResponse(res, 404, "room already exists.");
    }

    await Room.create(req.body);
    return successResponse(res, 201, "room created successfully.");
  } catch (err) {
    next(err);
  }
};
