/**
 * hero.js
 * -----------------------------------------------------------------------
 * Fetches the active Hero Banner from MongoDB (/api/banners/hero) and
 * applies the content to the existing hero DOM elements.
 *
 * The visual design (layout, CSS, animations) is NEVER touched here.
 * Only the TEXT, IMAGE URLS, and LINKS are updated.
 * -----------------------------------------------------------------------
 */

import { CONFIG } from './config.js';

/**
 * Safely sets a DOM element's text content if it exists.
 */
function setText(id, value) {
  const el = document.getElementById(id);
  if (el && value) el.textContent = value;
}

/**
 * Safely sets an image src and alt if the element exists.
 */
function setImg(id, src, alt) {
  const el = document.getElementById(id);
  if (el && src) {
    el.src = src;
    if (alt) el.alt = alt;
  }
}

/**
 * Safely sets an anchor's href and text content.
 */
function setBtn(id, text, href) {
  const el = document.getElementById(id);
  if (!el) return;
  if (href) el.href = href;
  if (text) {
    // Preserve any child <i> icon element if present
    const icon = el.querySelector('i');
    el.textContent = text;
    if (icon) el.prepend(icon);
  }
}

/**
 * Apply banner data to hero DOM — called once data arrives from API.
 */
function applyHeroBanner(banner) {
  if (!banner) return;

  // Background image
  setImg('heroBgImg', banner.img, 'Hero background — Bijarniya Furniture');

  // Frame image (right side)
  setImg('heroFrameImg', banner.frameImg, 'Furniture display at Bijarniya Furniture');

  // Text content
  setText('heroEyebrow', banner.eyebrow);
  setText('heroFloatTitle', banner.floatCardTitle);
  setText('heroFloatSub', banner.floatCardSub);

  // h1 title — supports optional <em> wrap for the italic portion
  const titleEl = document.getElementById('heroTitle');
  if (titleEl && banner.title) {
    // If title contains a pipe character (e.g. "Transform Your Home | Premium Furniture")
    // wrap everything after the pipe in <em>. Otherwise display as-is.
    const pipeIdx = banner.title.indexOf('|');
    if (pipeIdx !== -1) {
      const before = banner.title.slice(0, pipeIdx).trim();
      const after  = banner.title.slice(pipeIdx + 1).trim();
      titleEl.innerHTML = `${before} <em>${after}</em>`;
    } else {
      titleEl.textContent = banner.title;
    }
  }

  // Subtitle — if provided, replace the bullet row with plain text
  if (banner.subtitle) {
    const subEl = document.getElementById('heroSubtitle');
    if (subEl) {
      // Split on '|' to re-create bullet spans, e.g.
      // "Quality Furniture | Affordable Prices | Trusted Service"
      const parts = banner.subtitle.split('|').map(s => s.trim()).filter(Boolean);
      if (parts.length > 1) {
        subEl.innerHTML = parts
          .map(p => `<span><i class="fa-solid fa-circle-check" aria-hidden="true"></i>${p}</span>`)
          .join('');
      } else {
        subEl.innerHTML = `<span><i class="fa-solid fa-circle-check" aria-hidden="true"></i>${banner.subtitle}</span>`;
      }
    }
  }

  // CTA Buttons
  setBtn('heroBtn1', banner.buttonText, banner.buttonLink);
  setBtn('heroBtn2', banner.btn2Text, banner.btn2Link);
}

/**
 * initHero()
 * Exported entry point — called from app.js.
 * Fetches the hero banner from the API and applies it to the page.
 * Falls back gracefully to the existing HTML content if the API fails.
 */
export async function initHero() {
  try {
    const res = await fetch(`${CONFIG.apiBaseUrl}/api/banners/hero`);
    if (!res.ok) throw new Error(`Hero API returned ${res.status}`);
    const banner = await res.json();
    applyHeroBanner(banner);
  } catch (err) {
    // Non-fatal: hardcoded HTML values remain visible — no blank hero
    console.warn('Hero banner could not be loaded from API, using default content:', err.message);
  }
}
