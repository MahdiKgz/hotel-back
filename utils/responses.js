const errorResponse = (res, statusCode = 400, message = "", data) => {
  return res.status(statusCode).json({ message, data });
};

const successResponse = (res, statusCode = 200, message = "", data) => {
  return res.status(statusCode).json({ message, data });
};

module.exports = {
  errorResponse,
  successResponse,
};
