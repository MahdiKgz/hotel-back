const User = require("../../models/v1/User.model");
const redis = require("../../redis");
const { generateToken, createOtp } = require("../../utils/auth");
const { errorResponse, successResponse } = require("../../utils/responses");
const { registerValidator } = require("../../validators/auth.validator");

const bcrypt = require("bcryptjs");

exports.register = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    await registerValidator.validate(req.body, { abortEarly: false });

    const existingUser = await User.findOne({
      where: {
        phone,
      },
    });
    if (existingUser) {
      return errorResponse(res, 400, "User already exists !!");
    }
    const hashedPassword = await bcrypt.hash(password, 12);

    await User.create({ ...req.body, password: hashedPassword });

    const token = generateToken({ phone });
    const otp = createOtp(phone);
    return successResponse(res, 201, "User created successfully !!", {
      phone,
      token,
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    const existingUser = await User.findOne({ phone });

    if (existingUser === null) {
      return errorResponse(res, 404, "User not found !!");
    }

    const isPasswordMatched = await bcrypt.compare(
      password,
      existingUser.password,
    );

    if (!isPasswordMatched) {
      return errorResponse(res, 400, "Username or password is incorrect !!");
    }

    const token = generateToken({ phone });
    return successResponse(res, 200, "You have logged in successfully !!", {
      phone,
      token,
    });
  } catch (err) {
    next(err);
  }
};

exports.sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body;
    const existingUser = User.findOne({
      where: {
        phone,
      },
    });

    if (existingUser === null) {
      return errorResponse(res, 404, "User not found !!");
    }
    const { otp } = await createOtp(phone, 6);

    return successResponse(res, 200, "OTP created successfully", { otp });
  } catch (err) {
    next(err);
  }
};
