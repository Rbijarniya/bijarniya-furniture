const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  tag: {
    type: String,
    default: 'Limited Offer',
  },
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  img: {
    type: String,
    required: true,
  },
  buttonText: {
    type: String,
    default: 'View Offers',
  },
  buttonLink: {
    type: String,
    default: '#products',
  },
  buttonStyle: {
    type: String,
    default: 'gold', // 'gold' or 'outline'
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Offer', offerSchema);
