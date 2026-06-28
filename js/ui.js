/**
 * ui.js
 * ---------------------------------------------------------------------
 * Shared DOM helpers + site "chrome" behaviour (header, mobile drawer,
 * theme toggle, scroll-reveal, scroll-to-top, image fallback, contact /
 * newsletter forms) and the small data-driven sections that don't need
 * their own module (price list, "Why Choose Us", FAQ accordion).
 *
 * Imported by: app.js, products.js, gallery.js, reviews.js
 * ---------------------------------------------------------------------
 */

import { CONFIG } from './config.js';
import { PRICELIST, WHY_US, FAQS } from './data.js';

/* =====================================================================
   DOM helpers
   ===================================================================== */
export function $(selector, scope = document) {
  return scope ? scope.querySelector(selector) : null;
}

export function $$(selector, scope = document) {
  return scope ? Array.from(scope.querySelectorAll(selector)) : [];
}

/* =====================================================================
   WhatsApp link helper + static WhatsApp button wiring
   ===================================================================== */
export function buildWhatsAppLink(message) {
  const text = message || CONFIG.business.defaultWhatsappMessage;
  return `https://wa.me/${CONFIG.business.whatsapp}?text=${encodeURIComponent(text)}`;
}

// Static (non-dynamic) WhatsApp links that just need the default message.
const STATIC_WA_BUTTON_IDS = [
  'navWaBtn',
  'drawerWaBtn',
  'contactWaBtn',
  'footerWaBtn',
  'stickyWaBtn',
  'floatWaBtn',
];

export function wireStaticWhatsAppButtons() {
  STATIC_WA_BUTTON_IDS.forEach((id) => {
    const el = $(`#${id}`);
    if (!el) return;
    el.href = buildWhatsAppLink();
    // navWaBtn starts hidden in the markup until JS confirms it's wired up.
    if (el.style.display === 'none') el.style.display = '';
  });

  // Custom-order CTA gets a more specific opening message.
  const customBtn = $('#customWaBtn');
  if (customBtn) {
    customBtn.href = buildWhatsAppLink(
      'Hello Bijarniya Furniture, I would like to discuss a custom furniture order.'
    );
  }
}

/* =====================================================================
   Footer year
   ===================================================================== */
export function setFooterYear() {
  const el = $('#yearNow');
  if (el) el.textContent = String(new Date().getFullYear());
}

/* =====================================================================
   Header scroll state (.site-header.scrolled)
   ===================================================================== */
export function initHeaderScroll() {
  const header = $('#siteHeader');
  if (!header) return;
  const SCROLL_THRESHOLD = 40;

  const update = () => header.classList.toggle('scrolled', window.scrollY > SCROLL_THRESHOLD);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

/* =====================================================================
   Scroll-to-top floating button (.fab-top.show)
   ===================================================================== */
export function initScrollTop() {
  const btn = $('#scrollTopBtn');
  if (!btn) return;
  const SHOW_AFTER = 400;

  const update = () => btn.classList.toggle('show', window.scrollY > SHOW_AFTER);
  update();
  window.addEventListener('scroll', update, { passive: true });

  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* =====================================================================
   Mobile drawer (.mobile-drawer.open / .drawer-overlay.open)
   ===================================================================== */
export function initMobileDrawer() {
  const hamburgerBtn = $('#hamburgerBtn');
  const drawer = $('#mobileDrawer');
  const overlay = $('#drawerOverlay');
  const closeBtn = $('#drawerCloseBtn');
  if (!hamburgerBtn || !drawer || !overlay) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    hamburgerBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    hamburgerBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  };

  hamburgerBtn.addEventListener('click', openDrawer);
  closeBtn?.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
  // Closing the drawer when a nav link inside it is tapped (same-page anchors).
  $$('a', drawer).forEach((link) => link.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });
}

/* =====================================================================
   Dark / light theme toggle ([data-theme] on <html>)
   ===================================================================== */
const THEME_STORAGE_KEY = 'bf-theme';

export function initThemeToggle() {
  const toggleBtn = $('#themeToggle');
  const root = document.documentElement;
  if (!toggleBtn) return;

  const applyTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    toggleBtn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  };

  let saved = null;
  try {
    saved = localStorage.getItem(THEME_STORAGE_KEY);
  } catch (err) {
    /* localStorage unavailable (privacy mode, etc.) — ignore, fall back to markup default */
  }
  if (saved === 'dark' || saved === 'light') applyTheme(saved);

  toggleBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch (err) {
      /* ignore storage errors */
    }
  });
}

/* =====================================================================
   Scroll-reveal animations (.reveal / .reveal-stagger -> .is-visible)
   ===================================================================== */
export function initRevealAnimations() {
  const targets = [...$$('.reveal'), ...$$('.reveal-stagger')];
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  targets.forEach((el) => observer.observe(el));
}

