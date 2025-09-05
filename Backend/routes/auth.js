const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const userProfile = require('../models/userProfile');

const router = express.Router();

// Create JWT token
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "mysecret", {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d", // fallback
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined; // hide password
  res.status(statusCode).json({ success: true, token, data: { user } });
};

// ✅ Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body; // use "name"

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Name, email & password required" });
    }

    const existing = await userProfile.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await userProfile.create({ name, email, password });
    createSendToken(user, 201, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});


// Register user
router.post('/register', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      bloodType,
      location,
      dateOfBirth,
      gender,
      isDonor
    } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create new user
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      phone,
      bloodType,
      location,
      dateOfBirth,
      gender,
      isDonor
    });
    
    createSendToken(newUser, 201, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if email and password exist
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Check if user exists and password is correct
    const user = await userProfile.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect email or password'
      });
    }
    
    createSendToken(user, 200, res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

router.get('/users', async (req, res) => {
  try {
    // Fetch only users who are donors
    const users = await User.find({ isDonor: true }).select("-__v -password");

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});


module.exports = router;