const { errorResponse } = require("../utils/responses");

exports.roleGuard = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        400,
        `Only ${roles} users can access this route`,
      );
    }
    return next();
  };
};
