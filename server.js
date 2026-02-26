const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== DATABASE CONNECTION =====
console.log("Connecting to MongoDB...");
console.log("MONGO_URI exists:", !!process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => {
    console.error("Mongo error ❌");
    console.error(err);
  });

// ===== USER SCHEMA =====
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
});

const User = mongoose.model("User", userSchema);

// ===== TEST ROUTE =====
app.get("/", (req, res) => {
  console.log("Health check hit");
  res.send("Backend is running");
});

// ===== SIGNUP =====
app.post("/signup", async (req, res) => {
  console.log("POST /signup hit");
  console.log("Request body:", req.body);

  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      console.log("Signup failed: missing fields");
      return res.status(400).json({ message: "All fields required" });
    }

    console.log("Checking if user exists:", email);
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log("User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("Creating new user:", email);
    const newUser = new User({ name, email, password });

    await newUser.save();
    console.log("User saved successfully:", email);

    res.status(201).json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error ❌");
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// ===== LOGIN =====
app.post("/login", async (req, res) => {
  console.log("POST /login hit");
  console.log("Request body:", req.body);

  try {
    const { email, password } = req.body;

    console.log("Finding user:", email);
    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      console.log("Invalid credentials for:", email);
      return res.status(400).json({ message: "Invalid credentials" });
    }

    console.log("Login successful:", email);
    res.json({ message: "Login successful", user });
  } catch (err) {
    console.error("Login error ❌");
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});

// ===== START SERVER =====
const PORT = 5000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
