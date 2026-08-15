const { Op } = require("sequelize");
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
    const { roomId, hotelId, startDate, endDate, note } = req.body;
    const { id } = req.user;
    await createReservationValidator.validate(req.body, { abortEarly: false });

    const room = await Room.findOne({
      where: {
        id: roomId,
        hotel_id: hotelId,
      },
    });

    if (!room || room.status === "MAINTAIN") {
      return errorResponse(res, 404, "اتاق انتخاب‌شده در دسترس نیست.");
    }

    const hasReserved = await Reserve.findOne({
      where: {
        roomId,
        startDate: { [Op.lt]: endDate },
        endDate: { [Op.gt]: startDate },
      },
      raw: true,
    });

    if (hasReserved !== null) {
      return errorResponse(res, 409, "این اتاق در تاریخ انتخابی رزرو شده است.");
    }

    const reservation = await Reserve.create({
      roomId,
      hotelId,
      userId: id,
      startDate,
      endDate,
      note,
    });
    return successResponse(res, 201, "اتاق با موفقیت رزرو شد", {
      reservation: {
        id: reservation.id,
        hotelId: reservation.hotelId,
        roomId: reservation.roomId,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        note: reservation.note,
        createdAt: reservation.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMyReserves = async (req, res, next) => {
  try {
    const reserves = await Reserve.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Room,
          as: "room",
          attributes: ["id", "name", "slug", "capacity", "price"],
        },
        {
          model: Hotel,
          as: "hotel",
          attributes: ["id", "name", "slug", "cover", "address", "stars"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return successResponse(res, 200, "", { reserves });
  } catch (err) {
    next(err);
  }
};

exports.cancelMyReserve = async (req, res, next) => {
  try {
    const reservation = await Reserve.findOne({
      where: { id: req.params.reservationId, userId: req.user.id },
    });

    if (!reservation) {
      return errorResponse(res, 404, "رزرو مورد نظر پیدا نشد.");
    }

    const today = new Date().toISOString().slice(0, 10);
    if (reservation.startDate <= today) {
      return errorResponse(res, 400, "رزروی که شروع شده است قابل لغو نیست.");
    }

    await reservation.destroy();
    return successResponse(res, 200, "رزرو با موفقیت لغو شد.");
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

exports.cancelReserve = async (req, res, next) => {
  try {
    const { roomId } = req.params;
    await Reserve.destroy({ where: { room_id: roomId } });
    await Room.update({ status: "EMPTY" }, { where: { id: roomId } });

    return successResponse(res, 200, "رزرو لغو شد.");
  } catch (err) {
    next(err);
  }
};
