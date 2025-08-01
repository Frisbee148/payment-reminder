const User = require("../models/User");
const generateOTP = require("../utils/generateOTP");
const sendEmail = require("../utils/sendEmail");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//jwt acess token
const generateAccessToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
  });
};
// register logic
const register = asyncHandler(async (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    throw new ApiError(400, "Name and email are required");
  }
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }
  //otp genration
  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpires = Date.now() + 10 * 60 * 1000;
  const newUser = await User.create({
    name,
    email,
    otp: hashedOtp,
    otpExpires: otpExpires,
    isVerified: false,
  });

  if (!newUser) {
    throw new ApiError(500, "User registration failed");
  }

  // Send OTP email
  const message = `Hello ${name}, your OTP for payment reminder system is: <b>${otp}</b>. It is valid for 10 minutes.`;
  await sendEmail({
    email: newUser.email,
    subject: "OTP for Registration",
    message,
  });

  res
    .status(201)
    .json(
      new ApiResponse(201, {}, "User created successfully. OTP sent to email.")
    );
});

// otp verification
const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  // Find the user
  const user = await User.findOne({ email }).select("+otp +otpExpires");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Check if OTP has expired
  if (user.otpExpires < Date.now()) {
    throw new ApiError(400, "OTP has expired");
  }

  // Compare the provided OTP with the hashed OTP in the database
  const isMatch = await bcrypt.compare(otp, user.otp);

  if (!isMatch) {
    throw new ApiError(401, "Invalid OTP");
  }

  // OTP is valid, verify the user and clear OTP fields
  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save({ validateBeforeSave: false }); // Skip validation because we are just updating existing fields

  res.status(200).json(new ApiResponse(200, {}, "User verified successfully!"));
});

// Request OTP for login
const requestLoginOTP = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Find the user
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isVerified) {
    throw new ApiError(
      401,
      "User not verified. Please verify your email first."
    );
  }

  // Generate new OTP for login
  const otp = generateOTP();
  const hashedOtp = await bcrypt.hash(otp, 10);
  const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Update user with new OTP
  user.otp = hashedOtp;
  user.otpExpires = otpExpires;
  await user.save({ validateBeforeSave: false });

  // Send OTP email
  const message = `Hello ${user.name}, your OTP for login is: <b>${otp}</b>. It is valid for 10 minutes.`;
  await sendEmail({
    email: user.email,
    subject: "OTP for Login - Payment Reminder System",
    message,
  });

  res
    .status(200)
    .json(new ApiResponse(200, {}, "OTP sent to email successfully."));
});

//Login a user and generate JWT token
const login = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, "Email and OTP are required");
  }

  // Find the user, checking for verification and retrieving OTP fields
  const user = await User.findOne({ email }).select("+otp +otpExpires");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  if (!user.isVerified) {
    throw new ApiError(
      401,
      "User not verified. Please verify your email first."
    );
  }

  // Check if OTP has expired
  if (user.otpExpires < Date.now()) {
    throw new ApiError(400, "OTP has expired. Please request a new OTP.");
  }

  // Compare the provided OTP with the hashed OTP
  const isMatch = await bcrypt.compare(otp, user.otp);

  if (!isMatch) {
    throw new ApiError(401, "Invalid OTP");
  }

  // OTP is valid, clear OTP fields and generate JWT
  user.otp = undefined;
  user.otpExpires = undefined;

  await user.save({ validateBeforeSave: false });

  const accessToken = generateAccessToken(user._id);

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email,
    isVerified: user.isVerified,
  };

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { user: userData, accessToken },
        "User logged in successfully."
      )
    );
});

module.exports = {
  register,
  verifyOTP,
  requestLoginOTP,
  login,
};
