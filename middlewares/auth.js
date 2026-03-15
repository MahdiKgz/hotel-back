const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/responses");
const User = require("../models/v1/User.model");

const auth = async (req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1];

  try {
    if (!token) {
      return errorResponse(res, 400, "No token provided !!");
    }

    const { phone } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findOne({
      where: {
        phone,
      },
      raw: true,
    });
    if (user === null) {
      return errorResponse(res, 400, "User not found !!");
    }
    req.user = user;
    return next();
  } catch {
    return errorResponse(res, 400, "Invalid token provided");
  }
};

module.exports = auth;
