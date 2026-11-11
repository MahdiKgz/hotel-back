const fs = require("fs");
const db = require("../../configs/db");
const Recovery = require("../../models/v1/AccountRecovery.model");
const User = require("../../models/v1/User.model");
const redis = require("../../redis");
const {
  generateToken,
  generateOtp,
  getOtpDetails,
  getOtpRedisPattern,
} = require("../../utils/auth");
const { errorResponse, successResponse } = require("../../utils/responses");
const {
  registerValidator,
  updateValidator,
} = require("../../validators/auth.validator");

const bcrypt = require("bcryptjs");
const Ban = require("../../models/v1/Ban.model");

const demoOtpEnabled = () => process.env.NODE_ENV !== "production" && process.env.ENABLE_DEMO_SMS_OTP === "true";

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

    const { fullName, email, address, bio } = req.body;
    const user = await User.create({ fullName, phone, email, address, bio, role: "GUEST", password: hashedPassword });

    const token = generateToken(user);
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

    const isBanned = await Ban.findOne({
      where: { phone },
    });

    if (isBanned !== null) {
      return errorResponse(res, 400, "You are banned.");
    }

    const existingUser = await User.findOne({ where: { phone } });

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

    const token = generateToken(existingUser);
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
    if (!demoOtpEnabled()) return errorResponse(res, 503, "SMS login unavailable");
    const { phone } = req.body;

    const isBanned = await Ban.findOne({
      where: { phone },
    });

    if (isBanned !== null) {
      return errorResponse(res, 400, "You are banned.");
    }

    const user = await User.findOne({
      where: {
        phone,
      },
    });

    if (user === null) {
      return errorResponse(res, 404, "User not found !!");
    }

    const { expired, remainingTime } = await getOtpDetails(phone);

    if (!expired) {
      return successResponse(res, 400, {
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
    if (!demoOtpEnabled()) return errorResponse(res, 503, "SMS login unavailable");
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

    const token = generateToken(existingUser);

    const { password: _password, ...user } = existingUser.get({ plain: true });
    return successResponse(res, 200, "You have logged in Successfully !!", {
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { phone } = req.user;
    const { password, newPassword, confirmNewPassword } = req.body;

    const user = await User.findOne({
      where: {
        phone,
      },
    });

    if (user === null) {
      return errorResponse(res, 404, "User not found !!");
    }

    const isPasswordMatched = await bcrypt.compare(password, user.password);

    if (!isPasswordMatched) {
      return errorResponse(res, 400, "current password is not correct !!");
    }

    if (password === newPassword) {
      return errorResponse(
        res,
        402,
        "new password and current password can not be same !!",
      );
    }

    if (newPassword !== confirmNewPassword) {
      return errorResponse(
        res,
        400,
        "new password and its confirm are not matched !!",
      );
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);

    const [updated] = await User.update({ password: hashedNewPassword }, { where: { id: user.id, password: user.password } });
    if (!updated) return errorResponse(res, 409, "Password has changed");

    return successResponse(res, 200, "password Changed successfully !!");
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = req.user;
    return successResponse(res, 200, "", { user });
  } catch (err) {
    next(err);
  }
};

exports.setAvatar = async (req, res, next) => {
  try {
    const { phone } = req.user;

    if (!req.file) {
      return errorResponse(res, 400, "avatar has not been uploaded !!");
    }
    const { path } = req.file;

    const { avatar } = await User.findOne({
      where: {
        phone,
      },
      raw: true,
    });

    if (avatar !== null) {
      fs.unlink(avatar, (err) => next(err));
    }
    await User.update({ avatar: path }, { where: { phone } });
    return successResponse(
      res,
      201,
      "User avatar has been set successfully !!",
    );
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const { fullName, phone, email, address, bio } = await updateValidator.validate(req.body, { abortEarly: false });
    const updated = await db.transaction(async (transaction) => {
      const user = await User.findByPk(req.user.id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!user) return false;
      const normalize = (value) => value?.trim().toLowerCase() || null;
      if (email !== undefined && normalize(user.email) !== normalize(email)) {
        await Recovery.update({ verifiedEmail: null }, { where: { userId: user.id }, transaction });
      }
      await user.update({ fullName, phone, email: email === undefined ? undefined : normalize(email), address, bio }, { transaction });
      return true;
    });
    if (!updated) return errorResponse(res, 404, "User NOT found !!");

    return successResponse(res, 200, "User updated successfully !!");
  } catch (err) {
    next(err);
  }
};
