const express = require('express');
const Category = require('../models/Category');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/categories
 * Public endpoint: Returns all enabled categories
 */
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({}).sort({ sortOrder: 1, name: 1 });
    return res.json(categories);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

/**
 * POST /api/categories
 * Protected endpoint: Create new category
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const { id, name, icon, img, isEnabled, sortOrder } = req.body;

    if (!id || !name || !img) {
      return res.status(400).json({ error: 'Category ID, Name, and Image URL are required.' });
    }

    const cleanId = String(id).trim().toLowerCase();
    const existing = await Category.findOne({ id: cleanId });
    if (existing) {
      return res.status(400).json({ error: `Category with ID '${cleanId}' already exists.` });
    }

    const category = new Category({
      id: cleanId,
      name,
      icon: icon || 'fa-couch',
      img,
      isEnabled: isEnabled !== undefined ? Boolean(isEnabled) : true,
      sortOrder: Number(sortOrder) || 0,
    });

    await category.save();
    return res.status(201).json({ message: 'Category created successfully', category });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to create category.' });
  }
});

/**
 * PUT /api/categories/:id
 * Protected endpoint: Update category
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    return res.json({ message: 'Category updated successfully', category });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to update category.' });
  }
});

/**
 * DELETE /api/categories/:id
 * Protected endpoint: Delete category
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    return res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete category.' });
  }
});

module.exports = router;