/* =====================================================================
   Broken-image fallback (e.g. a hotlinked Unsplash image failing to load)
   ===================================================================== */
const FALLBACK_IMG =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">' +
      '<rect width="400" height="300" fill="#F3EBDD"/>' +
      '<g fill="#C9A227">' +
      '<path d="M120 190h160v14H120z"/>' +
      '<path d="M132 150h136a14 14 0 0 1 14 14v18H118v-18a14 14 0 0 1 14-14z"/>' +
      '<circle cx="148" cy="150" r="10"/><circle cx="252" cy="150" r="10"/>' +
      '</g></svg>'
  );

export function initImageFallback() {
  // 'error' doesn't bubble, but a capturing listener on document still
  // intercepts it for every <img> on the page without per-image listeners.
  document.addEventListener(
    'error',
    (e) => {
      const img = e.target;
      if (!(img instanceof HTMLImageElement)) return;
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = 'true';
      img.src = FALLBACK_IMG;
    },
    true
  );
}

/* =====================================================================
   Toast (.toast.show)
   ===================================================================== */
let toastTimer;
function showToast(message) {
  const toastEl = $('#toast');
  const toastTextEl = $('#toastText');
  if (!toastEl || !toastTextEl) return;
  toastTextEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 3500);
}

/* =====================================================================
   Contact form — builds a WhatsApp message from the form fields
   ===================================================================== */
export function initContactForm() {
  const form = $('#contactForm');
  const msgEl = $('#formMsg');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const data = new FormData(form);
    const name = (data.get('name') || '').toString().trim();
    const mobile = (data.get('mobile') || '').toString().trim();
    const email = (data.get('email') || '').toString().trim();
    const city = (data.get('city') || '').toString().trim();
    const product = (data.get('product') || '').toString().trim();
    const message = (data.get('message') || '').toString().trim();

    const lines = [
      'Hello Bijarniya Furniture, I would like to request a price quote.',
      `Name: ${name}`,
      `Mobile: ${mobile}`,
    ];
    if (email) lines.push(`Email: ${email}`);
    if (city) lines.push(`City: ${city}`);
    if (product) lines.push(`Product: ${product}`);
    if (message) lines.push(`Message: ${message}`);

    window.open(buildWhatsAppLink(lines.join('\n')), '_blank', 'noopener');

    msgEl?.classList.add('show');
    form.reset();
  });
}

/* =====================================================================
   Newsletter form
   ===================================================================== */
export function initNewsletterForm() {
  const form = $('#newsletterForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    showToast('Thanks for subscribing! We will keep you updated.');
    form.reset();
  });
}

/* =====================================================================
   Price list table (#priceListBody)
   ===================================================================== */
export function renderPriceList() {
  const tbody = $('#priceListBody');
  if (!tbody) return;
  tbody.innerHTML = PRICELIST.map(
    (row) => `<tr><td>${row.item}</td><td><b>${row.price}</b></td></tr>`
  ).join('');
}

/* =====================================================================
   "Why Choose Us" grid (#whyGrid)
   ===================================================================== */
export function renderWhyUs() {
  const grid = $('#whyGrid');
  if (!grid) return;
  grid.innerHTML = WHY_US.map(
    (item) => `
      <div class="why-card">
        <span class="ic"><i class="fa-solid ${item.icon}" aria-hidden="true"></i></span>
        <h4>${item.title}</h4>
        <p>${item.text}</p>
      </div>`
  ).join('');
}

/* =====================================================================
   FAQ accordion (#faqList)
   ===================================================================== */
export function initFaqAccordion() {
  const list = $('#faqList');
  if (!list) return;

  list.innerHTML = FAQS.map(
    (faq, i) => `
      <div class="faq-item">
        <button type="button" class="faq-q" aria-expanded="false" aria-controls="faqAnswer${i}">
          <span>${faq.q}</span>
          <i class="fa-solid fa-plus" aria-hidden="true"></i>
        </button>
        <div class="faq-a" id="faqAnswer${i}" role="region">
          <p class="faq-a-inner">${faq.a}</p>
        </div>
      </div>`
  ).join('');

  const items = $$('.faq-item', list);

  const closeItem = (item) => {
    item.classList.remove('open');
    $('.faq-q', item)?.setAttribute('aria-expanded', 'false');
    const answer = $('.faq-a', item);
    if (answer) answer.style.maxHeight = '0px';
  };

  const openItem = (item) => {
    item.classList.add('open');
    $('.faq-q', item)?.setAttribute('aria-expanded', 'true');
    const answer = $('.faq-a', item);
    if (answer) answer.style.maxHeight = `${answer.scrollHeight}px`;
  };

  items.forEach((item) => {
    $('.faq-q', item)?.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      items.forEach(closeItem);
      if (!isOpen) openItem(item);
    });
  });
}