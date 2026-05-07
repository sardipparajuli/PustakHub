const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id })
      .populate({
        path: 'books.book',
        populate: { path: 'seller', select: 'name email location college' },
      });
    if (!cart) {
      cart = { books: [] };
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add book to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { bookId } = req.body;
    let cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      cart = new Cart({ user: req.user.id, books: [] });
    }

    // Check if book already in cart
    const alreadyInCart = cart.books.find(
      (b) => b.book.toString() === bookId
    );
    if (alreadyInCart) {
      return res.status(400).json({ message: 'Book already in cart!' });
    }

    cart.books.push({ book: bookId });
    await cart.save();
    res.json({ message: 'Book added to cart!', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Remove book from cart
router.delete('/remove/:bookId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    cart.books = cart.books.filter(
      (b) => b.book.toString() !== req.params.bookId
    );
    await cart.save();
    res.json({ message: 'Book removed from cart!', cart });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.books = [];
      await cart.save();
    }
    res.json({ message: 'Cart cleared!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;