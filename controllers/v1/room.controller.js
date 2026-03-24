const Hotel = require("../../models/v1/Hotel.model");
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

exports.remove = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const room = await Room.findOne({
      where: {
        slug,
      },
    });

    if (room === null) {
      return errorResponse(res, 400, "room NOT found !!");
    }

    await room.destroy({ where: { slug } });

    return successResponse(res, 200, "room deleted successfully!!");
  } catch (err) {
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const { slug } = req.params;

    await createRoomValidator.validate(req.body, { abortEarly: false });
    const room = await Room.findOne({
      where: { slug },
    });

    if (room === null) {
      return errorResponse(res, 400, "room NOT found !!");
    }

    await room.update({ ...req.body }, { where: { slug } });
    return successResponse(res, 200, "Room updated successfully !!");
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const room = await Room.findOne({
      where: {
        slug,
      },
      include: {
        model: Hotel,
        attributes: ["id", "name"],
        as: "hotel",
      },
    });

    if (room === null) {
      return errorResponse(res, 404, "room NOT found !!");
    }

    return successResponse(res, 200, "", { room });
  } catch (err) {
    next(err);
  }
};
