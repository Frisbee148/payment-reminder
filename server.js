const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in your .env file!");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully to Atlas!"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    process.exit(1);
  });

// Mount the authentication routes
app.use("/api/auth", authRoutes);

// Basic route for testing the server
app.get("/", (req, res) => {
  res.send("Payment Reminder System Backend API is running!");
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
