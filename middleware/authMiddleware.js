const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // We use .select('-otp -otpExpires') to prevent sending sensitive data by default
      req.user = await User.findById(decoded.id).select("-otp -otpExpires");

      if (!req.user) {
        throw new ApiError(401, "User not found, token is invalid");
      }

      next();
    } catch (error) {
      // If token is invalid or expired, throw a 401 error.
      throw new ApiError(401, "Not authorized, token failed");
    }
  }
  
  if (!token) {
    throw new ApiError(401, "Not authorized, no token provided");
  }
});

module.exports = { protect };
