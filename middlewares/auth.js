const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/responses");
const Recovery = require("../models/v1/AccountRecovery.model");
const { passwordProof } = require("../utils/auth");
const User = require("../models/v1/User.model");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return errorResponse(res, 401, "Authorization header missing");
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return errorResponse(
        res,
        401,
        "Invalid authorization format. Use: Bearer <token>",
      );
    }

    const token = parts[1];
    if (!token) {
      return errorResponse(res, 401, "Token is empty");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { phone } = decoded;

    const user = await User.findOne({
      where: { phone },
      raw: true,
      attributes: [
        "id",
        "fullName",
        "phone",
        "email",
        "role",
        "avatar",
        "address",
        "bio",
        "password",
      ],
    });

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    const recovery = await Recovery.findByPk(user.id);
    if (decoded.proof ? decoded.proof !== passwordProof(user) : recovery?.recoveredAt) {
      return errorResponse(res, 401, "Session expired");
    }

    delete user.password;
    req.user = {
      ...user,
      emailVerified: Boolean(recovery?.verifiedEmail &&
        recovery.verifiedEmail === user.email?.trim().toLowerCase()),
    };
    next();
  } catch (err) {
    console.error("Auth error:", err.message); // برای دیباگ
    if (err.name === "TokenExpiredError") {
      return errorResponse(res, 401, "Token expired");
    }
    if (err.name === "JsonWebTokenError") {
      return errorResponse(res, 401, "Invalid token");
    }
    return errorResponse(res, 500, "Internal server error");
  }
};

module.exports = auth;
