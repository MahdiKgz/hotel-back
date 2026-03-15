const User = require("../../models/v1/User.model");
const redis = require("../../redis");
const {
  generateToken,
  generateOtp,
  getOtpDetails,
  getOtpRedisPattern,
} = require("../../utils/auth");
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

    const user = await User.findOne({
      where: {
        phone,
      },
    });

    console.log("user => ", user);

    if (user === null) {
      return errorResponse(res, 404, "User not found !!");
    }

    const { expired, remainingTime } = await getOtpDetails(phone);

    if (!expired) {
      return successResponse(res, 200, {
        message: `OTP already sent, Please try again after ${remainingTime}`,
      });
    }

    const otp = await generateOtp(phone);

    return successResponse(
      res,
      200,
      { message: "otp sent successfully :))" },
      { otp },
    );
  } catch (err) {
    next(err);
  }
};

exports.verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    const savedOtp = await redis.get(getOtpRedisPattern(phone));

    if (!savedOtp) {
      return errorResponse(res, 400, "Wrong or expired OTP");
    }

    const otpIsCorrect = await bcrypt.compare(otp, savedOtp);

    if (!otpIsCorrect) {
      return errorResponse(res, 400, "Wrong or expired OTP !!");
    }

    const existingUser = await User.findOne({
      where: {
        phone,
      },
    });
    if (existingUser === null) {
      return errorResponse(
        res,
        404,
        "No such user is available , Register first !!",
      );
    }

    const token = generateToken({ phone });

    return successResponse(res, 200, "You have logged in Successfully !!", {
      user: existingUser,
      token,
    });
  } catch (err) {
    next(err);
  }
};
