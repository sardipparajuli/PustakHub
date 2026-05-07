const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Book = require('../models/Book');
const Message = require('../models/Message');

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.email !== 'admin@pustakhub.com') {
    return res.status(403).json({ message: 'Access denied. Admins only!' });
  }
  next();
};

// Get dashboard stats
router.get('/stats', auth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalBooks = await Book.countDocuments();
    const soldBooks = await Book.countDocuments({ isSold: true });
    const availableBooks = await Book.countDocuments({ isSold: false });
    const totalMessages = await Message.countDocuments();

    res.json({
      totalUsers,
      totalBooks,
      soldBooks,
      availableBooks,
      totalMessages,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all users
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a user
router.delete('/users/:id', auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await Book.deleteMany({ seller: req.params.id });
    res.json({ message: 'User deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get all books
router.get('/books', auth, async (req, res) => {
  try {
    const books = await Book.find()
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete a book
router.delete('/books/:id', auth, async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;