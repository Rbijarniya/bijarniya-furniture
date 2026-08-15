const express = require('express');
const PriceList = require('../models/PriceList');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

const DEFAULT_PRICELIST = [
  { item: 'Sofa Set', price: '₹18,999', sortOrder: 1 },
  { item: 'Double Bed', price: '₹14,999', sortOrder: 2 },
  { item: 'Dining Table', price: '₹9,999', sortOrder: 3 },
  { item: 'Wardrobe', price: '₹11,999', sortOrder: 4 },
  { item: 'Mattress', price: '₹4,999', sortOrder: 5 },
  { item: 'Office Chair', price: '₹2,999', sortOrder: 6 },
  { item: 'TV Unit', price: '₹8,999', sortOrder: 7 },
  { item: 'Study Table', price: '₹5,999', sortOrder: 8 },
  { item: 'Dressing Table', price: '₹7,999', sortOrder: 9 },
  { item: 'Shoe Rack', price: '₹3,999', sortOrder: 10 },
];

router.get('/public', async (req, res) => {
  try {
    let priceList = await PriceList.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
    if (priceList.length === 0) {
      priceList = await PriceList.insertMany(DEFAULT_PRICELIST);
    }
    return res.json(priceList);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch price list.' });
  }
});

router.get('/all', requireAuth, async (req, res) => {
  try {
    const priceList = await PriceList.find({}).sort({ sortOrder: 1, createdAt: 1 });
    return res.json(priceList);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch all price list items.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const priceListItem = new PriceList(req.body);
    await priceListItem.save();
    return res.status(201).json({ message: 'Price list item created successfully', priceListItem });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to create price list item.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const priceListItem = await PriceList.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!priceListItem) return res.status(404).json({ error: 'Price list item not found.' });
    return res.json({ message: 'Price list item updated successfully', priceListItem });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to update price list item.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const priceListItem = await PriceList.findByIdAndDelete(req.params.id);
    if (!priceListItem) return res.status(404).json({ error: 'Price list item not found.' });
    return res.json({ message: 'Price list item deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete price list item.' });
  }
});

module.exports = router;
