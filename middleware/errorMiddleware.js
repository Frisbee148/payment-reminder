const ApiError = require("../utils/ApiError");

const errorHandler = (err, req, res, next) => {
  let statusCode = err instanceof ApiError ? err.statusCode : 500;
  let message = err instanceof ApiError ? err.message : "Internal Server Error";
  let errors = err instanceof ApiError ? err.errors : [];
  let stack = process.env.NODE_ENV === "production" ? null : err.stack;

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    stack,
  });
};

module.exports = {
  errorHandler,
};
