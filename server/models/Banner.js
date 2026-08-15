const mongoose = require('mongoose');

/**
 * Hero Banner schema.
 * All fields that appear on the public homepage hero are stored here.
 * Fields match the existing hero HTML structure exactly.
 */
const bannerSchema = new mongoose.Schema({
  // --- Text content ---
  eyebrow: {
    type: String,
    default: "Kuchaman City's Trusted Furniture Showroom",
  },
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },

  // --- Primary CTA button ---
  buttonText: {
    type: String,
    default: 'View Products',
  },
  buttonLink: {
    type: String,
    default: '#products',
  },

  // --- Secondary CTA button ---
  btn2Text: {
    type: String,
    default: 'Contact Us',
  },
  btn2Link: {
    type: String,
    default: '#contact',
  },

  // --- Images ---
  img: {
    // Background / hero image (full-width)
    type: String,
    required: true,
  },
  frameImg: {
    // Right-side framed image
    type: String,
    default: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=900&q=80',
  },

  // --- Float card (warranty badge) ---
  floatCardTitle: {
    type: String,
    default: 'Up to 5 Yr Warranty',
  },
  floatCardSub: {
    type: String,
    default: 'On select furniture',
  },

  // --- Status ---
  isActive: {
    type: Boolean,
    default: true,
  },
  sortOrder: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

module.exports = mongoose.model('Banner', bannerSchema);
