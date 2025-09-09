// =============== CONSTANTS & STATE =================
const API = {
  allPlants: 'https://openapi.programming-hero.com/api/plants',
  categories: 'https://openapi.programming-hero.com/api/categories',
  byCategory: (id) => `https://openapi.programming-hero.com/api/category/${id}`,
  details: (id) => `https://openapi.programming-hero.com/api/plant/${id}`,
};

const state = {
  categories: [],
  plants: [],
  activeCategoryId: null,
  cart: [] // {id, name, price}
};

// =============== HELPERS =================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const fmt = (n) => `$${Number(n).toLocaleString()}`;

const show = (el) => el.classList.remove('hidden');
const hide = (el) => el.classList.add('hidden');

// =============== DOM NODES =================
const catListEl = $('#category-list');
const catSpinnerEl = $('#cat-spinner');
const cardsGridEl = $('#cards-grid');
const cardsSpinnerEl = $('#cards-spinner');
const cardsCountEl = $('#cards-count');
const cartListEl = $('#cart-list');
const cartTotalEl = $('#cart-total');

// Modal
const modalOverlay = $('#modal-overlay');
const modalTitle = $('#modal-title');
const modalBody = $('#modal-body');
const modalClose = $('#modal-close');

// =============== INIT =================
document.addEventListener('DOMContentLoaded', () => {
  $('#year').textContent = new Date().getFullYear();
  loadCategories();
  loadAllPlants();
  bindModal();
});

// =============== FETCHERS =================
async function loadCategories() {
  try {
    show(catSpinnerEl);
    const res = await fetch(API.categories);
    const data = await res.json();
    state.categories = data?.categories || data?.data || [];
    renderCategories();
  } catch (e) {
    catListEl.innerHTML = `<p class="text-red-600 text-sm">Failed to load categories.</p>`;
    console.error(e);
  } finally {
    hide(catSpinnerEl);
  }
}

async function loadAllPlants() {
  await loadPlantsFrom(API.allPlants, null);
}

async function loadPlantsByCategory(id) {
  await loadPlantsFrom(API.byCategory(id), id);
}

async function loadPlantsFrom(url, categoryId) {
  try {
    show(cardsSpinnerEl);
    const res = await fetch(url);
    const data = await res.json();
    // API returns data as `plants` or `data` depending on endpoint
    const list = data?.plants || data?.data || [];
    state.plants = list;
    state.activeCategoryId = categoryId;
    renderPlants();
    setActiveCategoryButton(categoryId);
  } catch (e) {
    cardsGridEl.innerHTML = `<p class="text-red-600">Failed to load plants.</p>`;
    console.error(e);
  } finally {
    hide(cardsSpinnerEl);
  }
}

async function openDetails(id) {
  try {
    modalTitle.textContent = 'Loading...';
    modalBody.innerHTML = `<div class="spinner"></div>`;
    openModal();

    const res = await fetch(API.details(id));
    const data = await res.json();
    const p = data?.plant || data?.data || data;

    modalTitle.textContent = p?.name || 'Plant Details';
    modalBody.innerHTML = `
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <img src="${p?.image || 'https://via.placeholder.com/600x400?text=Tree'}" alt="${p?.name || ''}" class="rounded-xl w-full h-48 object-cover"/>
        <div class="space-y-2">
          <p class="text-sm text-gray-600">${p?.description || '—'}</p>
          <div class="text-sm"><span class="font-semibold">Category:</span> ${p?.category || '—'}</div>
          <div class="text-sm"><span class="font-semibold">Price:</span> ${fmt(p?.price || 0)}</div>
          <button class="btn-primary" data-add="${p?.id}">Add to Cart</button>
        </div>
      </div>
    `;
    // Bind add-to-cart inside modal
    modalBody.querySelector('[data-add]')?.addEventListener('click', () => {
      addToCart(p);
    });
  } catch (e) {
    modalTitle.textContent = 'Error';
    modalBody.innerHTML = `<p class="text-red-600">Failed to load details.</p>`;
    console.error(e);
  }
}

