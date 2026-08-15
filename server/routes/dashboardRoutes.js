const express = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Gallery = require('../models/Gallery');
const Banner = require('../models/Banner');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/dashboard/stats
 * Protected endpoint: Returns dashboard counters and recent products
 */
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const [totalProducts, totalCategories, totalGallery, totalBanners, recentProducts] = await Promise.all([
      Product.countDocuments({}),
      Category.countDocuments({}),
      Gallery.countDocuments({}),
      Banner.countDocuments({}),
      Product.find({}).sort({ createdAt: -1 }).limit(5),
    ]);

    return res.json({
      totalProducts,
      totalCategories,
      totalGallery,
      totalBanners,
      recentProducts,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Failed to load dashboard statistics.' });
  }
});

module.exports = router;
