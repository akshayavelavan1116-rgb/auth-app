// server.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const authMiddleware = require("./middleware/authMiddleware"); // ✅ corrected
const User = require("./models/User"); // 👈 added to fetch user email

const app = express();

// ----------------------------
// MIDDLEWARE
// ----------------------------
app.use(cors());
app.use(express.json());

// ----------------------------
// ROUTES
// ----------------------------
app.use("/api/auth", authRoutes); // register + login

// Test root route
app.get("/", (req, res) => {
  res.send("Auth server is running");
});

// ----------------------------
// PROTECTED ROUTE 🔒
// ----------------------------
app.get("/dashboard", authMiddleware, async (req, res) => {
  try {
    // Fetch user from DB using ID from JWT
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send welcome message with user's email
    res.json({
      message: `Welcome ${user.email}! You are now on the dashboard.`,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------------------
// MONGODB CONNECTION + SERVER START
// ----------------------------
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected ✅");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });
  } catch (err) {
    console.error("MongoDB connection error ❌:", err);
    process.exit(1);
  }
};

startServer();
