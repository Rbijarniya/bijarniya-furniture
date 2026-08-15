/**
 * reviews.js
 * ---------------------------------------------------------------------
 * Manages Customer Reviews from MongoDB on the public website.
 *
 * - Loads approved reviews from /api/customer-reviews
 * - Renders review cards (name, rating, comment, date, admin reply)
 * - Mobile number is NEVER displayed publicly
 * - Write a Review form: name, mobile (required, 10 digits), rating, comment
 * - Submitted reviews saved as "pending" — only admin-approved ones show
 * ---------------------------------------------------------------------
 */

import { CONFIG } from './config.js';
import { $ } from './ui.js';

/* =====================================================================
   Shared helpers
   ===================================================================== */
const AVATAR_PALETTE = ['#6B4226', '#C9A227', '#3F7D4F', '#7B1E2B', '#46291C', '#B98856', '#3D6FB4', '#8A6A2C'];
const SKELETON_COUNT = 3;

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
  return name.split(' ').filter(Boolean).map((p) => p[0]).join('').slice(0, 2).toUpperCase();
}

function colorFromName(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length];
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch { return ''; }
}

/* =====================================================================
   Skeleton loading card
   ===================================================================== */
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

/* =====================================================================
   Customer review card (MongoDB)
   Mobile is NEVER rendered — only name, rating, comment, date, reply
   ===================================================================== */
function customerReviewCardHTML(review) {
  const name = escapeHTML(review.name || 'Anonymous');
  const avatarHTML = `<span class="avatar" style="background:${colorFromName(review.name || '')}">${initialsFromName(review.name || '')}</span>`;

  const replyHTML = review.adminReply
    ? `<div class="review-reply">
        <i class="fa-solid fa-reply" aria-hidden="true"></i>
        <div>
          <b>Owner's Reply</b>
          <p>${escapeHTML(review.adminReply)}</p>
        </div>
       </div>`
    : '';

  return `
    <div class="review-card">
      <i class="fa-solid fa-quote-right quote-ic" aria-hidden="true"></i>
      <div class="stars" aria-label="${review.rating} out of 5 stars">${starString(review.rating)}</div>
      <p>"${escapeHTML(review.comment)}"</p>
      <div class="review-person">
        ${avatarHTML}
        <div>
          <b>${name}</b>
          <span>${formatDate(review.createdAt)}</span>
        </div>
      </div>
      ${replyHTML}
    </div>`;
}

/* =====================================================================
   Render helpers
   ===================================================================== */
const customerGridEl = $('#customerReviewsGrid');
const customerRatingEl = $('#customerAvgRating');
const customerCountEl = $('#customerReviewCount');

function renderSkeletons() {
  if (!customerGridEl) return;
  customerGridEl.setAttribute('aria-busy', 'true');
  customerGridEl.innerHTML = Array.from({ length: SKELETON_COUNT }).map(skeletonCardHTML).join('');
}

