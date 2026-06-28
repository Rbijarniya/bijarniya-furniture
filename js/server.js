/**
 * server.js
 * ---------------------------------------------------------------------
 * Bijarniya Furniture — backend API
 *
 * Responsibilities:
 *  1. Serve the static frontend (../index.html, ../css, ../js, ../images)
 *     so the whole site can run from a single Node process in production.
 *  2. Expose GET /api/reviews, which calls the Google Places API
 *     ("Place Details") server-side and returns a small, frontend-ready
 *     shape: { rating, user_ratings_total, reviews }.
 *
 * The Google API key NEVER reaches the browser — it is read from
 * process.env (see .env.example) and used only in this file.
 * ---------------------------------------------------------------------
 */

require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

const PORT = process.env.PORT || 4000;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const GOOGLE_PLACE_ID = process.env.GOOGLE_PLACE_ID;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const CACHE_TTL_MINUTES = Number(process.env.CACHE_TTL_MINUTES || 60);

/* ---------------------------------------------------------------------
   Middleware
   --------------------------------------------------------------------- */
app.use(cors({ origin: ALLOWED_ORIGIN }));
app.use(express.json());

// Serve the static frontend from the project root (one level up from /server).
const PROJECT_ROOT = path.join(__dirname, '..');
app.use(express.static(PROJECT_ROOT));

/* ---------------------------------------------------------------------
   Tiny in-memory cache so we don't call Google on every page load
   (Google Places API billing is per-request).
   --------------------------------------------------------------------- */
let cache = { data: null, fetchedAt: 0 };

function isCacheFresh() {
  if (!cache.data) return false;
  const ageMinutes = (Date.now() - cache.fetchedAt) / 60000;
  return ageMinutes < CACHE_TTL_MINUTES;
}

/* ---------------------------------------------------------------------
   Google Places — Place Details
   --------------------------------------------------------------------- */
async function fetchGoogleReviews() {
  if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
    throw new Error('GOOGLE_PLACES_API_KEY or GOOGLE_PLACE_ID is missing. Check /server/.env.');
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
    throw new Error(`Google Places API returned status: ${data.status}${data.error_message ? ` (${data.error_message})` : ''}`);
  }

  const result = data.result || {};

  // Note: Google's Place Details endpoint returns at most ~5 reviews.
  // "Read All Reviews" in the UI links out to the full Google Maps
  // listing (see js/config.js -> google.readReviewsUrl) for the rest.
  const reviews = (result.reviews || []).map((review) => ({
    author_name: review.author_name,
    profile_photo_url: review.profile_photo_url,
    rating: review.rating,
    relative_time_description: review.relative_time_description,
    text: review.text,
    time: review.time,
  }));

  return {
    rating: typeof result.rating === 'number' ? result.rating : null,
    user_ratings_total: typeof result.user_ratings_total === 'number' ? result.user_ratings_total : null,
    reviews,
  };
}

/* ---------------------------------------------------------------------
   Routes
   --------------------------------------------------------------------- */
app.get('/api/reviews', async (req, res) => {
  try {
    if (isCacheFresh()) {
      return res.json(cache.data);
    }

    const payload = await fetchGoogleReviews();
    cache = { data: payload, fetchedAt: Date.now() };
    return res.json(payload);
  } catch (err) {
    console.error('Failed to fetch Google reviews:', err.message);

    // Serve stale cached data rather than nothing, if we have any.
    if (cache.data) {
      return res.json(cache.data);
    }

    return res.status(502).json({ error: 'Unable to load reviews right now.' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, uptimeSeconds: Math.round(process.uptime()) });
});

/* ---------------------------------------------------------------------
   Start
   --------------------------------------------------------------------- */
app.listen(PORT, () => {
  console.log(`Bijarniya Furniture server running on http://localhost:${PORT}`);
  if (!GOOGLE_PLACES_API_KEY || !GOOGLE_PLACE_ID) {
    console.warn('⚠️  GOOGLE_PLACES_API_KEY / GOOGLE_PLACE_ID not set — /api/reviews will return an error until /server/.env is configured.');
  }
});