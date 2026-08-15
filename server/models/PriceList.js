const mongoose = require('mongoose');

const priceListSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true,
  },
  price: {
    type: String, // e.g. "₹18,999"
    required: true,
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

module.exports = mongoose.model('PriceList', priceListSchema);
