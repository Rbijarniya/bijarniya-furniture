/**
 * offers.js
 * -----------------------------------------------------------------------
 * Fetches active offers from MongoDB (/api/offers/public) and
 * renders them in the #offersGrid.
 * -----------------------------------------------------------------------
 */

import { CONFIG } from './config.js';

export async function initOffers() {
  const grid = document.getElementById('offersGrid');
  if (!grid) return;

  try {
    const res = await fetch(`${CONFIG.apiBaseUrl}/api/offers/public`);
    if (!res.ok) throw new Error(`Offers API returned ${res.status}`);
    const offers = await res.json();

    if (offers.length === 0) {
      document.getElementById('offers').style.display = 'none';
      return;
    }

    grid.innerHTML = offers.map(offer => `
      <div class="offer-card">
        <img src="${offer.img}" alt="${offer.title}">
        <div class="offer-content">
          ${offer.tag ? `<span class="tag tag-gold">${offer.tag}</span>` : ''}
          <h3>${offer.title}</h3>
          <p>${offer.description}</p>
          <a href="${offer.buttonLink}" class="btn btn-${offer.buttonStyle || 'gold'} btn-sm" ${offer.buttonStyle === 'outline' ? 'style="color:#fff;border-color:rgba(255,255,255,.4);"' : ''}>
            ${offer.buttonText}
          </a>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.warn('Failed to load offers from API:', err.message);
    document.getElementById('offers').style.display = 'none';
  }
}
