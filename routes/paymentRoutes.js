const express = require("express");
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler");
const { protect } = require("../middleware/authMiddleware");
const {
  createPayment,
  getPayments,
  updatePaymentStatus,
  deletePayment,
} = require("../controllers/paymentController");

// All routes are prefixed with /api/payments in server.js
// used protected route
router
  .route("/")
  .post(protect, createPayment) // Protected route for creating a new payment
  .get(protect, getPayments); // Protected route for getting all payments

router.route("/:id").delete(protect, deletePayment); // Protected route for deleting a payment

router.route("/:id/status").patch(protect, updatePaymentStatus); // Protected route for updating payment status

module.exports = router;
