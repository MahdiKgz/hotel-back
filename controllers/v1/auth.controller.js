const User = require("../../models/v1/User.model");
const { generateToken } = require("../../utils/auth");
const { errorResponse, successResponse } = require("../../utils/responses");
const { registerValidator } = require("../../validators/auth.validator");

exports.register = async (req, res, next) => {
  try {
    const { phone } = req.body;
    await registerValidator.validate(req.body, { abortEarly: false });

    const existingUser = await User.findOne({
      where: {
        phone,
      },
    });
    if (existingUser) {
      return errorResponse(res, 400, "User already exists !!");
    }

    await User.create(req.body);

    const token = generateToken({ phone });
    return successResponse(res, 201, "User created successfully !!", {
      phone,
      token,
    });
  } catch (err) {
    next(err);
  }
};
