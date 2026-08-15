const express = require('express');
const Offer = require('../models/Offer');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

const DEFAULT_OFFERS = [
  {
    tag: 'Festival Sale',
    title: 'Up to 40% Off on Sofa & Dining Sets',
    description: 'Celebrate the season with our biggest savings of the year on handpicked living & dining collections.',
    img: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1100&q=80',
    buttonText: 'View Offers',
    buttonLink: '#products',
    buttonStyle: 'gold',
    isActive: true,
    sortOrder: 1,
  },
  {
    tag: 'New Arrivals',
    title: 'Flat ₹2,000 Off on Beds & Mattresses',
    description: 'Upgrade your bedroom with our latest collection. Offer valid this month only.',
    img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    buttonText: 'Claim Offer',
    buttonLink: '#contact',
    buttonStyle: 'outline',
    isActive: true,
    sortOrder: 2,
  }
];

router.get('/public', async (req, res) => {
  try {
    let offers = await Offer.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
    if (offers.length === 0) {
      offers = await Offer.insertMany(DEFAULT_OFFERS);
    }
    return res.json(offers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch offers.' });
  }
});

router.get('/all', requireAuth, async (req, res) => {
  try {
    const offers = await Offer.find({}).sort({ sortOrder: 1, createdAt: 1 });
    return res.json(offers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch all offers.' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const offer = new Offer(req.body);
    await offer.save();
    return res.status(201).json({ message: 'Offer created successfully', offer });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to create offer.' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    if (!offer) return res.status(404).json({ error: 'Offer not found.' });
    return res.json({ message: 'Offer updated successfully', offer });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to update offer.' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ error: 'Offer not found.' });
    return res.json({ message: 'Offer deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete offer.' });
  }
});

module.exports = router;
