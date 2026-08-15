/**
 * gallery.js
 * ---------------------------------------------------------------------
 * Showroom gallery tabs + grid, and the lightbox (click, Escape, and
 * Left/Right arrow key navigation).
 * Fetches dynamic gallery data from /api/gallery with static fallback.
 * ---------------------------------------------------------------------
 */

import { GALLERY as STATIC_GALLERY } from './data.js';
import { CONFIG } from './config.js';
import { $, $$ } from './ui.js';

const galleryChipsEl = $('#galleryChips');
const galleryGridEl = $('#galleryGrid');
const lightboxEl = $('#lightbox');
const lbImgEl = $('#lbImg');
const lbCaptionEl = $('#lbCaption');
const lbCloseEl = $('#lbClose');
const lbPrevEl = $('#lbPrev');
const lbNextEl = $('#lbNext');

const TABS = [
  { id: 'all', name: 'All' },
  { id: 'living', name: 'Living Room' },
  { id: 'bedroom', name: 'Bedroom' },
  { id: 'office', name: 'Office' },
  { id: 'decor', name: 'Home Decor' },
  { id: 'electrical', name: 'Electrical' },
];

let activeIndex = 0;
let currentGallery = STATIC_GALLERY;

function galleryItemHTML(item, globalIndex) {
  return `
    <div class="gallery-item" data-idx="${globalIndex}" role="button" tabindex="0" aria-label="View ${item.caption || 'Gallery Image'}">
      <img src="${item.img}" alt="${item.caption || 'Gallery Image'}" loading="lazy">
      <span class="gz"><i class="fa-solid fa-magnifying-glass-plus" aria-hidden="true"></i></span>
    </div>`;
}

function updateLightbox() {
  if (currentGallery.length === 0) return;
  const item = currentGallery[activeIndex];
  if (!item) return;
  lbImgEl.src = item.img;
  lbImgEl.alt = item.caption || 'Showroom Photo';
  lbCaptionEl.textContent = item.caption || '';
}

function openLightbox(globalIndex) {
  activeIndex = globalIndex;
  updateLightbox();
  lightboxEl.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightboxEl.classList.remove('open');
  document.body.style.overflow = '';
}

function showPrev() {
  if (currentGallery.length === 0) return;
  activeIndex = (activeIndex - 1 + currentGallery.length) % currentGallery.length;
  updateLightbox();
}

function showNext() {
  if (currentGallery.length === 0) return;
  activeIndex = (activeIndex + 1) % currentGallery.length;
  updateLightbox();
}

function bindGalleryItemEvents() {
  $$('.gallery-item', galleryGridEl).forEach((item) => {
    item.addEventListener('click', () => openLightbox(Number(item.dataset.idx)));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(Number(item.dataset.idx));
      }
    });
  });
}

function renderGallery(activeTab = 'all') {
  if (!galleryChipsEl || !galleryGridEl) return;

  galleryChipsEl.innerHTML = TABS.map(
    (t) => `<button type="button" class="chip ${t.id === activeTab ? 'active' : ''}" data-tab="${t.id}">${t.name}</button>`
  ).join('');
  $$('.chip', galleryChipsEl).forEach((chip) => chip.addEventListener('click', () => renderGallery(chip.dataset.tab)));

  const items = activeTab === 'all' ? currentGallery : currentGallery.filter((g) => g.tab === activeTab);
  galleryGridEl.innerHTML = items.map((item) => galleryItemHTML(item, currentGallery.indexOf(item))).join('');
  bindGalleryItemEvents();
}

function bindLightboxEvents() {
  if (!lightboxEl) return;
  lbCloseEl?.addEventListener('click', closeLightbox);
  lightboxEl.addEventListener('click', (e) => {
    if (e.target === lightboxEl) closeLightbox();
  });
  lbPrevEl?.addEventListener('click', showPrev);
  lbNextEl?.addEventListener('click', showNext);
  document.addEventListener('keydown', (e) => {
    if (!lightboxEl.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showPrev();
    if (e.key === 'ArrowRight') showNext();
  });
}

export async function initGallery() {
  try {
    const res = await fetch(`${CONFIG.apiBaseUrl}/api/gallery`);
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items) && items.length > 0) currentGallery = items;
    }
  } catch (err) {
    console.warn('Using static gallery fallback:', err);
  }

  renderGallery();
  bindLightboxEvents();
}