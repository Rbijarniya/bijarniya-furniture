/**
 * reviews.js
 * ---------------------------------------------------------------------
 * Replaces the old hardcoded REVIEWS array with live Google Reviews,
 * fetched from our own backend (/api/reviews) — never call the Google
 * Places API directly from the browser, since that would require
 * exposing the API key client-side.
 *
 * Renders the same .review-card markup/classes as before (same design),
 * shows shimmering skeleton cards while loading, and falls back to a
 * friendly message (reusing the existing .empty-state look) on error.
 * ---------------------------------------------------------------------
 */

import { CONFIG } from './config.js';
import { $ } from './ui.js';

const reviewsGridEl = $('#reviewsGrid');
const ratingValueEl = $('#googleRatingValue');
const ratingCountEl = $('#googleRatingCount');
const writeReviewBtnEl = $('#writeReviewBtn');
const readReviewsBtnEl = $('#readReviewsBtn');

const AVATAR_PALETTE = ['#6B4226', '#C9A227', '#3F7D4F', '#7B1E2B', '#46291C', '#B98856', '#3D6FB4', '#8A6A2C'];
const SKELETON_COUNT = 6;

function escapeHTML(value = '') {
  const div = document.createElement('div');
  div.textContent = value;
  return div.innerHTML;
}

function starString(rating) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating || 0)));
  return '★'.repeat(rounded) + '☆'.repeat(5 - rounded);
}

function initialsFromName(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function colorFromName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i += 1) hash += name.charCodeAt(i);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function skeletonCardHTML() {
  return `
    <div class="review-card skeleton" aria-hidden="true">
      <div class="skel-line skel-stars"></div>
      <div class="skel-line skel-text"></div>
      <div class="skel-line skel-text short"></div>
      <div class="review-person">
        <span class="avatar skel-avatar"></span>
        <div>
          <div class="skel-line skel-name"></div>
          <div class="skel-line skel-city"></div>
        </div>
      </div>
    </div>`;
}

function reviewCardHTML(review) {
  const name = review.author_name || 'Google User';
  const avatarHTML = review.profile_photo_url
    ? `<img class="avatar" style="object-fit:cover;" src="${review.profile_photo_url}" alt="${escapeHTML(name)}" loading="lazy" referrerpolicy="no-referrer">`
    : `<span class="avatar" style="background:${colorFromName(name)}">${initialsFromName(name)}</span>`;

  return `
    <div class="review-card">
      <i class="fa-solid fa-quote-right quote-ic" aria-hidden="true"></i>
      <div class="stars" aria-label="${review.rating || 5} out of 5 stars">${starString(review.rating)}</div>
      <p>"${escapeHTML(review.text || '')}"</p>
      <div class="review-person">
        ${avatarHTML}
        <div>
          <b>${escapeHTML(name)}</b>
          <span>${escapeHTML(review.relative_time_description || 'Google review')}</span>
        </div>
      </div>
    </div>`;
}

function renderSkeletons() {
  if (!reviewsGridEl) return;
  reviewsGridEl.setAttribute('aria-busy', 'true');
  reviewsGridEl.innerHTML = Array.from({ length: SKELETON_COUNT }).map(skeletonCardHTML).join('');
}

function renderError() {
  if (!reviewsGridEl) return;
  reviewsGridEl.removeAttribute('aria-busy');
  reviewsGridEl.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1;">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <p>Unable to load reviews right now.</p>
    </div>`;
}

function renderReviews(reviews) {
  if (!reviewsGridEl) return;
  reviewsGridEl.removeAttribute('aria-busy');
  if (!reviews || reviews.length === 0) {
    renderError();
    return;
  }
  reviewsGridEl.innerHTML = reviews.map(reviewCardHTML).join('');
}

function updateRatingBadge({ rating, user_ratings_total } = {}) {
  if (ratingValueEl && typeof rating === 'number') {
    ratingValueEl.textContent = `${rating.toFixed(1)} / 5`;
  }
  if (ratingCountEl && typeof user_ratings_total === 'number') {
    ratingCountEl.textContent = `based on ${user_ratings_total.toLocaleString('en-IN')}+ Google Reviews`;
  }
}

/**
 * Keep the page's Schema.org FurnitureStore JSON-LD in sync with the
 * live Google rating, so search engines see real, current numbers
 * instead of a number baked in at build time.
 */
function updateStructuredData({ rating, user_ratings_total } = {}) {
  const script = document.querySelector('script[type="application/ld+json"]');
  if (!script || typeof rating !== 'number') return;
  try {
    const json = JSON.parse(script.textContent);
    json.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: rating,
      reviewCount: user_ratings_total || 0,
    };
    script.textContent = JSON.stringify(json);
  } catch (err) {
    console.warn('Could not update structured data with the live rating:', err);
  }
}

function wireReviewButtons() {
  if (writeReviewBtnEl) writeReviewBtnEl.href = CONFIG.google.writeReviewUrl;
  if (readReviewsBtnEl) readReviewsBtnEl.href = CONFIG.google.readReviewsUrl;
}

export async function initReviews() {
  wireReviewButtons();
  if (!reviewsGridEl) return;

  renderSkeletons();

  try {
    const response = await fetch(`${CONFIG.apiBaseUrl}/api/reviews`);
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`);
    const data = await response.json();

    updateRatingBadge(data);
    updateStructuredData(data);
    renderReviews(data.reviews);
  } catch (err) {
    console.error('Failed to load Google reviews:', err);
    renderError();
  }
}