const express = require('express');
const Settings = require('../models/Settings');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/settings
 * Public endpoint: Get website settings & content
 */
router.get('/', async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      // Create default document if none exists
      settings = new Settings();
      await settings.save();
    }
    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch settings.' });
  }
});

/**
 * PUT /api/settings
 * Protected endpoint: Update website settings
 */
router.put('/', requireAuth, async (req, res) => {
  try {
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    await settings.save();
    return res.json({ message: 'Settings updated successfully', settings });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to update settings.' });
  }
});

module.exports = router;