function renderEmpty() {
  if (!customerGridEl) return;
  customerGridEl.removeAttribute('aria-busy');
  customerGridEl.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1;">
      <i class="fa-solid fa-star-half-stroke" aria-hidden="true"></i>
      <p>No reviews yet. Be the first to share your experience!</p>
    </div>`;
}

function renderError() {
  if (!customerGridEl) return;
  customerGridEl.removeAttribute('aria-busy');
  customerGridEl.innerHTML = `
    <div class="empty-state" style="grid-column:1/-1;">
      <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
      <p>Unable to load reviews right now. Please try again later.</p>
    </div>`;
}

function renderReviews(reviews) {
  if (!customerGridEl) return;
  customerGridEl.removeAttribute('aria-busy');
  if (!reviews || reviews.length === 0) { renderEmpty(); return; }
  customerGridEl.innerHTML = reviews.map(customerReviewCardHTML).join('');
}

function updateBadge(avgRating, total) {
  if (customerRatingEl) {
    customerRatingEl.textContent = total > 0 ? `${avgRating.toFixed(1)} / 5` : '';
  }
  if (customerCountEl) {
    customerCountEl.textContent = total > 0
      ? `${total} verified customer review${total !== 1 ? 's' : ''}`
      : '';
  }
}

/* =====================================================================
   Load reviews from API
   ===================================================================== */
async function loadCustomerReviews() {
  renderSkeletons();
  try {
    const res = await fetch(`${CONFIG.apiBaseUrl}/api/customer-reviews`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
    const data = await res.json();
    updateBadge(data.avgRating || 0, data.total || 0);
    renderReviews(data.reviews);
  } catch (err) {
    console.error('Failed to load customer reviews:', err);
    renderError();
  }
}

/* =====================================================================
   Write Review Modal
   ===================================================================== */
const reviewModal = $('#reviewModal');
const reviewModalClose = $('#reviewModalClose');
const reviewForm = $('#reviewForm');
const reviewFormMsg = $('#reviewFormMsg');
const writeReviewBtnEl = $('#writeReviewBtn');

function openReviewModal() {
  if (!reviewModal) return;
  reviewModal.classList.remove('hidden');
  reviewModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  if (reviewFormMsg) reviewFormMsg.classList.add('hidden');
  if (reviewForm) reviewForm.reset();
  document.querySelectorAll('.star-input-btn').forEach((b) => b.classList.remove('active'));
  const ri = $('#reviewRating');
  if (ri) ri.value = '';
}

function closeReviewModal() {
  if (!reviewModal) return;
  reviewModal.classList.add('hidden');
  reviewModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function showFormMsg(msg, isSuccess) {
  if (!reviewFormMsg) return;
  reviewFormMsg.textContent = msg;
  reviewFormMsg.className = isSuccess ? 'form-success-msg' : 'form-error-msg';
  reviewFormMsg.classList.remove('hidden');
}

/* ── Star Input Interaction ── */
function initStarInput() {
  let selectedRating = 0;
  const ratingInput = $('#reviewRating');
  const starBtns = document.querySelectorAll('.star-input-btn');

  function highlight(upTo) {
    starBtns.forEach((btn, idx) => btn.classList.toggle('active', idx < upTo));
  }

  starBtns.forEach((btn, idx) => {
    btn.addEventListener('mouseenter', () => highlight(idx + 1));
    btn.addEventListener('mouseleave', () => highlight(selectedRating));
    btn.addEventListener('click', () => {
      selectedRating = idx + 1;
      if (ratingInput) ratingInput.value = selectedRating;
      highlight(selectedRating);
    });
  });
}

/* ── Mobile: only allow numeric input ── */
function initMobileInput() {
  const mobileEl = $('#reviewMobile');
  if (!mobileEl) return;
  mobileEl.addEventListener('input', () => {
    // Strip anything that's not a digit
    mobileEl.value = mobileEl.value.replace(/\D/g, '').slice(0, 10);
  });
}

/* ── Review Form Submit ── */
function initReviewForm() {
  if (!reviewForm) return;

  reviewForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = reviewForm.querySelector('button[type="submit"]');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnSpinner = submitBtn?.querySelector('.btn-spinner');

    const name = ($('#reviewName')?.value || '').trim();
    const mobile = ($('#reviewMobile')?.value || '').replace(/\D/g, '');
    const rating = parseInt($('#reviewRating')?.value || '0', 10);
    const comment = ($('#reviewComment')?.value || '').trim();

    // Frontend validation
    if (!name) { showFormMsg('Please enter your name.', false); return; }

    if (!mobile || mobile.length !== 10) {
      showFormMsg('Please enter a valid 10-digit mobile number.', false);
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      showFormMsg('Please select a star rating.', false);
      return;
    }

    if (comment.length < 10) {
      showFormMsg('Please write at least 10 characters in your review.', false);
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.classList.add('hidden');
    if (btnSpinner) btnSpinner.classList.remove('hidden');

    try {
      const res = await fetch(`${CONFIG.apiBaseUrl}/api/customer-reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, mobile, rating, comment }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed.');
      showFormMsg('Thank you! Your review has been submitted and is awaiting approval.', true);
      reviewForm.reset();
      document.querySelectorAll('.star-input-btn').forEach((b) => b.classList.remove('active'));
      const ri = $('#reviewRating');
      if (ri) ri.value = '';
    } catch (err) {
      showFormMsg(err.message, false);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.classList.remove('hidden');
      if (btnSpinner) btnSpinner.classList.add('hidden');
    }
  });
}

/* =====================================================================
   Entry point — called from app.js
   ===================================================================== */
export async function initReviews() {
  // Write Review button → opens modal
  if (writeReviewBtnEl) {
    writeReviewBtnEl.addEventListener('click', (e) => {
      e.preventDefault();
      openReviewModal();
    });
  }

  // Modal close events
  if (reviewModalClose) reviewModalClose.addEventListener('click', closeReviewModal);
  if (reviewModal) {
    reviewModal.addEventListener('click', (e) => {
      if (e.target === reviewModal) closeReviewModal();
    });
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && reviewModal && !reviewModal.classList.contains('hidden')) {
      closeReviewModal();
    }
  });

  initStarInput();
  initMobileInput();
  initReviewForm();

  await loadCustomerReviews();
}