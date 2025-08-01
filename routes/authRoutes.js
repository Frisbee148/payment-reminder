const express = require("express");
const router = express.Router();
const { register, verifyOTP, requestLoginOTP, login } = require("../controllers/authController");

// All routes are prefixed with /api/auth in server.js
router.post("/register", register);
router.post("/verify-otp", verifyOTP);
router.post("/request-login-otp", requestLoginOTP);
router.post("/login", login);

module.exports = router;
