const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI is not defined in your .env file!");
  console.error(
    "Please set MONGODB_URI to your MongoDB Atlas connection string."
  );
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB Connected Successfully to Atlas!"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err.message);
    console.error(
      "Please check your MONGODB_URI in the .env file and network access in MongoDB Atlas."
    );
    process.exit(1);
  });

app.get("/", (req, res) => {
  res.send("Payment Reminder System Backend API is running!");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
