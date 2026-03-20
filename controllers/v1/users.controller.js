const { Op } = require("sequelize");
const User = require("../../models/v1/User.model");
const { successResponse, errorResponse } = require("../../utils/responses");
const Ban = require("../../models/v1/Ban.model");

exports.getAll = async (req, res, next) => {
  try {
    const { phone } = req.user;
    const users = await User.findAll({
      attributes: ["id", "full_name", "phone", "email", "role"],
      where: { phone: { [Op.ne]: phone } },
    });

    return successResponse(res, 200, "", { users });
  } catch (err) {
    next(err);
  }
};

exports.getOne = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({
      where: {
        id,
      },
      attributes: ["full_name", "phone", "email", "address", "bio", "role"],
    });

    if (user === null) {
      return errorResponse(res, 404, "User NOT found !!");
    }

    return successResponse(res, 200, "", { user });
  } catch (err) {
    next(err);
  }
};

exports.ban = async (req, res, next) => {
  try {
    const { id } = req.params;

    const user = await User.findOne({
      where: { id },
      raw: true,
    });

    if (user === null) {
      return errorResponse(res, 404, "User NOT found !!");
    }

    const isAlreadyBanned = await Ban.findOne({
      where: { phone: user.phone },
    });

    if (isAlreadyBanned !== null) {
      return errorResponse(res, 400, "User is already banned !!");
    }

    await Ban.create({ phone: user.phone });
    await User.destroy({ where: { id } });

    return successResponse(res, 200, "User banned successfully !!");
  } catch (err) {
    next(err);
  }
};
