const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required.'],
      trim: true,
      maxlength: [80, 'Name must not exceed 80 characters.'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required.'],
      trim: true,
      match: [/^[0-9]{10}$/, 'Mobile number must be exactly 10 digits.'],
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required.'],
      min: [1, 'Rating must be between 1 and 5.'],
      max: [5, 'Rating must be between 1 and 5.'],
    },
    comment: {
      type: String,
      required: [true, 'Review text is required.'],
      trim: true,
      maxlength: [1000, 'Review must not exceed 1000 characters.'],
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    adminReply: {
      type: String,
      default: '',
      maxlength: [500, 'Reply must not exceed 500 characters.'],
    },
    adminReplyAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);
