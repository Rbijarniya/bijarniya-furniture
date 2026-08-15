const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  q: { type: String, required: true },
  a: { type: String, required: true },
}, { _id: false });

const priceItemSchema = new mongoose.Schema({
  item: { type: String, required: true },
  price: { type: String, required: true },
}, { _id: false });

const whyUsSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  text: { type: String, required: true },
}, { _id: false });

const settingsSchema = new mongoose.Schema({
  businessName: { type: String, default: 'Bijarniya Furniture' },
  tagline: { type: String, default: 'Complete Furniture & Home Essentials Under One Roof' },
  phone: { type: String, default: '+919257849119' },
  whatsapp: { type: String, default: '919257849119' },
  email: { type: String, default: 'bijarniyafurniture@gmail.com' },
  address: { type: String, default: 'Sikar Road, Kuchaman City, Rajasthan - 341508' },
  googleMapsUrl: { type: String, default: 'https://www.google.com/maps/place/Bijarniya+Enterprises+%26furniture/@27.1585904,74.8517542,17z/data=!3m1!4b1!4m6!3m5!1s0x396b793e0e6dd6bd:0x220dde6879ff3cb!8m2!3d27.1585904!4d74.8517542!16s%2Fg%2F11dyzms7s3' },
  writeReviewUrl: { type: String, default: 'https://g.page/r/YOUR_REVIEW_LINK/review' },
  openingHours: { type: String, default: 'Mon - Sat: 9:00 AM - 8:00 PM | Sun: 10:00 AM - 6:00 PM' },
  instagram: { type: String, default: 'https://www.instagram.com/bijarniyafurniture?igsh=djV0Mmt4ajdweHg4' },
  facebook: { type: String, default: 'https://facebook.com' },
  youtube: { type: String, default: 'https://youtube.com' },
  faqs: [faqSchema],
  priceList: [priceItemSchema],
  whyUs: [whyUsSchema],
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
