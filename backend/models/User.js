const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: "",
  },
  college: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "",
  },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);