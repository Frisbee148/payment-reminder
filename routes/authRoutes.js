const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { register, verifyOTP, login } = require("../controllers/authController");

// All routes are prefixed with /api/auth in server.js
router.post("/register", asyncHandler(register));
router.post("/verify-otp", asyncHandler(verifyOTP));
router.post("/login", asyncHandler(login));

module.exports = router;
