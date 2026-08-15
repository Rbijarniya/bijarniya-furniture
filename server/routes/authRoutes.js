const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const Admin = require('../models/Admin');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Rate limiter for login attempts to prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 login requests per windowMs
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' },
});

/**
 * POST /api/auth/login
 * Allows login using Username, Email, OR Mobile Number + Password
 */
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide login identifier (username/email/phone) and password.' });
    }

    const cleanIdentifier = String(identifier).trim().toLowerCase();

    // Query for matching username OR email OR phone number
    const admin = await Admin.findOne({
      $or: [
        { username: cleanIdentifier },
        { email: cleanIdentifier },
        { phone: String(identifier).trim() },
      ],
    });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    // Verify hashed password
    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials.' });
    }

    // Generate JWT token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error('SECURITY ERROR: JWT_SECRET is not configured in environment variables.');
      return res.status(500).json({ error: 'Server configuration error.' });
    }
    const token = jwt.sign(
      { id: admin._id, username: admin.username, role: admin.role },
      secret,
      { expiresIn: '24h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ error: 'Server error during login authentication.' });
  }
});

/**
 * GET /api/auth/me
 * Gets authenticated admin profile
 */
router.get('/me', requireAuth, (req, res) => {
  res.json({ admin: req.admin });
});

/**
 * PUT /api/auth/profile
 * Updates admin details / password
 */
router.put('/profile', requireAuth, async (req, res) => {
  try {
    const { username, email, phone, currentPassword, newPassword } = req.body;
    const admin = await Admin.findById(req.admin._id);

    if (username) admin.username = String(username).trim().toLowerCase();
    if (email) admin.email = String(email).trim().toLowerCase();
    if (phone) admin.phone = String(phone).trim();

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password.' });
      }
      const isMatch = await bcrypt.compare(currentPassword, admin.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password does not match.' });
      }
      admin.password = await bcrypt.hash(newPassword, 10);
    }

    await admin.save();

    return res.json({
      message: 'Profile updated successfully',
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        phone: admin.phone,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to update profile.' });
  }
});

module.exports = router;
