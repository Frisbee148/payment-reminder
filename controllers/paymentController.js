const Payment = require("../models/Payment");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

const createPayment = asyncHandler(async (req, res) => {
  const { paymentName, description, amount, category, deadline } = req.body;
  const userId = req.user._id;

  if (!paymentName || !amount || !deadline) {
    throw new ApiError(
      400,
      "Payment name, amount, and deadline are required fields."
    );
  }

  const newPayment = await Payment.create({
    userId,
    paymentName,
    description,
    amount,
    category,
    deadline,
  });

  res
    .status(201)
    .json(new ApiResponse(201, newPayment, "Payment created successfully."));
});

//Get all payments for the logged-in user
const getPayments = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const payments = await Payment.find({ userId }).sort({ deadline: 1 });

  res
    .status(200)
    .json(new ApiResponse(200, payments, "Payments fetched successfully."));
});

// Update a payment's status (e.g., to 'paid' or 'cancelled')
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const paymentId = req.params.id;
  const userId = req.user._id;

  // Validate the new status
  const validStatuses = ["pending", "paid", "overdue", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, "Invalid status provided.");
  }

  // Find the payment and ensure it belongs to the logged-in user
  const payment = await Payment.findOne({ _id: paymentId, userId });

  if (!payment) {
    throw new ApiError(
      404,
      "Payment not found or you are not authorized to update this payment."
    );
  }

  payment.status = status;
  await payment.save();

  res
    .status(200)
    .json(
      new ApiResponse(200, payment, "Payment status updated successfully.")
    );
});

const deletePayment = asyncHandler(async (req, res) => {
  const paymentId = req.params.id;
  const userId = req.user._id;

  // Find and delete the payment, ensuring it belongs to the logged-in user
  const result = await Payment.findOneAndDelete({ _id: paymentId, userId });

  if (!result) {
    throw new ApiError(
      404,
      "Payment not found or you are not authorized to delete this payment."
    );
  }

  res
    .status(200)
    .json(new ApiResponse(200, null, "Payment deleted successfully."));
});

module.exports = {
  createPayment,
  getPayments,
  updatePaymentStatus,
  deletePayment,
};
