/**
 * app.js
 * ---------------------------------------------------------------------
 * Entry point. Loaded as <script type="module" src="js/app.js" defer>
 * from index.html. Module scripts are deferred by the browser by
 * default, so this runs after the DOM has been parsed — no need for a
 * DOMContentLoaded wrapper.
 * ---------------------------------------------------------------------
 */

import {
  wireStaticWhatsAppButtons,
  setFooterYear,
  initHeaderScroll,
  initScrollTop,
  initMobileDrawer,
  initThemeToggle,
  initRevealAnimations,
  initImageFallback,
  initContactForm,
  initNewsletterForm,
  renderPriceList,
  renderWhyUs,
  initFaqAccordion,
} from './ui.js';
import { initProducts } from './products.js';
import { initGallery } from './gallery.js';
import { initReviews } from './reviews.js';

// Site chrome — safe to run immediately.
wireStaticWhatsAppButtons();
setFooterYear();
initHeaderScroll();
initScrollTop();
initMobileDrawer();
initThemeToggle();
initImageFallback();
initContactForm();
initNewsletterForm();

// Data-driven sections.
renderPriceList();
renderWhyUs();
initFaqAccordion();
initProducts();
initGallery();
initReviews(); // renders the local REVIEWS array from data.js

// Scroll-reveal must run last so every .reveal / .reveal-stagger element
// rendered above already exists in the DOM before we start observing it.
initRevealAnimations();