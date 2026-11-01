
const express = require("express");
const Book = require("../models/Book");

const router = express.Router();

// CREATE: Add a new book
router.post("/", async (req, res) => {
  try {
    const book = await Book.create(req.body);

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: book
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A book with this ISBN already exists"
      });
    }

    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add book"
    });
  }
});

// READ: Get all books
router.get("/", async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: books.length,
      data: books
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve books"
    });
  }
});

// READ: Get one book by ID
router.get("/:id", async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    res.json({ success: true, data: book });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;

    res.status(status).json({
      success: false,
      message: status === 400 ? "Invalid book ID" : "Failed to retrieve book"
    });
  }
});

// UPDATE: Update a book by ID
router.put("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    res.json({
      success: true,
      message: "Book updated successfully",
      data: book
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A book with this ISBN already exists"
      });
    }

    const status =
      error.name === "ValidationError" || error.name === "CastError"
        ? 400
        : 500;

    res.status(status).json({
      success: false,
      message: status === 400 ? error.message : "Failed to update book"
    });
  }
});

// DELETE: Delete a book by ID
router.delete("/:id", async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found"
      });
    }

    res.json({
      success: true,
      message: "Book deleted successfully"
    });
  } catch (error) {
    const status = error.name === "CastError" ? 400 : 500;

    res.status(status).json({
      success: false,
      message: status === 400 ? "Invalid book ID" : "Failed to delete book"
    });
  }
});

module.exports = router;
