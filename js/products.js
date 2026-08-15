/**
 * products.js
 * ---------------------------------------------------------------------
 * Renders the categories grid and filterable product catalogue.
 * Dynamic data is fetched from /api/products & /api/categories with
 * automatic fallback to static imports from data.js.
 * ---------------------------------------------------------------------
 */

import { CATEGORIES as STATIC_CATEGORIES, PRODUCTS as STATIC_PRODUCTS } from './data.js';
import { CONFIG } from './config.js';
import { $, $$, buildWhatsAppLink } from './ui.js';

const categoryGridEl = $('#categoryGrid');
const footerCategoryListEl = $('#footerCategoryList');
const cfProductEl = $('#cfProduct');
const searchInputEl = $('#searchInput');
const materialFilterEl = $('#materialFilter');
const priceFilterEl = $('#priceFilter');
const colorFilterEl = $('#colorFilter');
const chipRowEl = $('#chipRow');
const resultCountEl = $('#resultCount');
const productGridEl = $('#productGrid');
const loadMoreBtnEl = $('#loadMoreBtn');

const MATERIAL_LABELS = { wood: 'Wood', metal: 'Metal/Steel', plastic: 'Plastic', foam: 'Fabric/Foam', glass: 'Glass' };
const PAGE_SIZE = 8;

let currentCategories = STATIC_CATEGORIES;
let currentProducts = STATIC_PRODUCTS;

const state = { category: 'all', search: '', material: 'all', price: 'all', color: 'all', visible: PAGE_SIZE };

const formatPrice = (amount) => `₹${Number(amount || 0).toLocaleString('en-IN')}`;

function stockBadge(stock) {
  if (stock === 'in-stock') return '<span class="tag tag-green"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> In Stock</span>';
  if (stock === 'limited') return '<span class="tag tag-gold"><i class="fa-solid fa-clock" aria-hidden="true"></i> Limited Stock</span>';
  return '<span class="tag tag-red"><i class="fa-solid fa-xmark" aria-hidden="true"></i> Out of Stock</span>';
}

function categoryCardHTML(category) {
  return `
    <div class="cat-card" data-cat="${category.id}" role="button" tabindex="0" aria-label="View ${category.name}">
      <img src="${category.img}" alt="${category.name} at Bijarniya Furniture" loading="lazy">
      <span class="cat-icon"><i class="fa-solid ${category.icon || 'fa-couch'}" aria-hidden="true"></i></span>
      <div class="cat-label"><b>${category.name}</b><span>Explore Range</span></div>
    </div>`;
}

function productCardHTML(product) {
  const categoryName = currentCategories.find((c) => c.id === product.category)?.name || product.category;
  const whatsappMessage = `Hello Bijarniya Furniture, I want to know more about: ${product.name}`;
  const colorsList = Array.isArray(product.colors) ? product.colors : [];
  const sizesList = Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes || 'Standard');

  return `
  <div class="product-card">
    <div class="product-media">
      <img src="${product.img}" alt="${product.name}" loading="lazy">
      <div class="product-badges">${product.badge ? `<span class="tag tag-gold">${product.badge}</span>` : ''}</div>
      <span class="price-tag">${formatPrice(product.price)}</span>
    </div>
    <div class="product-body">
      <span class="cat-eyebrow">${categoryName}</span>
      <h4>${product.name}</h4>
      <p class="desc">${product.desc || ''}</p>
      <div class="spec-row"><span><b>Material:</b> ${product.material || 'Quality Craftsmanship'}</span></div>
      <div class="spec-row"><span><b>Sizes:</b> ${sizesList}</span></div>
      <div class="spec-row"><span><b>Warranty:</b> ${product.warranty || '1 Year'}</span></div>
      <div class="stock-row">
        <div class="swatches">${colorsList.map((c) => `<span class="swatch" style="background:${c.h}" title="${c.n}"></span>`).join('')}</div>
        ${stockBadge(product.stock)}
      </div>
      <div class="product-actions">
        <a class="btn btn-wa" href="${buildWhatsAppLink(whatsappMessage)}" target="_blank" rel="noopener">
          <i class="fa-brands fa-whatsapp" aria-hidden="true"></i> Inquire
        </a>
        <a class="btn btn-dark" href="tel:${CONFIG.business.phone}">
          <i class="fa-solid fa-phone" aria-hidden="true"></i> Call
        </a>
      </div>
    </div>
  </div>`;
}

function customCtaCardHTML() {
  const message = 'Hello Bijarniya Furniture, I would like to discuss a custom furniture order.';
  return `
  <div class="custom-cta-card">
    <i class="fa-solid fa-pen-ruler" aria-hidden="true"></i>
    <h4>Need Something Custom-Made?</h4>
    <p>Tell us your size, material and style — our workshop will craft it for you.</p>
    <a class="btn btn-gold btn-sm" href="${buildWhatsAppLink(message)}" target="_blank" rel="noopener">Discuss on WhatsApp</a>
  </div>`;
}

function getFilteredProducts() {
  return currentProducts.filter((product) => {
    if (state.category !== 'all' && product.category !== state.category) return false;
    if (state.material !== 'all' && product.materialType !== state.material) return false;
    if (state.color !== 'all' && Array.isArray(product.colors) && !product.colors.some((c) => c.n === state.color)) return false;
    if (state.price !== 'all') {
      const [min, max] = state.price.split('-').map(Number);
      if (product.price < min || product.price > max) return false;
    }
    if (state.search && !product.name.toLowerCase().includes(state.search.toLowerCase())) return false;
    return true;
  });
}

