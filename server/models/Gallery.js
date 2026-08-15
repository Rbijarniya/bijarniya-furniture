const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema({
  img: {
    type: String,
    required: true,
  },
  tab: {
    type: String,
    enum: ['living', 'bedroom', 'office', 'decor', 'electrical'],
    default: 'living',
  },
  caption: {
    type: String,
    default: '',
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Gallery', gallerySchema);
