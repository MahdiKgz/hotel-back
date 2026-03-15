const jwt = require("jsonwebtoken");
const { errorResponse } = require("../utils/responses");

const auth = (req, res, next) => {
  const token = req.headers["authorization"].split(" ")[1];

  try {
    if (!token) {
      return errorResponse(res, 400, "No token provided !!");
    }

    jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return errorResponse(res, 400, "Invalid token provided");
  }
};

module.exports = auth;
