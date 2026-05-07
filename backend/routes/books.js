const express = require("express");
const router = express.Router();
const Book = require("../models/Book");
const auth = require("../middleware/auth");

// Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find({ isSold: false })
      .populate("seller", "name email location college")
      .sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Get single book
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id)
      .populate("seller", "name email location college");
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Add a book
router.post("/", auth, async (req, res) => {
  try {
    const {
      title, author, subject, edition, branch,
      condition, genre, mrp, price, description, image
    } = req.body;

    const book = new Book({
      title, author, subject, edition, branch,
      condition, genre, mrp, price, description, image,
      seller: req.user.id,
    });

    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Update a book
router.put("/:id", auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }
    const updatedBook = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Delete a book
router.delete("/:id", auth, async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    if (book.seller.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Search books using Levenshtein Distance
router.get("/search/:query", async (req, res) => {
  try {
    const query = req.params.query.toLowerCase();
    const books = await Book.find({ isSold: false })
      .populate("seller", "name email location college");

    function levenshtein(a, b) {
      const matrix = [];
      for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
      }
      for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
      }
      for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[b.length][a.length];
    }

    const results = books.filter((book) => {
      const titleDistance = levenshtein(query, book.title.toLowerCase());
      const authorDistance = levenshtein(query, book.author.toLowerCase());
      return titleDistance <= 5 || authorDistance <= 5;
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;