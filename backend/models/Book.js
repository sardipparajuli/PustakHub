const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
    required: true,
  },
  subject: {
    type: String,
    default: '',
  },
  edition: {
    type: String,
    default: '',
  },
  branch: {
    type: String,
    default: '',
  },
  genre: {
    type: String,
    default: 'Other',
    enum: [
      'Fantasy',
      'Thriller',
      'Biography',
      'Science Fiction',
      'Romance',
      'Mystery',
      'Horror',
      'History',
      'Self Help',
      'Academic',
      'Comics',
      'Other',
    ],
  },
  condition: {
    type: String,
    enum: ['New', 'Good', 'Average', 'Poor'],
    required: true,
  },
  mrp: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isSold: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

module.exports = mongoose.model('Book', BookSchema);