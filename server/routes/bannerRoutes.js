const express = require('express');
const Banner = require('../models/Banner');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/* ------------------------------------------------------------------
   Default hero content — used to seed MongoDB on first request if
   no banner exists yet. Mirrors the existing hardcoded hero HTML.
   ------------------------------------------------------------------ */
const DEFAULT_HERO = {
  eyebrow: "Kuchaman City's Trusted Furniture Showroom",
  title: 'Transform Your Home with | Premium Furniture',
  subtitle: 'Quality Furniture | Affordable Prices | Trusted Service',
  img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1600&q=80',
  frameImg: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80',
  buttonText: 'View Products',
  buttonLink: '#products',
  btn2Text: 'Contact Us',
  btn2Link: '#contact',
  floatCardTitle: 'Up to 5 Yr Warranty',
  floatCardSub: 'On select furniture',
  isActive: true,
  sortOrder: 0,
};

/**
 * GET /api/banners/hero
 * Public: Returns the single active hero banner.
 * Auto-seeds the default if none exists in MongoDB yet.
 */
router.get('/hero', async (req, res) => {
  try {
    let banner = await Banner.findOne({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });

    if (!banner) {
      // First-time: seed the default hero from the existing HTML content
      banner = await Banner.create(DEFAULT_HERO);
    }

    return res.json(banner);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch hero banner.' });
  }
});

/**
 * GET /api/banners
 * Public: Returns all active banners (for future carousel use)
 */
router.get('/', async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ sortOrder: 1, createdAt: -1 });
    return res.json(banners);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch banners.' });
  }
});

/**
 * GET /api/banners/all
 * Protected: Returns ALL banners (including inactive) for Admin Panel
 */
router.get('/all', requireAuth, async (req, res) => {
  try {
    const banners = await Banner.find({}).sort({ sortOrder: 1, createdAt: -1 });
    return res.json(banners);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch all banners.' });
  }
});

/**
 * POST /api/banners
 * Protected: Create a new banner
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      eyebrow, title, subtitle, img, frameImg,
      buttonText, buttonLink, btn2Text, btn2Link,
      floatCardTitle, floatCardSub,
      isActive, sortOrder,
    } = req.body;

    if (!title || !img) {
      return res.status(400).json({ error: 'Banner Title and Image URL are required.' });
    }

    const banner = new Banner({
      eyebrow: eyebrow || DEFAULT_HERO.eyebrow,
      title,
      subtitle: subtitle || '',
      img,
      frameImg: frameImg || DEFAULT_HERO.frameImg,
      buttonText: buttonText || 'View Products',
      buttonLink: buttonLink || '#products',
      btn2Text: btn2Text || 'Contact Us',
      btn2Link: btn2Link || '#contact',
      floatCardTitle: floatCardTitle || DEFAULT_HERO.floatCardTitle,
      floatCardSub: floatCardSub || DEFAULT_HERO.floatCardSub,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      sortOrder: Number(sortOrder) || 0,
    });

    await banner.save();
    return res.status(201).json({ message: 'Banner created successfully', banner });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to create banner.' });
  }
});

/**
 * PUT /api/banners/:id
 * Protected: Update a banner
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found.' });
    }
    return res.json({ message: 'Banner updated successfully', banner });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to update banner.' });
  }
});

/**
 * DELETE /api/banners/:id
 * Protected: Delete a banner
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) {
      return res.status(404).json({ error: 'Banner not found.' });
    }
    return res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete banner.' });
  }
});

module.exports = router;