function renderProducts() {
  if (!productGridEl) return;
  const filtered = getFilteredProducts();
  const showCustomCard = state.category === 'all' || state.category === 'custom';
  const visibleProducts = filtered.slice(0, state.visible);

  if (resultCountEl) {
    resultCountEl.textContent = `Showing ${visibleProducts.length}${showCustomCard ? ' + custom option' : ''} of ${filtered.length} products`;
  }
  if (loadMoreBtnEl) {
    loadMoreBtnEl.style.display = state.visible < filtered.length ? 'inline-flex' : 'none';
  }

  if (filtered.length === 0) {
    productGridEl.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1;">
        <i class="fa-solid fa-couch" aria-hidden="true"></i>
        <p>No furniture matched your filters. Try clearing a filter or search term.</p>
      </div>`;
    return;
  }

  productGridEl.innerHTML = visibleProducts.map(productCardHTML).join('') + (showCustomCard ? customCtaCardHTML() : '');
}

function setActiveCategory(categoryId) {
  state.category = categoryId;
  state.visible = PAGE_SIZE;
  $$('.chip', chipRowEl).forEach((chip) => chip.classList.toggle('active', chip.dataset.cat === categoryId));
  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderProducts();
}

function renderCategories() {
  if (!categoryGridEl) return;
  categoryGridEl.innerHTML = currentCategories.map(categoryCardHTML).join('');
  $$('.cat-card', categoryGridEl).forEach((card) => {
    card.addEventListener('click', () => setActiveCategory(card.dataset.cat));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setActiveCategory(card.dataset.cat);
      }
    });
  });
}

function renderFooterCategories() {
  if (!footerCategoryListEl) return;
  footerCategoryListEl.innerHTML = currentCategories.slice(0, 6)
    .map((c) => `<li><a href="#products" data-cat="${c.id}">${c.name}</a></li>`)
    .join('');
  $$('a', footerCategoryListEl).forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      setActiveCategory(link.dataset.cat);
    });
  });
}

function populateProductSelect() {
  if (!cfProductEl) return;
  cfProductEl.innerHTML = `<option value="">Select Category / Product</option>` + currentCategories.map((c) => `<option value="${c.name}">${c.name}</option>`).join('');
}

function populateFilterOptions() {
  if (materialFilterEl) {
    const materials = [...new Set(currentProducts.map((p) => p.materialType))].filter(Boolean);
    materialFilterEl.innerHTML = `<option value="all">All Materials</option>` + materials.map((m) => `<option value="${m}">${MATERIAL_LABELS[m] || m}</option>`).join('');
  }
  if (colorFilterEl) {
    const colorNames = [...new Set(currentProducts.flatMap((p) => (Array.isArray(p.colors) ? p.colors.map((c) => c.n) : [])))].filter(Boolean);
    colorFilterEl.innerHTML = `<option value="all">All Colors</option>` + colorNames.map((name) => `<option value="${name}">${name}</option>`).join('');
  }
}

function renderCategoryChips() {
  if (!chipRowEl) return;
  const chips = [{ id: 'all', name: 'All' }, ...currentCategories.filter((c) => c.id !== 'custom')];
  chipRowEl.innerHTML = chips
    .map((c) => `<button type="button" class="chip ${c.id === 'all' ? 'active' : ''}" data-cat="${c.id}">${c.name}</button>`)
    .join('');
  $$('.chip', chipRowEl).forEach((chip) => chip.addEventListener('click', () => setActiveCategory(chip.dataset.cat)));
}

function bindFilterEvents() {
  searchInputEl?.addEventListener('input', (e) => {
    state.search = e.target.value;
    state.visible = PAGE_SIZE;
    renderProducts();
  });
  materialFilterEl?.addEventListener('change', (e) => {
    state.material = e.target.value;
    state.visible = PAGE_SIZE;
    renderProducts();
  });
  priceFilterEl?.addEventListener('change', (e) => {
    state.price = e.target.value;
    state.visible = PAGE_SIZE;
    renderProducts();
  });
  colorFilterEl?.addEventListener('change', (e) => {
    state.color = e.target.value;
    state.visible = PAGE_SIZE;
    renderProducts();
  });
  loadMoreBtnEl?.addEventListener('click', () => {
    state.visible += PAGE_SIZE;
    renderProducts();
  });
}

export async function initProducts() {
  try {
    const [catRes, prodRes] = await Promise.all([
      fetch(`${CONFIG.apiBaseUrl}/api/categories`),
      fetch(`${CONFIG.apiBaseUrl}/api/products`),
    ]);

    if (catRes.ok) {
      const cats = await catRes.json();
      if (Array.isArray(cats) && cats.length > 0) currentCategories = cats;
    }
    if (prodRes.ok) {
      const prods = await prodRes.json();
      if (Array.isArray(prods) && prods.length > 0) currentProducts = prods;
    }
  } catch (err) {
    console.warn('Using static catalogue data fallback:', err);
  }

  renderCategories();
  renderFooterCategories();
  populateProductSelect();
  populateFilterOptions();
  renderCategoryChips();
  bindFilterEvents();
  renderProducts();
}