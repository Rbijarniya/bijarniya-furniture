require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const axios = require('axios');

const connectDB = require('./db');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const galleryRoutes = require('./routes/galleryRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const offerRoutes = require('./routes/offerRoutes');
const priceListRoutes = require('./routes/priceListRoutes');

const app = express();

const PORT = process.env.PORT || 4000;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const CACHE_TTL_MINUTES = Number(process.env.CACHE_TTL_MINUTES || 60);

// We will connect to MongoDB right before starting the server

/* ---------------------------------------------------------------------
   Security & Global Middleware
   --------------------------------------------------------------------- */
app.use(
  helmet({
    contentSecurityPolicy: false, // allow external Google fonts, fontawesome, unsplash images
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const PROJECT_ROOT = path.join(__dirname, '..');

// Serve uploaded image assets from /uploads
app.use('/uploads', express.static(path.join(PROJECT_ROOT, 'uploads')));

// Serve the static frontend and admin files from the project root
app.use(express.static(PROJECT_ROOT));

/* ---------------------------------------------------------------------
   Google Places Reviews (Proxy & In-Memory Cache)
   --------------------------------------------------------------------- */
let reviewsCache = { data: null, fetchedAt: 0 };

function isCacheFresh() {
  if (!reviewsCache.data) return false;
  const ageMinutes = (Date.now() - reviewsCache.fetchedAt) / 60000;
  return ageMinutes < CACHE_TTL_MINUTES;
}

async function fetchGoogleReviews() {
  if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
    throw new Error('GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID is missing.');
  }

  const { data } = await axios.get('https://maps.googleapis.com/maps/api/place/details/json', {
    params: {
      place_id: GOOGLE_PLACE_ID,
      fields: 'name,rating,user_ratings_total,reviews',
      key: GOOGLE_PLACES_API_KEY,
    },
    timeout: 8000,
  });

  if (data.status !== 'OK') {
    throw new Error(`Google Places API returned status: ${data.status}`);
  }

  const result = data.result || {};
  const reviews = (result.reviews || []).map((review) => ({
    author_name: review.author_name,
    profile_photo_url: review.profile_photo_url,
    rating: review.rating,
    relative_time_description: review.relative_time_description,
    text: review.text,
    time: review.time,
  }));

  return {
    rating: typeof result.rating === 'number' ? result.rating : 4.9,
    user_ratings_total: typeof result.user_ratings_total === 'number' ? result.user_ratings_total : 150,
    reviews,
  };
}

app.get('/api/reviews', async (req, res) => {
  try {
    if (isCacheFresh()) {
      return res.json(reviewsCache.data);
    }
    const payload = await fetchGoogleReviews();
    reviewsCache = { data: payload, fetchedAt: Date.now() };
    return res.json(payload);
  } catch (err) {
    if (reviewsCache.data) {
      return res.json(reviewsCache.data);
    }
    // Google Places API is not configured or unavailable — return empty
    return res.status(503).json({ error: 'Google Reviews are temporarily unavailable.' });
  }
});

/* ---------------------------------------------------------------------
   Database Connection Middleware (For Serverless)
   --------------------------------------------------------------------- */
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database Connection Error:', err);
    res.status(500).json({ error: 'Database connection failed.' });
  }
});

/* ---------------------------------------------------------------------
   API Routes
   --------------------------------------------------------------------- */
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/upload', mediaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/customer-reviews', reviewRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/pricelist', priceListRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date(), uptimeSeconds: Math.round(process.uptime()) });
});

/* ---------------------------------------------------------------------
   Admin Panel Route Fallbacks
   --------------------------------------------------------------------- */
app.get('/admin', (req, res) => {
  res.sendFile(path.join(PROJECT_ROOT, 'admin', 'index.html'));
});

app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(PROJECT_ROOT, 'admin', 'login.html'));
});

/* ---------------------------------------------------------------------
   Global Error Handler
   --------------------------------------------------------------------- */
app.use((err, req, res, next) => {
  console.error('Unhandled Express Error:', err);
  res.status(500).json({ error: err.message || 'An internal server error occurred.' });
});

/* ---------------------------------------------------------------------
   Start Server (Local Development) or Export (Vercel)
   --------------------------------------------------------------------- */
if (process.env.NODE_ENV !== 'production') {
  (async () => {
    try {
      await connectDB();
    } catch (err) {
      console.error(`\n❌ MongoDB Connection Failed: ${err.message}`);
      console.error('Server will NOT start without a working database connection.');
      console.error('Fix your MONGODB_URI in .env and try again.\n');
      process.exit(1);
    }

    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 Bijarniya Furniture server running on http://localhost:${PORT}`);
      console.log(`🔑 Admin Panel available at: http://localhost:${PORT}/admin`);
      console.log(`======================================================\n`);
    });
  })();
}

module.exports = app;

