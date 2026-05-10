const { Op } = require("sequelize");
const Hotel = require("../../models/v1/Hotel.model");
const Room = require("../../models/v1/Room.model");
const Reserve = require("../../models/v1/Reserve.model");
const { errorResponse, successResponse } = require("../../utils/responses");

exports.getStats = async (req, res, next) => {
  try {
    const { from, to } = req.query;

    const today = new Date().toISOString().slice(0, 10);
    const firstReserve = await Reserve.findOne({
      attributes: ["startDate"],
      order: [["startDate", "ASC"]],
      raw: true,
    });

    const defaultFrom = firstReserve?.startDate || today;
    const finalFrom = from || defaultFrom;
    const finalTo = to || today;

    const fromDate = new Date(finalFrom);
    const toDate = new Date(finalTo);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      return errorResponse(res, 400, "فرمت تاریخ نامعتبر است.");
    }

    if (fromDate > toDate) {
      return errorResponse(res, 400, "پارامتر from باید کوچک‌تر یا مساوی to باشد.");
    }

    const rangeFilter = {
      startDate: {
        [Op.between]: [finalFrom, finalTo],
      },
    };

    const reservesInRangeList = await Reserve.findAll({
      where: rangeFilter,
      attributes: ["startDate"],
      raw: true,
    });

    const timelineMap = {};
    for (const reserve of reservesInRangeList) {
      timelineMap[reserve.startDate] = (timelineMap[reserve.startDate] || 0) + 1;
    }

    const reservesTimeline = Object.entries(timelineMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const [totalHotels, totalRooms, totalReserves, reservesInRange] =
      await Promise.all([
        Hotel.count(),
        Room.count(),
        Reserve.count(),
        Reserve.count({ where: rangeFilter }),
      ]);

    return successResponse(res, 200, "", {
      totalHotels,
      totalRooms,
      totalReserves,
      reservesInRange,
      reservesTimeline,
      dateRange: {
        from: finalFrom,
        to: finalTo,
      },
    });
  } catch (err) {
    next(err);
  }
};
