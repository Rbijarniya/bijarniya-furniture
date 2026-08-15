const express = require('express');
const Product = require('../models/Product');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GET /api/products
 * Public endpoint: Returns product catalogue with optional filters
 */
router.get('/', async (req, res) => {
  try {
    const { category, materialType, search, stock, featured } = req.query;
    const query = {};

    if (category && category !== 'all') {
      query.category = category;
    }
    if (materialType && materialType !== 'all') {
      query.materialType = materialType;
    }
    if (stock && stock !== 'all') {
      query.stock = stock;
    }
    if (featured === 'true') {
      query.isFeatured = true;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { desc: { $regex: search, $options: 'i' } },
        { material: { $regex: search, $options: 'i' } },
      ];
    }

    const products = await Product.find(query).sort({ sortOrder: 1, createdAt: -1 });
    return res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

/**
 * GET /api/products/:id
 * Public endpoint: Get single product by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch product details.' });
  }
});

/**
 * POST /api/products
 * Protected endpoint: Create product
 */
router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      name,
      category,
      materialType,
      material,
      price,
      colors,
      sizes,
      warranty,
      stock,
      badge,
      img,
      additionalImages,
      desc,
      isFeatured,
      isAvailable,
      sortOrder,
    } = req.body;

    if (!name || !category || price === undefined || !img) {
      return res.status(400).json({ error: 'Name, Category, Price, and Main Image are required.' });
    }

    const product = new Product({
      name,
      category,
      materialType: materialType || 'wood',
      material: material || '',
      price: Number(price),
      colors: Array.isArray(colors) ? colors : [],
      sizes: Array.isArray(sizes) ? sizes : [],
      warranty: warranty || '1 Year',
      stock: stock || 'in-stock',
      badge: badge || '',
      img,
      additionalImages: Array.isArray(additionalImages) ? additionalImages : [],
      desc: desc || '',
      isFeatured: Boolean(isFeatured),
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      sortOrder: Number(sortOrder) || 0,
    });

    await product.save();
    return res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    console.error('Error creating product:', error);
    return res.status(500).json({ error: error.message || 'Failed to create product.' });
  }
});

/**
 * PUT /api/products/:id
 * Protected endpoint: Update product
 */
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to update product.' });
  }
});

/**
 * DELETE /api/products/:id
 * Protected endpoint: Delete product
 */
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found.' });
    }
    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete product.' });
  }
});

module.exports = router;
