const mongoose = require('mongoose');

const colorSchema = new mongoose.Schema({
  n: { type: String, required: true }, // color name, e.g. "Walnut Brown"
  h: { type: String, required: true }, // hex code, e.g. "#6B4226"
}, { _id: false });

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  materialType: {
    type: String,
    default: 'wood',
  },
  material: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  colors: [colorSchema],
  sizes: [{ type: String }],
  warranty: {
    type: String,
    default: '1 Year',
  },
  stock: {
    type: String,
    enum: ['in-stock', 'limited', 'out-of-stock'],
    default: 'in-stock',
  },
  badge: {
    type: String,
    default: '',
  },
  img: {
    type: String,
    required: true,
  },
  additionalImages: [{ type: String }],
  desc: {
    type: String,
    default: '',
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