// =============== RENDERERS =================
function renderCategories() {
  const allBtn = `
    <button class="cat-btn ${!state.activeCategoryId ? 'cat-active' : ''}" data-cat="">All</button>
  `;
  const items = state.categories
    .map(c => `<button class="cat-btn" data-cat="${c.id}">${c.name}</button>`)
    .join('');

  catListEl.innerHTML = allBtn + items;

  // Bind events
  catListEl.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = e.target.dataset.cat;
      if (!id) loadAllPlants();
      else loadPlantsByCategory(id);
    });
  });
}

function renderPlants() {
  cardsCountEl.textContent = `${state.plants.length} item(s)`;
  if (!state.plants.length) {
    cardsGridEl.innerHTML = `<p class="text-gray-600">No trees found.</p>`;
    return;
  }

  cardsGridEl.innerHTML = state.plants.map(p => cardTemplate(p)).join('');

  // Bind buttons
  cardsGridEl.querySelectorAll('[data-add]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.add;
      const plant = state.plants.find(x => String(x.id) === String(id)) || {};
      addToCart(plant);
    });
  });

  cardsGridEl.querySelectorAll('[data-details]').forEach(el => {
    el.addEventListener('click', () => openDetails(el.dataset.details));
  });
}

function cardTemplate(p) {
  const img = p?.image || 'https://via.placeholder.com/600x400?text=Tree';
  const name = p?.name || 'Unknown Tree';
  const desc = p?.description?.slice(0, 70) || '—';
  const category = p?.category || '—';
  const price = p?.price || 0;
  const id = p?.id;

  return `
    <article class="card overflow-hidden">
      <div class="w-full h-40 bg-gray-100">
        <img src="${img}" alt="${name}" class="w-full h-40 object-cover"/>
      </div>
      <div class="p-4 space-y-2">
        <h3 class="font-semibold text-lg hover:text-green-700 cursor-pointer" data-details="${id}">${name}</h3>
        <p class="text-sm text-gray-600">${desc}${p?.description && p.description.length > 70 ? '…' : ''}</p>
        <div class="text-xs text-gray-500">Category: ${category}</div>
        <div class="flex items-center justify-between pt-2">
          <div class="font-bold">${fmt(price)}</div>
          <button class="btn-secondary text-sm" data-add="${id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `;
}

function setActiveCategoryButton(id) {
  $$('#category-list .cat-btn').forEach(b => b.classList.remove('cat-active'));
  const selector = id ? `[data-cat="${id}"]` : '[data-cat=""]';
  const active = $(`#category-list ${selector}`);
  if (active) active.classList.add('cat-active');
}

// =============== CART =================
function addToCart(plant) {
  if (!plant || !plant.id) return;
  const exists = state.cart.find(x => String(x.id) === String(plant.id));
  if (exists) {
    // you could increase quantity; keeping single entries as per minimal spec
  } else {
    state.cart.push({
      id: plant.id,
      name: plant.name || 'Tree',
      price: Number(plant.price || 0)
    });
  }
  renderCart();
}

function removeFromCart(id) {
  state.cart = state.cart.filter(x => String(x.id) !== String(id));
  renderCart();
}

function renderCart() {
  if (!state.cart.length) {
    cartListEl.innerHTML = `<li class="text-sm text-gray-500">Your cart is empty.</li>`;
    cartTotalEl.textContent = fmt(0);
    return;
  }

  cartListEl.innerHTML = state.cart
    .map(item => `
      <li class="flex items-center justify-between gap-3 p-2 rounded hover:bg-green-50">
        <span class="text-sm">${item.name}</span>
        <div class="flex items-center gap-2">
          <span class="text-sm font-semibold">${fmt(item.price)}</span>
          <button class="text-red-600 hover:bg-red-50 rounded px-2" data-remove="${item.id}" aria-label="Remove">✕</button>
        </div>
      </li>
    `)
    .join('');

  const total = state.cart.reduce((acc, c) => acc + Number(c.price || 0), 0);
  cartTotalEl.textContent = fmt(total);

  cartListEl.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => removeFromCart(btn.dataset.remove));
  });
}

// =============== MODAL =================
function bindModal() {
  modalClose.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });
}
function openModal() {
  modalOverlay.classList.remove('hidden');
  modalOverlay.classList.add('flex');
}
function closeModal() {
  modalOverlay.classList.add('hidden');
  modalOverlay.classList.remove('flex');
}
