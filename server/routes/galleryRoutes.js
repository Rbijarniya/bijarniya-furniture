const express = require('express');
const Gallery = require('../models/Gallery');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/gallery
 * Public endpoint: Returns all gallery items
 */
router.get('/', async (req, res) => {
  try {
    const { tab } = req.query;
    const query = {};
    if (tab && tab !== 'all') {
      query.tab = tab;
    }

    const items = await Gallery.find(query).sort({ sortOrder: 1, createdAt: -1 });
    return res.json(items);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch gallery items.' });
  }
});

/**
 * POST /api/gallery
 * Protected endpoint: Add gallery image item
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { img, tab, caption, sortOrder } = req.body;

    if (!img) {
      return res.status(400).json({ error: 'Image URL is required.' });
    }

    const item = new Gallery({
      img,
      tab: tab || 'living',
      caption: caption || '',
      sortOrder: Number(sortOrder) || 0,
    });

    await item.save();
    return res.status(201).json({ message: 'Gallery item added successfully', item });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to add gallery item.' });
  }
});

/**
 * DELETE /api/gallery/:id
 * Protected endpoint: Delete gallery item
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Gallery item not found.' });
    }
    return res.json({ message: 'Gallery item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete gallery item.' });
  }
});

module.exports = router;
