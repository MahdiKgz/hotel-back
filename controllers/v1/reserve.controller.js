const Hotel = require("../../models/v1/Hotel.model");
const Reserve = require("../../models/v1/Reserve.model");
const Room = require("../../models/v1/Room.model");
const User = require("../../models/v1/User.model");
const { errorResponse, successResponse } = require("../../utils/responses");
const {
  createReservationValidator,
} = require("../../validators/reserve.validator");

exports.createReserve = async (req, res, next) => {
  try {
    const { roomId } = req.body;
    await createReservationValidator.validate(req.body, { abortEarly: false });

    const hasReserved = await Reserve.findOne({
      where: {
        room_id: roomId,
      },
      raw: true,
    });

    if (hasReserved !== null) {
      return errorResponse(res, 404, "اتاق در حال حاضر رزرو است.");
    }

    await Reserve.create(req.body);
    await Room.update({ status: "RESERVED" }, { where: { id: roomId } });
    return successResponse(res, 201, "اتاق با موفقیت رزرو شد");
  } catch (err) {
    next(err);
  }
};

exports.getOneHotelReserves = async (req, res, next) => {
  try {
    const { hotelId } = req.params;

    const reserves = await Reserve.findAll({
      where: {
        hotelId,
      },
      include: [
        {
          model: Room,
          as: "room",
          attributes: ["id", "name", "slug"],
        },
        {
          model: User,
          as: "user",
          attributes: ["id", "fullName", "phone", "avatar"],
        },
        {
          model: Hotel,
          as: "hotel",
          attributes: ["id", "name", "slug", "cover"],
        },
      ],
    });

    let message = reserves.length > 0 ? "" : "هیچ  رزروی پیدا نشد.";

    return successResponse(res, 200, message, { reserves });
  } catch (err) {
    next(err);
  }
};
