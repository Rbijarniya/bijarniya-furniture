require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../db');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Gallery = require('../models/Gallery');
const Settings = require('../models/Settings');

// Initial seed dataset (derived from js/data.js)
const CATEGORIES = [
  { id: 'sofa', name: 'Sofa Sets', icon: 'fa-couch', img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=500&q=70', sortOrder: 1 },
  { id: 'bed', name: 'Beds', icon: 'fa-bed', img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=70', sortOrder: 2 },
  { id: 'mattress', name: 'Mattresses', icon: 'fa-layer-group', img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=500&q=70', sortOrder: 3 },
  { id: 'dining', name: 'Dining Tables', icon: 'fa-utensils', img: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=500&q=70', sortOrder: 4 },
  { id: 'wardrobe', name: 'Wardrobes', icon: 'fa-shirt', img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=500&q=70', sortOrder: 5 },
  { id: 'office', name: 'Office Furniture', icon: 'fa-briefcase', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=500&q=70', sortOrder: 6 },
  { id: 'study', name: 'Study Tables', icon: 'fa-book-open', img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=500&q=70', sortOrder: 7 },
  { id: 'chairs', name: 'Chairs', icon: 'fa-chair', img: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=500&q=70', sortOrder: 8 },
  { id: 'tvunit', name: 'TV Units', icon: 'fa-tv', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=500&q=70', sortOrder: 9 },
  { id: 'shoerack', name: 'Shoe Racks', icon: 'fa-shoe-prints', img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=500&q=70', sortOrder: 10 },
  { id: 'dressing', name: 'Dressing Tables', icon: 'fa-paintbrush', img: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=500&q=70', sortOrder: 11 },
  { id: 'modular', name: 'Modular Furniture', icon: 'fa-cubes', img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=500&q=70', sortOrder: 12 },
  { id: 'plastic', name: 'Plastic Furniture', icon: 'fa-recycle', img: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=500&q=70', sortOrder: 13 },
  { id: 'decor', name: 'Home Decor', icon: 'fa-palette', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a2c?auto=format&fit=crop&w=500&q=70', sortOrder: 14 },
  { id: 'electrical', name: 'Electrical Items', icon: 'fa-lightbulb', img: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=500&q=70', sortOrder: 15 },
  { id: 'storage', name: 'Storage Cabinets', icon: 'fa-box-archive', img: 'https://images.unsplash.com/photo-1597072689227-6e63a93b3a36?auto=format&fit=crop&w=500&q=70', sortOrder: 16 },
  { id: 'centertable', name: 'Center Tables', icon: 'fa-table-cells', img: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=500&q=70', sortOrder: 17 },
  { id: 'computertable', name: 'Computer Tables', icon: 'fa-desktop', img: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=500&q=70', sortOrder: 18 },
  { id: 'kitchen', name: 'Kitchen Furniture', icon: 'fa-kitchen-set', img: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?auto=format&fit=crop&w=500&q=70', sortOrder: 19 },
  { id: 'kids', name: 'Kids Furniture', icon: 'fa-baby', img: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=500&q=70', sortOrder: 20 },
  { id: 'mirrors', name: 'Mirrors', icon: 'fa-image', img: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=500&q=70', sortOrder: 21 },
  { id: 'wooden', name: 'Wooden Furniture', icon: 'fa-tree', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=500&q=70', sortOrder: 22 },
  { id: 'steel', name: 'Steel Furniture', icon: 'fa-industry', img: 'https://images.unsplash.com/photo-1581539250439-c9f9650a4dd0?auto=format&fit=crop&w=500&q=70', sortOrder: 23 },
  { id: 'outdoor', name: 'Outdoor Furniture', icon: 'fa-umbrella-beach', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=500&q=70', sortOrder: 24 },
  { id: 'custom', name: 'Custom Furniture', icon: 'fa-pen-ruler', img: 'https://images.unsplash.com/photo-1567016376408-0226e4d0c1ea?auto=format&fit=crop&w=500&q=70', sortOrder: 25 },
];

const PRODUCTS = [
  { name: 'Royal Comfort 3-Seater Sofa', category: 'sofa', materialType: 'foam', material: 'Sheesham Wood & Velvet Fabric', price: 18999, colors: [{ n: 'Walnut Brown', h: '#6B4226' }, { n: 'Charcoal Grey', h: '#3A3A3A' }, { n: 'Wine Red', h: '#7B1E2B' }], sizes: ['3-Seater', '5-Seater', 'L-Shape'], warranty: '2 Years', stock: 'in-stock', badge: 'Best Seller', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=75', desc: 'A handcrafted sofa with solid Sheesham wood legs and a plush velvet finish for everyday comfort.' },
  { name: 'Dreamline King Size Bed', category: 'bed', materialType: 'wood', material: 'Solid Sheesham Wood', price: 14999, colors: [{ n: 'Honey Oak', h: '#C8956D' }, { n: 'Walnut Brown', h: '#5C3A21' }], sizes: ['Queen', 'King'], warranty: '5 Years', stock: 'in-stock', badge: 'Best Seller', img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=600&q=75', desc: 'A sturdy king-size bed frame with hydraulic storage, finished in a rich honey-oak veneer.' },
  { name: 'Cool Gel Memory Foam Mattress', category: 'mattress', materialType: 'foam', material: 'High-Density Foam', price: 4999, colors: [{ n: 'White', h: '#FFFFFF' }], sizes: ['Single', 'Queen', 'King'], warranty: '7 Years', stock: 'in-stock', badge: 'New Arrival', img: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?auto=format&fit=crop&w=600&q=75', desc: 'Cooling gel-infused foam mattress that contours to your body for pressure-free sleep.' },
  { name: 'Sheesham Wood 4-Seater Dining Set', category: 'dining', materialType: 'wood', material: 'Solid Sheesham Wood', price: 9999, colors: [{ n: 'Natural Teak', h: '#A9743F' }, { n: 'Walnut Brown', h: '#6B4226' }], sizes: ['4-Seater', '6-Seater'], warranty: '3 Years', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=600&q=75', desc: 'A timeless dining set crafted from solid Sheesham wood, built to seat the whole family.' },
  { name: '3-Door Sliding Wardrobe', category: 'wardrobe', materialType: 'wood', material: 'Engineered Wood', price: 11999, colors: [{ n: 'Pearl White', h: '#F5F1EA' }, { n: 'Walnut Brown', h: '#6B4226' }], sizes: ['2-Door', '3-Door', '4-Door'], warranty: '3 Years', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=600&q=75', desc: 'Spacious sliding-door wardrobe with internal shelving, drawers and a hanging rod.' },
  { name: 'Ergonomic Mesh Office Chair', category: 'office', materialType: 'metal', material: 'Mesh & Metal Frame', price: 2999, colors: [{ n: 'Black', h: '#1C1C1C' }, { n: 'Grey', h: '#6E6E6E' }], sizes: ['Standard'], warranty: '1 Year', stock: 'in-stock', badge: 'Best Seller', img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=75', desc: 'Breathable mesh-back office chair with lumbar support and adjustable height.' },
  { name: 'Study Table with Bookshelf', category: 'study', materialType: 'wood', material: 'Engineered Wood', price: 5999, colors: [{ n: 'Pearl White', h: '#F5F1EA' }, { n: 'Walnut Brown', h: '#6B4226' }], sizes: ['Compact', 'Large'], warranty: '2 Years', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=75', desc: 'Compact study table with an attached bookshelf, ideal for students and home offices.' },
  { name: 'Wooden Dining Chair (Set of 2)', category: 'chairs', materialType: 'wood', material: 'Solid Sheesham Wood', price: 3499, colors: [{ n: 'Natural Teak', h: '#A9743F' }, { n: 'Walnut Brown', h: '#6B4226' }], sizes: ['Standard'], warranty: '2 Years', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=75', desc: 'A pair of solid wood dining chairs with a cushioned seat for everyday comfort.' },
  { name: 'LED TV Unit with Storage', category: 'tvunit', materialType: 'wood', material: 'Engineered Wood', price: 8999, colors: [{ n: 'Pearl White', h: '#F5F1EA' }, { n: 'Wenge Brown', h: '#4A372C' }], sizes: ['Up to 55"', 'Up to 65"'], warranty: '2 Years', stock: 'in-stock', badge: 'New Arrival', img: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=75', desc: 'A sleek floating TV unit with ample storage to keep your living room clutter-free.' },
  { name: '3-Shelf Shoe Rack Cabinet', category: 'shoerack', materialType: 'wood', material: 'Engineered Wood', price: 3999, colors: [{ n: 'Pearl White', h: '#F5F1EA' }, { n: 'Walnut Brown', h: '#6B4226' }], sizes: ['2-Shelf', '3-Shelf'], warranty: '1 Year', stock: 'limited', badge: '', img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=600&q=75', desc: 'A space-saving shoe cabinet with ventilated shelving and a closed-door finish.' },
  { name: 'Dressing Table with Mirror & Stool', category: 'dressing', materialType: 'wood', material: 'Engineered Wood', price: 7999, colors: [{ n: 'Pearl White', h: '#F5F1EA' }, { n: 'Blush Pink', h: '#C98E72' }], sizes: ['Compact', 'Large'], warranty: '2 Years', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=600&q=75', desc: 'An elegant dressing table with a framed mirror, drawers and a matching stool.' },
  { name: 'Modular Living Room Unit', category: 'modular', materialType: 'wood', material: 'Marine Plywood & Laminate', price: 38999, colors: [{ n: 'Glossy White', h: '#F5F1EA' }, { n: 'Walnut Brown', h: '#6B4226' }], sizes: ['Customizable'], warranty: '5 Years', stock: 'limited', badge: '', img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=600&q=75', desc: 'A fully modular living-room storage and display unit, designed to fit your wall.' },
  { name: 'Heavy-Duty Plastic Chair (Set of 4)', category: 'plastic', materialType: 'plastic', material: 'Virgin Plastic', price: 1999, colors: [{ n: 'Red', h: '#B33A3A' }, { n: 'Green', h: '#4C8C5B' }, { n: 'White', h: '#FFFFFF' }, { n: 'Blue', h: '#3D6FB4' }], sizes: ['Standard'], warranty: '1 Year', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=600&q=75', desc: 'Stackable, weather-resistant plastic chairs — perfect for home and outdoor events.' },
  { name: 'Decorative Wall Art Frame Set', category: 'decor', materialType: 'wood', material: 'Wood & Canvas', price: 1499, colors: [{ n: 'Gold', h: '#C9A227' }, { n: 'Walnut Brown', h: '#6B4226' }], sizes: ['Medium', 'Large'], warranty: 'NA', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a2c?auto=format&fit=crop&w=600&q=75', desc: 'A curated set of framed wall art to add character to any room.' },
  { name: 'Premium Decorative Ceiling Fan', category: 'electrical', materialType: 'metal', material: 'Metal', price: 3299, colors: [{ n: 'Brown-Gold', h: '#8A6A2C' }, { n: 'White', h: '#FFFFFF' }], sizes: ['48-inch'], warranty: '2 Years', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=600&q=75', desc: 'An energy-efficient, decorative ceiling fan that complements premium interiors.' },
  { name: 'Multi-Purpose Storage Cabinet', category: 'storage', materialType: 'wood', material: 'Engineered Wood', price: 6999, colors: [{ n: 'Pearl White', h: '#F5F1EA' }, { n: 'Grey', h: '#6E6E6E' }], sizes: ['2-Door', '3-Door'], warranty: '2 Years', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1597072689227-6e63a93b3a36?auto=format&fit=crop&w=600&q=75', desc: 'A versatile storage cabinet for the living room, kitchen or utility area.' },
  { name: 'Glass Top Center Table', category: 'centertable', materialType: 'glass', material: 'Wood & Tempered Glass', price: 4499, colors: [{ n: 'Walnut Brown', h: '#6B4226' }, { n: 'Black', h: '#1C1C1C' }], sizes: ['Standard'], warranty: '1 Year', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=600&q=75', desc: 'A modern center table with a tempered-glass top and a solid wood base.' },
  { name: 'Computer Table with CPU Stand', category: 'computertable', materialType: 'wood', material: 'Engineered Wood', price: 3799, colors: [{ n: 'Pearl White', h: '#F5F1EA' }, { n: 'Walnut Brown', h: '#6B4226' }], sizes: ['Compact'], warranty: '1 Year', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=600&q=75', desc: 'A compact computer table with a dedicated CPU stand and keyboard tray.' },
  { name: 'Modular Kitchen Cabinet Set', category: 'kitchen', materialType: 'wood', material: 'Marine Plywood & Laminate', price: 45999, colors: [{ n: 'Glossy White', h: '#F5F1EA' }, { n: 'Walnut Brown', h: '#6B4226' }], sizes: ['Customizable'], warranty: '5 Years', stock: 'limited', badge: 'New Arrival', img: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?auto=format&fit=crop&w=600&q=75', desc: 'A complete modular kitchen cabinet system, designed and installed to your layout.' },
  { name: 'Kids Bunk Bed with Slide', category: 'kids', materialType: 'wood', material: 'Engineered Wood', price: 19999, colors: [{ n: 'Sky Blue', h: '#3D6FB4' }, { n: 'Blossom Pink', h: '#D98BA0' }, { n: 'Natural', h: '#C8956D' }], sizes: ['Single over Single'], warranty: '2 Years', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1505691723518-36a5ac3be353?auto=format&fit=crop&w=600&q=75', desc: 'A fun and sturdy bunk bed with an integrated slide, loved by kids and parents alike.' },
  { name: 'Decorative Wall Mirror – Gold Frame', category: 'mirrors', materialType: 'glass', material: 'Wood & Glass', price: 2499, colors: [{ n: 'Gold', h: '#C9A227' }, { n: 'Walnut Brown', h: '#6B4226' }], sizes: ['Medium', 'Large'], warranty: 'NA', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=600&q=75', desc: 'A statement wall mirror with a hand-finished gold frame.' },
  { name: 'Solid Sheesham Wood Bookshelf', category: 'wooden', materialType: 'wood', material: 'Solid Sheesham Wood', price: 8999, colors: [{ n: 'Natural Teak', h: '#A9743F' }, { n: 'Walnut Brown', h: '#6B4226' }], sizes: ['3-Tier', '5-Tier'], warranty: '3 Years', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=600&q=75', desc: 'A solid wood bookshelf showcasing genuine grain and joinery craftsmanship.' },
  { name: '3-Door Steel Almirah', category: 'steel', materialType: 'metal', material: 'Powder-Coated Steel', price: 13999, colors: [{ n: 'Grey', h: '#6E6E6E' }, { n: 'Ivory', h: '#F1E8D8' }], sizes: ['3-Door', '4-Door'], warranty: '5 Years', stock: 'in-stock', badge: '', img: 'https://images.unsplash.com/photo-1581539250439-c9f9650a4dd0?auto=format&fit=crop&w=600&q=75', desc: 'A durable steel almirah with a locker, ideal for safekeeping valuables and linens.' },
  { name: 'Outdoor Garden Swing Chair', category: 'outdoor', materialType: 'metal', material: 'Powder-Coated Iron & Rope', price: 15999, colors: [{ n: 'Black', h: '#1C1C1C' }, { n: 'White', h: '#FFFFFF' }], sizes: ['Standard'], warranty: '1 Year', stock: 'limited', badge: '', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=75', desc: 'A relaxing outdoor swing chair, weather-treated for balconies, gardens and terraces.' },
];

const GALLERY = [
  { img: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=700&q=75', tab: 'living', caption: 'Living room sofa display' },
  { img: 'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=700&q=75', tab: 'living', caption: 'Modern living room setup' },
  { img: 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?auto=format&fit=crop&w=700&q=75', tab: 'living', caption: 'Premium sofa upholstery' },
  { img: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?auto=format&fit=crop&w=700&q=75', tab: 'living', caption: 'Center table styling' },
  { img: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=700&q=75', tab: 'bedroom', caption: 'Bedroom furniture display' },
  { img: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=700&q=75', tab: 'bedroom', caption: 'Cosy bedroom interior' },
  { img: 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=700&q=75', tab: 'bedroom', caption: 'Wardrobe & storage' },
  { img: 'https://images.unsplash.com/photo-1582582621959-48d27397dc69?auto=format&fit=crop&w=700&q=75', tab: 'bedroom', caption: 'Dressing table corner' },
  { img: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=700&q=75', tab: 'office', caption: 'Home office setup' },
  { img: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=700&q=75', tab: 'office', caption: 'Study table arrangement' },
  { img: 'https://images.unsplash.com/photo-1519710164239-da123dc03ef4?auto=format&fit=crop&w=700&q=75', tab: 'office', caption: 'Compact workstation' },
  { img: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a2c?auto=format&fit=crop&w=700&q=75', tab: 'decor', caption: 'Home decor accents' },
  { img: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=700&q=75', tab: 'decor', caption: 'Styled showroom corner' },
  { img: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=700&q=75', tab: 'electrical', caption: 'Decorative lighting' },
  { img: 'https://images.unsplash.com/photo-1556909114-44e3e70034e2?auto=format&fit=crop&w=700&q=75', tab: 'electrical', caption: 'Kitchen & electrical fittings' },
];

const FAQS = [
  { q: 'Do you offer home delivery?', a: 'Yes, we offer free home delivery within Kuchaman City limits. For locations outside Kuchaman City, delivery charges may apply depending on distance.' },
  { q: 'Is EMI available on furniture purchases?', a: 'Yes, EMI options are available on most purchases through leading banks and cards. Speak to our showroom staff for current EMI plans.' },
  { q: 'Can I get furniture customized to my requirements?', a: 'Absolutely — our in-house workshop can customise size, material, fabric and finish for most furniture categories, including fully custom designs.' },
  { q: 'What is your warranty policy?', a: 'Warranty varies by product, ranging from 1 to 7 years, and is clearly mentioned on every product card and invoice.' },
  { q: 'Do you provide assembly and installation?', a: 'Yes, professional assembly and installation is included free of cost for all major furniture purchases within Kuchaman City.' },
  { q: 'Can I get a price quote without visiting the showroom?', a: 'Yes, simply WhatsApp us a photo or description of what you need, or fill out our contact form, and we will share a detailed quote.' },
  { q: 'What payment methods do you accept?', a: 'We accept cash, all major debit/credit cards, UPI, and bank transfers, along with EMI options on eligible purchases.' },
  { q: 'Do you deliver outside Kuchaman City?', a: 'Yes, we deliver across Rajasthan and to select cities outside the state. Delivery charges depend on the destination and order size.' },
];

const PRICELIST = [
  { item: 'Sofa Set', price: '₹18,999' },
  { item: 'Double Bed', price: '₹14,999' },
  { item: 'Dining Table', price: '₹9,999' },
  { item: 'Wardrobe', price: '₹11,999' },
  { item: 'Mattress', price: '₹4,999' },
  { item: 'Office Chair', price: '₹2,999' },
  { item: 'TV Unit', price: '₹8,999' },
  { item: 'Study Table', price: '₹5,999' },
  { item: 'Dressing Table', price: '₹7,999' },
  { item: 'Shoe Rack', price: '₹3,999' },
];

const WHY_US = [
  { icon: 'fa-gem', title: 'Premium Quality', text: 'Every piece is checked for build quality and finishing before it reaches the showroom floor.' },
  { icon: 'fa-tag', title: 'Affordable Prices', text: 'Direct sourcing keeps our prices honest, without compromising on material or craftsmanship.' },
  { icon: 'fa-layer-group', title: 'Large Collection', text: '100+ designs across 24 categories — furniture, decor and electrical essentials, all in one place.' },
  { icon: 'fa-award', title: 'Trusted Since Years', text: '12+ years of serving families across Kuchaman City and Rajasthan with consistent quality.' },
  { icon: 'fa-truck-fast', title: 'Fast Delivery', text: 'Free, prompt delivery within Kuchaman City with careful handling and professional installation.' },
  { icon: 'fa-pen-ruler', title: 'Custom Furniture', text: 'Our in-house workshop builds furniture tailored exactly to your space and style.' },
  { icon: 'fa-headset', title: 'Best Customer Service', text: 'Friendly, no-pressure guidance before your purchase and dedicated support after.' },
  { icon: 'fa-shield-halved', title: 'Warranty You Can Trust', text: 'Clear, honest warranty terms on every product — up to 7 years on select items.' },
];

async function seedData() {
  await connectDB();

  console.log(`\n======================================================`);
  console.log(`  BIJARNIYA FURNITURE — DATABASE MIGRATION & SEEDING`);
  console.log(`======================================================\n`);

  try {
    // Seed Categories
    console.log(`Seeding Categories (${CATEGORIES.length} items)...`);
    for (const cat of CATEGORIES) {
      await Category.findOneAndUpdate({ id: cat.id }, cat, { upsert: true, new: true });
    }
    console.log(`✅ Categories seeded.`);

    // Seed Products
    console.log(`Seeding Products (${PRODUCTS.length} items)...`);
    for (const p of PRODUCTS) {
      await Product.findOneAndUpdate({ name: p.name }, p, { upsert: true, new: true });
    }
    console.log(`✅ Products seeded.`);

    // Seed Gallery
    console.log(`Seeding Gallery (${GALLERY.length} items)...`);
    for (const g of GALLERY) {
      await Gallery.findOneAndUpdate({ img: g.img }, g, { upsert: true, new: true });
    }
    console.log(`✅ Gallery seeded.`);

    // Seed Settings
    console.log(`Seeding Website Settings & FAQs...`);
    let settings = await Settings.findOne({});
    if (!settings) {
      settings = new Settings({
        faqs: FAQS,
        priceList: PRICELIST,
        whyUs: WHY_US,
      });
      await settings.save();
    } else {
      if (!settings.faqs || settings.faqs.length === 0) settings.faqs = FAQS;
      if (!settings.priceList || settings.priceList.length === 0) settings.priceList = PRICELIST;
      if (!settings.whyUs || settings.whyUs.length === 0) settings.whyUs = WHY_US;
      await settings.save();
    }
    console.log(`✅ Settings seeded.`);

    console.log(`\n🎉 Data seeding completed successfully! All catalogue content is stored in MongoDB.\n`);
  } catch (error) {
    console.error(`❌ Data seeding error:`, error);
  } finally {
    await mongoose.disconnect();
    console.log(`Disconnected from MongoDB.`);
  }
}

seedData();
