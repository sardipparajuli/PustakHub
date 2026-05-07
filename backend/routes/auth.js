const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, location, college } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = new User({
      name, email, password: hashedPassword, location, college,
    });
    await user.save();
    const token = jwt.sign(
      { id: user._id, email: user.email },
      'pustakhub_secret_key_2024',
      { expiresIn: '7d' }
    );
    res.status(201).json({
      token,
      user: {
        id: user._id, name: user.name,
        email: user.email, location: user.location,
        college: user.college,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Admin login
    if (email === 'admin@pustakhub.com' && password === 'admin123') {
      const token = jwt.sign(
        { id: 'admin', email: 'admin@pustakhub.com' },
        'pustakhub_secret_key_2024',
        { expiresIn: '7d' }
      );
      return res.json({
        token,
        user: {
          id: 'admin',
          name: 'Admin',
          email: 'admin@pustakhub.com',
          isAdmin: true,
        },
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { id: user._id, email: user.email },
      'pustakhub_secret_key_2024',
      { expiresIn: '7d' }
    );
    res.json({
      token,
      user: {
        id: user._id, name: user.name,
        email: user.email, location: user.location,
        college: user.college,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;