
const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Book title is required"],
      trim: true,
      minlength: [2, "Title must contain at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"]
    },
    author: {
      type: String,
      required: [true, "Author name is required"],
      trim: true,
      maxlength: [80, "Author name cannot exceed 80 characters"]
    },
    isbn: {
      type: String,
      required: [true, "ISBN is required"],
      trim: true,
      unique: true
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      validate: {
        validator: Number.isInteger,
        message: "Quantity must be a whole number"
      }
    },
    publicationYear: {
      type: Number,
      min: [1000, "Enter a valid publication year"],
      max: [new Date().getFullYear(), "Publication year cannot be in the future"],
      validate: {
        validator: Number.isInteger,
        message: "Publication year must be a whole number"
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Book", bookSchema);
