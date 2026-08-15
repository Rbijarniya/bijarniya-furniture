const express = require('express');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const Review = require('../models/Review');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Rate limiter: max 5 review submissions per IP per hour
const submitLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { error: 'Too many reviews submitted. Please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

/* -----------------------------------------------------------------------
   PUBLIC — GET /api/customer-reviews
   Returns only approved reviews.
   Mobile number is NEVER sent to the public.
   ----------------------------------------------------------------------- */
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find({ status: 'approved' })
      .select('-mobile -__v')          // mobile is NEVER exposed publicly
      .sort({ createdAt: -1 });

    const total = reviews.length;
    const avgRating =
      total > 0
        ? parseFloat(
            (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1)
          )
        : 0;

    return res.json({ avgRating, total, reviews });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to load reviews.' });
  }
});

/* -----------------------------------------------------------------------
   PUBLIC — POST /api/customer-reviews
   Submit a new review (saved as pending, never auto-approved).
   ----------------------------------------------------------------------- */
router.post('/', submitLimiter, async (req, res) => {
  try {
    const { name, mobile, rating, comment } = req.body;

    // --- Check DB Connection ---
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ error: 'Database connection is temporarily unavailable. Please verify your MongoDB Atlas IP whitelist or connection string.' });
    }

    // --- Required field checks ---
    if (!name || !mobile || !rating || !comment) {
      return res.status(400).json({ error: 'Name, mobile number, rating, and review text are all required.' });
    }

    // --- Mobile: exactly 10 digits, no letters or special chars ---
    const cleanMobile = String(mobile).replace(/\s/g, '');
    if (!/^[0-9]{10}$/.test(cleanMobile)) {
      return res.status(400).json({ error: 'Mobile number must be exactly 10 digits with no letters or special characters.' });
    }

    // --- Rating: 1–5 integer ---
    const ratingNum = Number(rating);
    if (!Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return res.status(400).json({ error: 'Rating must be a whole number between 1 and 5.' });
    }

    // --- Comment minimum length ---
    if (String(comment).trim().length < 10) {
      return res.status(400).json({ error: 'Review must be at least 10 characters.' });
    }

    const review = new Review({
      name: String(name).trim().substring(0, 80),
      mobile: cleanMobile,
      rating: ratingNum,
      comment: String(comment).trim().substring(0, 1000),
      status: 'pending',
    });

    await review.save();
    return res.status(201).json({
      message: 'Thank you! Your review has been submitted and is awaiting approval.',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Failed to submit review.' });
  }
});

/* -----------------------------------------------------------------------
   ADMIN — GET /api/customer-reviews/admin
   Returns ALL reviews (with mobile numbers) for admin management only.
   ----------------------------------------------------------------------- */
router.get('/admin', requireAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter =
      status && ['pending', 'approved', 'rejected'].includes(status)
        ? { status }
        : {};
    const reviews = await Review.find(filter).sort({ createdAt: -1 });
    return res.json(reviews);
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

/* -----------------------------------------------------------------------
   ADMIN — PATCH /api/customer-reviews/:id/status
   Approve or reject a review.
   ----------------------------------------------------------------------- */
router.patch('/:id/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status value.' });
    }
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    return res.json({ message: `Review ${status}.`, review });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update review status.' });
  }
});

/* -----------------------------------------------------------------------
   ADMIN — PATCH /api/customer-reviews/:id/reply
   Add or edit admin reply.
   ----------------------------------------------------------------------- */
router.patch('/:id/reply', requireAuth, async (req, res) => {
  try {
    const { adminReply } = req.body;
    const replyText = String(adminReply || '').trim().substring(0, 500);
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      {
        adminReply: replyText,
        adminReplyAt: replyText ? new Date() : null,
      },
      { new: true }
    );
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    return res.json({ message: 'Reply saved.', review });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to save reply.' });
  }
});

/* -----------------------------------------------------------------------
   ADMIN — DELETE /api/customer-reviews/:id
   Permanently delete a review.
   ----------------------------------------------------------------------- */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ error: 'Review not found.' });
    return res.json({ message: 'Review deleted.' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to delete review.' });
  }
});

module.exports = router;
