// ============================================================
// GADGETS BD - app.js
// Core application logic, SPA router, Firebase integration,
// cart, wishlist, compare, auth, checkout, admin panel
// ============================================================

'use strict';

// ---------- GLOBAL STATE ----------
const State = {
  products: [],
  categories: [],
  brands: [],
  banners: [],
  blogs: [],
  reviews: [],
  offers: [],
  services: [],
  cart: JSON.parse(localStorage.getItem('gbd_cart') || '[]'),
  wishlist: JSON.parse(localStorage.getItem('gbd_wishlist') || '[]'),
  compare: JSON.parse(localStorage.getItem('gbd_compare') || '[]'),
  orders: JSON.parse(localStorage.getItem('gbd_orders') || '[]'),
  user: JSON.parse(localStorage.getItem('gbd_user') || 'null'),
  appliedCoupon: null,
  currentRoute: 'home',
  heroIndex: 0,
  heroTimer: null,
  searchHistory: JSON.parse(localStorage.getItem('gbd_search_history') || '[]'),
};

// Admin credentials - hardcoded in script (NOT Firebase Auth)
// Admin login uses these credentials directly. Data syncs to Firebase Firestore.
const ADMIN_EMAIL = 'admin@gadgetsbd.com';
const ADMIN_PASSWORD = 'admin123';

// ---------- UTILITIES ----------
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
const fmtPrice = (n) => '৳' + Number(n).toLocaleString('en-BD');
const discountPct = (p, d) => Math.round(((p - d) / p) * 100);
const uid = () => 'id' + Date.now() + Math.random().toString(36).slice(2, 8);

function saveState() {
  localStorage.setItem('gbd_cart', JSON.stringify(State.cart));
  localStorage.setItem('gbd_wishlist', JSON.stringify(State.wishlist));
  localStorage.setItem('gbd_compare', JSON.stringify(State.compare));
  localStorage.setItem('gbd_orders', JSON.stringify(State.orders));
  localStorage.setItem('gbd_user', JSON.stringify(State.user));
  updateBadges();
}

function toast(msg, type = 'info') {
  const container = $('#toastContainer');
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: 'fa-check-circle', error: 'fa-times-circle', info: 'fa-info-circle', warning: 'fa-exclamation-triangle' };
  el.innerHTML = `<i class="fas ${icons[type] || icons.info}"></i><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateX(100%)'; setTimeout(() => el.remove(), 300); }, 3000);
}

function stars(rating) {
  let html = '';
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  for (let i = 0; i < full; i++) html += '<i class="fas fa-star"></i>';
  if (half) html += '<i class="fas fa-star-half-alt"></i>';
  for (let i = full + (half ? 1 : 0); i < 5; i++) html += '<i class="far fa-star"></i>';
  return html;
}

// ---------- THEME ----------
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('gbd_theme', next);
}
(function initTheme() {
  const saved = localStorage.getItem('gbd_theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
  else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

// ---------- DATA LOADING (Firebase + local fallback) ----------
// Track whether default data has been seeded to Firebase
var _dataSeeded = false;

async function loadData() {
  const D = window.GBD_DATA;

  if (firebaseInitialized && db) {
    try {
      // === SEED DEFAULT DATA on first run ===
      // Check if categories exist; if not, seed defaults
      var catSnap = await db.collection('categories').limit(1).get();
      if (catSnap.empty) {
        console.log('Seeding default categories to Firebase...');
        var batch = db.batch();
        D.CATEGORIES.forEach(function(cat) {
          batch.set(db.collection('categories').doc(cat.id), cat);
        });
        await batch.commit();
        console.log('Categories seeded:', D.CATEGORIES.length);
      }

      // Check if brands exist; if not, seed defaults
      var brandSnap = await db.collection('brands').limit(1).get();
      if (brandSnap.empty) {
        console.log('Seeding default brands to Firebase...');
        var batch2 = db.batch();
        D.BRANDS.forEach(function(br) {
          batch2.set(db.collection('brands').doc(br.id), br);
        });
        await batch2.commit();
        console.log('Brands seeded:', D.BRANDS.length);
      }

      // Check if banners exist; if not, seed defaults
      var bannerSnap = await db.collection('banners').limit(1).get();
      if (bannerSnap.empty) {
        console.log('Seeding default banners to Firebase...');
        var batch3 = db.batch();
        D.BANNERS.forEach(function(bn) {
          batch3.set(db.collection('banners').doc(bn.id), bn);
        });
        await batch3.commit();
        console.log('Banners seeded:', D.BANNERS.length);
      }

      _dataSeeded = true;

      // === PRODUCTS: real-time listener (single listener, no duplicates) ===
      // Using onSnapshot for live sync — admin adds product → instantly shows on website
      db.collection('products').onSnapshot(function(snapshot) {
        // Deduplicate by document ID to prevent double entries
        var seen = {};
        State.products = snapshot.docs.map(function(d) {
          return Object.assign({ id: d.id }, d.data());
        }).filter(function(p) {
          if (seen[p.id]) return false;
          seen[p.id] = true;
          return true;
        });
        refreshCurrentView();
      });

      // === CATEGORIES: real-time listener ===
      db.collection('categories').onSnapshot(function(snapshot) {
        var seen = {};
        State.categories = snapshot.docs.map(function(d) {
          return Object.assign({ id: d.id }, d.data());
        }).filter(function(c) {
          if (seen[c.id]) return false;
          seen[c.id] = true;
          return true;
        });
        refreshCurrentView();
      });

      // === BRANDS: real-time listener ===
      db.collection('brands').onSnapshot(function(snapshot) {
        var seen = {};
        State.brands = snapshot.docs.map(function(d) {
          return Object.assign({ id: d.id }, d.data());
        }).filter(function(b) {
          if (seen[b.id]) return false;
          seen[b.id] = true;
          return true;
        });
        refreshCurrentView();
      });

      // === BANNERS: real-time listener ===
      db.collection('banners').onSnapshot(function(snapshot) {
        var seen = {};
        State.banners = snapshot.docs.map(function(d) {
          return Object.assign({ id: d.id }, d.data());
        }).filter(function(b) {
          if (seen[b.id]) return false;
          seen[b.id] = true;
          return true;
        });
        refreshCurrentView();
      });

      // === ORDERS: real-time listener ===
      db.collection('orders').onSnapshot(function(snapshot) {
        var seen = {};
        State.orders = snapshot.docs.map(function(d) {
          return Object.assign({ id: d.id }, d.data());
        }).filter(function(o) {
          if (seen[o.id]) return false;
          seen[o.id] = true;
          return true;
        });
        saveState();
        refreshCurrentView();
      });

      // === BLOGS: real-time listener ===
      db.collection('blogs').onSnapshot(function(snapshot) {
        State.blogs = snapshot.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      });

      // === REVIEWS: real-time listener ===
      db.collection('reviews').onSnapshot(function(snapshot) {
        State.reviews = snapshot.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      });

      // === OFFERS: real-time listener ===
      db.collection('offers').onSnapshot(function(snapshot) {
        State.offers = snapshot.docs.map(function(d) { return Object.assign({ id: d.id }, d.data()); });
      });

      // Services are static (not user-managed)
      State.services = D.SERVICE_HIGHLIGHTS;

    } catch (e) {
      console.error('Firestore load FAILED:', e.code, e.message);
      console.error('Full error:', e);
      // Show user-visible error for Firestore issues
      if (typeof toast === 'function') {
        toast('Firebase connection error: ' + (e.message || 'Unknown') + '. Check Firestore Security Rules.', 'error');
      }
      loadLocalData(D);
    }
  } else {
    loadLocalData(D);
  }
}

function loadLocalData(D) {
  State.categories = D.CATEGORIES || [];
  State.brands = D.BRANDS || [];
  State.banners = D.BANNERS || [];
  State.blogs = D.BLOGS || [];
  State.reviews = D.REVIEWS || [];
  State.offers = D.OFFERS || [];
  State.services = D.SERVICE_HIGHLIGHTS || [];
  State.products = D.PRODUCTS || [];
  // Update nav dropdowns
  updateNavDropdowns();
}

function refreshCurrentView() {
  // Re-render the current route when data changes (realtime)
  const route = State.currentRoute;
  const routeName = route.split('?')[0];
  // Update nav dropdowns with latest categories/brands
  updateNavDropdowns();
  if (['home', 'products', 'deals', 'wishlist', 'compare', 'cart', 'dashboard', 'orders'].includes(routeName)) {
    router(true);
  }
  // Also refresh admin panel if open
  if (typeof AdminState !== 'undefined' && AdminState.active) {
    adminRenderSection();
  }
}

// ---------- ROUTER (Hash-based SPA) ----------
function navigateTo(route) {
  window.location.hash = route;
}

function router(silent) {
  let hash = window.location.hash.slice(1) || 'home';
  State.currentRoute = hash;
  const [path, query] = hash.split('?');
  const params = new URLSearchParams(query || '');

  // Admin route protection
  if (path === 'admin') { renderAdmin(); return; }
  // Non-admin route: restore public UI (in case we came from admin)
  restorePublicUI();

  const content = $('#appContent');
  if (!silent) window.scrollTo({ top: 0, behavior: 'smooth' });

  // Highlight active nav
  $$('.nav-item').forEach(n => n.classList.remove('active'));

  switch (path) {
    case 'home': renderHome(); break;
    case 'products': renderProducts(params); break;
    case 'product': renderProductDetail(params.get('id')); break;
    case 'deals': renderDeals(); break;
    case 'cart': renderCart(); break;
    case 'checkout': renderCheckout(); break;
    case 'wishlist': renderWishlist(); break;
    case 'compare': renderCompare(); break;
    case 'dashboard': renderDashboard(); break;
    case 'track-order': renderTrackOrder(); break;
    case 'about': renderAbout(); break;
    case 'contact': renderContact(); break;
    case 'support': renderSupport(); break;
    case 'order-success': renderOrderSuccess(params.get('id')); break;
    default: renderHome();
  }
}
window.addEventListener('hashchange', () => router(false));

// ---------- HEADER SCROLL ----------
window.addEventListener('scroll', () => {
  const header = $('#header');
  if (window.scrollY > 20) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
});

// ---------- MOBILE MENU ----------
function toggleMobileMenu() {
  $('#mobileNav').classList.toggle('open');
  $('#mobileOverlay').classList.toggle('active');
}

// ---------- BADGES ----------
function updateBadges() {
  const setBadge = (id, count) => {
    const el = $('#' + id);
    if (!el) return;
    if (count > 0) { el.style.display = 'flex'; el.textContent = count; }
    else el.style.display = 'none';
  };
  setBadge('cartBadge', State.cart.reduce((s, i) => s + i.qty, 0));
  setBadge('wishlistBadge', State.wishlist.length);
  setBadge('compareBadge', State.compare.length);
}

// ---------- CART ----------
function addToCart(productId, qty = 1) {
  const product = State.products.find(p => p.id === productId);
  if (!product) return;
  if (product.stock <= 0) { toast('Product is out of stock', 'error'); return; }
  const existing = State.cart.find(i => i.id === productId);
  if (existing) existing.qty += qty;
  else State.cart.push({ id: productId, qty });
  saveState();
  toast(`${product.name} added to cart`, 'success');
}

function removeFromCart(productId) {
  State.cart = State.cart.filter(i => i.id !== productId);
  saveState();
  renderCart();
  toast('Item removed from cart', 'info');
}

function updateCartQty(productId, delta) {
  const item = State.cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(productId); return; }
  saveState();
  renderCart();
}

function cartTotal() {
  return State.cart.reduce((sum, item) => {
    const p = State.products.find(pr => pr.id === item.id);
    return sum + (p ? p.discountPrice * item.qty : 0);
  }, 0);
}

// ---------- WISHLIST ----------
function toggleWishlist(productId) {
  const idx = State.wishlist.indexOf(productId);
  if (idx >= 0) { State.wishlist.splice(idx, 1); toast('Removed from wishlist', 'info'); }
  else { State.wishlist.push(productId); toast('Added to wishlist', 'success'); }
  saveState();
  // Update button states
  $$(`.wishlist-btn-${productId}`).forEach(btn => btn.classList.toggle('active'));
  if (State.currentRoute === 'wishlist') renderWishlist();
}

// ---------- COMPARE ----------
function toggleCompare(productId) {
  const idx = State.compare.indexOf(productId);
  if (idx >= 0) { State.compare.splice(idx, 1); toast('Removed from compare', 'info'); }
  else {
    if (State.compare.length >= 4) { toast('You can compare up to 4 products', 'warning'); return; }
    State.compare.push(productId); toast('Added to compare', 'success');
  }
  saveState();
  if (State.currentRoute === 'compare') renderCompare();
}

// ---------- PRODUCT CARD COMPONENT ----------
function productCard(p) {
  const inWishlist = State.wishlist.includes(p.id);
  const pct = discountPct(p.price, p.discountPrice);
  const hoverImg = p.images[1] || p.images[0];
  return `
    <div class="product-card fade-in">
      <div class="product-img-wrap" onclick="navigateTo('product?id=${p.id}')">
        <img src="${p.images[0]}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400?text=Gadgets+BD'">
        <img src="${hoverImg}" alt="${p.name}" class="hover-img" loading="lazy" onerror="this.style.display='none'">
        <div class="product-badge">
          ${pct > 0 ? `<span class="badge badge-discount">-${pct}%</span>` : ''}
          ${p.newArrival ? `<span class="badge badge-new">NEW</span>` : ''}
          ${p.flashSale ? `<span class="badge badge-flash">FLASH</span>` : ''}
        </div>
      </div>
      <div class="product-actions">
        <button class="product-action-btn wishlist-btn-${p.id} ${inWishlist ? 'active' : ''}" onclick="event.stopPropagation(); toggleWishlist('${p.id}')" title="Wishlist"><i class="fas fa-heart"></i></button>
        <button class="product-action-btn" onclick="event.stopPropagation(); toggleCompare('${p.id}')" title="Compare"><i class="fas fa-exchange-alt"></i></button>
        <button class="product-action-btn" onclick="event.stopPropagation(); openQuickView('${p.id}')" title="Quick View"><i class="fas fa-eye"></i></button>
      </div>
      <div class="product-info">
        <span class="product-brand">${p.brandName}</span>
        <h3 class="product-name" onclick="navigateTo('product?id=${p.id}')">${p.name}</h3>
        <div class="product-rating">
          <span class="stars">${stars(p.rating)}</span>
          <span class="rating-count">(${p.reviewCount})</span>
        </div>
        <div class="product-price">
          <span class="price-current">${fmtPrice(p.discountPrice)}</span>
          ${pct > 0 ? `<span class="price-old">${fmtPrice(p.price)}</span>` : ''}
        </div>
        <div class="product-buttons">
          <button class="btn-cart" onclick="addToCart('${p.id}')"><i class="fas fa-shopping-cart"></i> Cart</button>
          <button class="btn-buy" onclick="buyNow('${p.id}')"><i class="fas fa-bolt"></i> Buy</button>
        </div>
      </div>
    </div>`;
}

function buyNow(productId) {
  addToCart(productId);
  navigateTo('checkout');
}

// ---------- SKELETON LOADER ----------
function skeletonCards(count = 8) {
  let html = '<div class="product-grid">';
  for (let i = 0; i < count; i++) {
    html += `<div class="product-card"><div class="skeleton" style="aspect-ratio:1"></div><div class="product-info"><div class="skeleton" style="height:12px;width:40%;margin-bottom:8px"></div><div class="skeleton" style="height:16px;width:90%;margin-bottom:8px"></div><div class="skeleton" style="height:20px;width:60%"></div></div></div>`;
  }
  return html + '</div>';
}

console.log('Gadgets BD app.js part 1 loaded');

// ============================================================
// PAGE RENDERERS
// ============================================================

// ---------- HOME PAGE ----------
function renderHome() {
  const featured = State.products.filter(p => p.featured);
  const trending = State.products.filter(p => p.trending);
  const flashSale = State.products.filter(p => p.flashSale);
  const newArrivals = State.products.filter(p => p.newArrival);
  const gaming = State.products.filter(p => p.category === 'gaming');
  const bestSelling = [...State.products].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 4);

  // Use banners from State (Firebase) or fall back to data.js defaults
  var banners = State.banners.length > 0 ? State.banners : (window.GBD_DATA.BANNERS || []);

  $('#appContent').innerHTML = `
    <!-- HERO SLIDER (3 sliding banners with Shop Now button) -->
    <div class="hero-slider" id="heroSlider">
      ${banners.map((b, i) => `
        <div class="hero-slide ${i === 0 ? 'active' : ''}" style="background-image:url('${b.image}')">
          <img src="${b.image}" alt="${b.title}" style="display:none" onerror="this.parentElement.style.background='#0F172A'">
          <div class="hero-content">
            <div class="container" style="padding:0 24px">
              <h1 class="hero-title">${b.title}</h1>
              <p class="hero-subtitle">${b.subtitle}</p>
              <a href="${b.link || '#products'}" class="hero-btn" onclick="event.preventDefault(); navigateTo('${(b.link || '#products').replace('#', '')}')">${b.btnText || 'Shop Now'} <i class="fas fa-arrow-right"></i></a>
            </div>
          </div>
        </div>`).join('')}
      <div class="hero-dots">
        ${banners.map((_, i) => `<div class="hero-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>`).join('')}
      </div>
    </div>

    <!-- SERVICE HIGHLIGHTS -->
    <section class="section" style="padding-top:40px; padding-bottom:0">
      <div class="container">
        <div class="service-highlights">
          ${State.services.map(s => `
            <div class="service-card">
              <div class="service-icon"><i class="${s.icon}"></i></div>
              <div><h4>${s.title}</h4><p>${s.desc}</p></div>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- CATEGORIES -->
    <section class="section">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Shop by Category</h2>
          <a class="section-link" onclick="navigateTo('products')">View All <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="categories-grid">
          ${State.categories.map(c => `
            <div class="category-card" onclick="navigateTo('products?category=${c.id}')">
              <i class="${c.icon}"></i>
              <h4>${c.name}</h4>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- FLASH SALE -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="flash-sale-section">
          <div class="flash-sale-header">
            <div class="flash-sale-title">
              <i class="fas fa-bolt"></i>
              <h2>Flash Sale</h2>
            </div>
            <div class="countdown" id="countdown">
              <div class="countdown-box"><div class="num" id="cd-hours">00</div><div class="label">Hours</div></div>
              <div class="countdown-box"><div class="num" id="cd-mins">00</div><div class="label">Mins</div></div>
              <div class="countdown-box"><div class="num" id="cd-secs">00</div><div class="label">Secs</div></div>
            </div>
          </div>
          <div class="product-grid">
            ${flashSale.slice(0, 4).map(productCard).join('')}
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURED PRODUCTS -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Featured Products</h2>
          <a class="section-link" onclick="navigateTo('products')">View All <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="product-grid">${featured.slice(0, 8).map(productCard).join('')}</div>
      </div>
    </section>

    <!-- TRENDING -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Trending Now</h2>
          <a class="section-link" onclick="navigateTo('products')">View All <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="product-grid">${trending.slice(0, 4).map(productCard).join('')}</div>
      </div>
    </section>

    <!-- GAMING COLLECTION -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Gaming Collection</h2>
          <a class="section-link" onclick="navigateTo('products?category=gaming')">View All <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="product-grid">${gaming.length ? gaming.slice(0, 4).map(productCard).join('') : '<p style="color:var(--text-light)">More gaming products coming soon.</p>'}</div>
      </div>
    </section>

    <!-- NEW ARRIVALS -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-header">
          <h2 class="section-title">Latest Arrivals</h2>
          <a class="section-link" onclick="navigateTo('products')">View All <i class="fas fa-arrow-right"></i></a>
        </div>
        <div class="product-grid">${newArrivals.slice(0, 4).map(productCard).join('')}</div>
      </div>
    </section>

    <!-- BRANDS -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-header"><h2 class="section-title">Top Brands</h2></div>
        <div class="brands-grid">
          ${State.brands.map(b => `
            <div class="brand-card" onclick="navigateTo('products?brand=${b.id}')">
              <div class="brand-logo">${b.logo}</div>
              <div class="brand-name">${b.name}</div>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- REVIEWS -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="section-header"><h2 class="section-title">What Customers Say</h2></div>
        <div class="reviews-grid">
          ${State.reviews.map(r => `
            <div class="review-card">
              <div class="review-stars">${stars(r.rating)}</div>
              <p class="review-text">"${r.text}"</p>
              <div class="review-author">
                <div class="review-avatar">${r.name.charAt(0)}</div>
                <div><div class="review-name">${r.name}</div><div class="review-product">${r.product}</div></div>
              </div>
            </div>`).join('')}
        </div>
      </div>
    </section>

    <!-- Blog and Video sections removed per request -->

    <!-- NEWSLETTER -->
    <section class="section" style="padding-top:0">
      <div class="container">
        <div class="newsletter-section">
          <h2>Stay Updated</h2>
          <p>Subscribe to get special offers, free giveaways, and exclusive deals</p>
          <div class="newsletter-form">
            <input type="email" id="newsletterEmail" placeholder="Enter your email">
            <button onclick="subscribeNewsletter()">Subscribe</button>
          </div>
        </div>
      </div>
    </section>

    ${footerHTML()}
  `;
  startHeroSlider();
  startCountdown();
  updateBadges();
}

function subscribeNewsletter() {
  const email = $('#newsletterEmail').value.trim();
  if (!email || !email.includes('@')) { toast('Please enter a valid email', 'error'); return; }
  if (firebaseInitialized && db) {
    db.collection('newsletter').add({ email, date: new Date().toISOString() }).catch(() => {});
  }
  toast('Subscribed successfully! 🎉', 'success');
  $('#newsletterEmail').value = '';
}

// ---------- HERO SLIDER LOGIC ----------
function startHeroSlider() {
  if (State.heroTimer) clearInterval(State.heroTimer);
  const slides = $$('.hero-slide');
  if (slides.length <= 1) return;
  State.heroIndex = 0;
  State.heroTimer = setInterval(() => {
    State.heroIndex = (State.heroIndex + 1) % slides.length;
    updateHeroSlide();
  }, 5000);
}
function goToSlide(i) { State.heroIndex = i; updateHeroSlide(); startHeroSlider(); }
function updateHeroSlide() {
  $$('.hero-slide').forEach((s, i) => s.classList.toggle('active', i === State.heroIndex));
  $$('.hero-dot').forEach((d, i) => d.classList.toggle('active', i === State.heroIndex));
}

// ---------- COUNTDOWN ----------
function startCountdown() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  const tick = () => {
    const now = new Date();
    let diff = Math.max(0, Math.floor((end - now) / 1000));
    const h = String(Math.floor(diff / 3600)).padStart(2, '0');
    const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
    const s = String(diff % 60).padStart(2, '0');
    const hEl = $('#cd-hours'), mEl = $('#cd-mins'), sEl = $('#cd-secs');
    if (hEl) hEl.textContent = h;
    if (mEl) mEl.textContent = m;
    if (sEl) sEl.textContent = s;
  };
  tick();
  if (window._cdTimer) clearInterval(window._cdTimer);
  window._cdTimer = setInterval(tick, 1000);
}

console.log('Gadgets BD app.js part 2 (home) loaded');

// ---------- PRODUCTS PAGE (with filters) ----------
function renderProducts(params) {
  const preCategory = params.get('category') || '';
  const preBrand = params.get('brand') || '';
  const searchQuery = params.get('search') || '';

  $('#appContent').innerHTML = `
    <div class="page-container">
      <div class="container">
        <div class="breadcrumb">
          <a onclick="navigateTo('home')">Home</a> <i class="fas fa-chevron-right"></i> <span>Products</span>
        </div>
        <div class="products-layout">
          <aside class="filters-sidebar" id="filtersSidebar">
            <div class="filter-group">
              <h4>Category</h4>
              ${State.categories.map(c => `
                <div class="filter-option">
                  <input type="checkbox" id="cat-${c.id}" value="${c.id}" onchange="applyFilters()" ${c.id === preCategory ? 'checked' : ''}>
                  <label for="cat-${c.id}">${c.name}</label>
                </div>`).join('')}
            </div>
            <div class="filter-group">
              <h4>Brand</h4>
              ${State.brands.map(b => `
                <div class="filter-option">
                  <input type="checkbox" id="brand-${b.id}" value="${b.id}" onchange="applyFilters()" ${b.id === preBrand ? 'checked' : ''}>
                  <label for="brand-${b.id}">${b.name}</label>
                </div>`).join('')}
            </div>
            <div class="filter-group">
              <h4>Price Range</h4>
              <input type="range" class="filter-range" id="priceRange" min="0" max="400000" value="400000" step="5000" oninput="updatePriceLabel(); applyFilters()">
              <div class="filter-price-display"><span>৳0</span><span id="priceLabel">৳400,000</span></div>
            </div>
            <div class="filter-group">
              <h4>Rating</h4>
              ${[4, 3, 2].map(r => `
                <div class="filter-option">
                  <input type="checkbox" id="rating-${r}" value="${r}" onchange="applyFilters()">
                  <label for="rating-${r}">${stars(r)} & up</label>
                </div>`).join('')}
            </div>
            <div class="filter-group">
              <h4>Availability</h4>
              <div class="filter-option">
                <input type="checkbox" id="inStock" onchange="applyFilters()">
                <label for="inStock">In Stock Only</label>
              </div>
              <div class="filter-option">
                <input type="checkbox" id="onDiscount" onchange="applyFilters()">
                <label for="onDiscount">On Discount</label>
              </div>
            </div>
            <button class="admin-btn admin-btn-primary" style="width:100%" onclick="clearFilters()">Clear Filters</button>
          </aside>
          <main class="products-main">
            <div class="products-toolbar">
              <span class="products-count" id="productsCount">Loading...</span>
              <div style="display:flex; gap:12px; align-items:center">
                <select class="sort-select" id="sortSelect" onchange="applyFilters()">
                  <option value="default">Sort: Default</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="rating">Highest Rated</option>
                  <option value="discount">Biggest Discount</option>
                </select>
                <div class="view-toggle">
                  <button id="gridViewBtn" class="active" onclick="setView('grid')"><i class="fas fa-th"></i></button>
                  <button id="listViewBtn" onclick="setView('list')"><i class="fas fa-list"></i></button>
                </div>
              </div>
            </div>
            <div class="product-grid" id="productsGrid">${skeletonCards(6)}</div>
          </main>
        </div>
      </div>
    </div>
    ${footerHTML()}
  `;
  window._searchQuery = searchQuery;
  setTimeout(applyFilters, 100);
}

function updatePriceLabel() {
  const val = $('#priceRange').value;
  $('#priceLabel').textContent = fmtPrice(val);
}

function setView(mode) {
  const grid = $('#productsGrid');
  grid.classList.toggle('list-view', mode === 'list');
  $('#gridViewBtn').classList.toggle('active', mode === 'grid');
  $('#listViewBtn').classList.toggle('active', mode === 'list');
}

function clearFilters() {
  $$('#filtersSidebar input[type=checkbox]').forEach(c => c.checked = false);
  $('#priceRange').value = 400000;
  updatePriceLabel();
  window._searchQuery = '';
  applyFilters();
}

function applyFilters() {
  const selectedCats = [...$$('.filter-group input[id^=cat-]:checked')].map(c => c.value);
  const selectedBrands = [...$$('.filter-group input[id^=brand-]:checked')].map(c => c.value);
  const selectedRatings = [...$$('.filter-group input[id^=rating-]:checked')].map(c => Number(c.value));
  const maxPrice = Number($('#priceRange')?.value || 400000);
  const inStock = $('#inStock')?.checked;
  const onDiscount = $('#onDiscount')?.checked;
  const sort = $('#sortSelect')?.value || 'default';
  const search = (window._searchQuery || '').toLowerCase();

  let filtered = State.products.filter(p => {
    if (selectedCats.length && !selectedCats.includes(p.category)) return false;
    if (selectedBrands.length && !selectedBrands.includes(p.brand)) return false;
    if (p.discountPrice > maxPrice) return false;
    if (selectedRatings.length && !selectedRatings.some(r => p.rating >= r)) return false;
    if (inStock && p.stock <= 0) return false;
    if (onDiscount && discountPct(p.price, p.discountPrice) <= 0) return false;
    if (search && !(`${p.name} ${p.brandName} ${p.categoryName} ${(p.tags||[]).join(' ')}`.toLowerCase().includes(search))) return false;
    return true;
  });

  if (sort === 'price-low') filtered.sort((a, b) => a.discountPrice - b.discountPrice);
  else if (sort === 'price-high') filtered.sort((a, b) => b.discountPrice - a.discountPrice);
  else if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  else if (sort === 'discount') filtered.sort((a, b) => discountPct(b.price, b.discountPrice) - discountPct(a.price, a.discountPrice));

  const grid = $('#productsGrid');
  const countEl = $('#productsCount');
  if (countEl) countEl.textContent = `${filtered.length} product${filtered.length !== 1 ? 's' : ''} found`;
  if (grid) {
    grid.innerHTML = filtered.length ? filtered.map(productCard).join('') :
      `<div class="empty-state" style="grid-column:1/-1"><i class="fas fa-search"></i><h3>No products found</h3><p>Try adjusting your filters</p></div>`;
  }
}

// ---------- PRODUCT DETAIL PAGE ----------
function renderProductDetail(id) {
  const p = State.products.find(pr => pr.id === id);
  if (!p) { $('#appContent').innerHTML = `<div class="page-container"><div class="container"><div class="empty-state"><i class="fas fa-box-open"></i><h3>Product not found</h3><button class="btn-buy" onclick="navigateTo('products')">Browse Products</button></div></div></div>${footerHTML()}`; return; }

  const pct = discountPct(p.price, p.discountPrice);
  const related = State.products.filter(r => r.category === p.category && r.id !== p.id).slice(0, 4);
  const inWishlist = State.wishlist.includes(p.id);

  $('#appContent').innerHTML = `
    <div class="page-container">
      <div class="container">
        <div class="breadcrumb">
          <a onclick="navigateTo('home')">Home</a> <i class="fas fa-chevron-right"></i>
          <a onclick="navigateTo('products?category=${p.category}')">${p.categoryName}</a> <i class="fas fa-chevron-right"></i>
          <span>${p.name}</span>
        </div>
        <div class="product-detail-layout">
          <div class="product-gallery">
            <div class="gallery-main" id="galleryMain" onclick="toggleZoom(this)">
              <img src="${p.images[0]}" alt="${p.name}" id="mainImage" onerror="this.src='https://via.placeholder.com/600?text=Gadgets+BD'">
            </div>
            <div class="gallery-thumbs">
              ${p.images.map((img, i) => `
                <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="changeMainImage('${img}', this)">
                  <img src="${img}" alt="thumb" onerror="this.src='https://via.placeholder.com/80'">
                </div>`).join('')}
            </div>
          </div>
          <div class="product-detail-info">
            <div class="detail-brand">${p.brandName}</div>
            <h1>${p.name}</h1>
            <div class="detail-rating">
              <span class="stars">${stars(p.rating)}</span>
              <span class="rating-count">${p.rating} (${p.reviewCount} reviews)</span>
            </div>
            <div class="detail-price">
              <span class="current">${fmtPrice(p.discountPrice)}</span>
              ${pct > 0 ? `<span class="old">${fmtPrice(p.price)}</span><span class="save">Save ${pct}%</span>` : ''}
            </div>
            <div class="detail-stock">
              ${p.stock > 0 ? `<span class="stock-in"><i class="fas fa-check-circle"></i> In Stock (${p.stock} available)</span>` : `<span class="stock-out"><i class="fas fa-times-circle"></i> Out of Stock</span>`}
            </div>
            <p style="color:var(--text-light); margin-bottom:24px">${p.description}</p>
            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:24px; font-size:0.9rem">
              <div><i class="fas fa-shield-alt" style="color:var(--accent); width:20px"></i> ${p.warranty}</div>
              <div><i class="fas fa-credit-card" style="color:var(--accent); width:20px"></i> EMI: ${p.emi}</div>
              <div><i class="fas fa-truck" style="color:var(--accent); width:20px"></i> Free delivery in Dhaka</div>
              <div><i class="fas fa-undo" style="color:var(--accent); width:20px"></i> 7-day return policy</div>
            </div>
            <div class="detail-actions">
              <div class="qty-selector">
                <button onclick="changeQty(-1)">−</button>
                <input type="number" id="detailQty" value="1" min="1" max="${p.stock}">
                <button onclick="changeQty(1)">+</button>
              </div>
              <button class="btn-add-cart" onclick="addToCart('${p.id}', parseInt($('#detailQty').value))" ${p.stock <= 0 ? 'disabled style=opacity:0.5' : ''}><i class="fas fa-shopping-cart"></i> Add to Cart</button>
              <button class="btn-buy-now" onclick="buyNowQty('${p.id}')" ${p.stock <= 0 ? 'disabled style=opacity:0.5' : ''}><i class="fas fa-bolt"></i> Buy Now</button>
            </div>
            <div style="display:flex; gap:16px">
              <button class="wishlist-btn-${p.id} ${inWishlist ? 'active' : ''}" onclick="toggleWishlist('${p.id}')" style="background:none;color:var(--text);display:flex;align-items:center;gap:8px;font-size:0.9rem"><i class="fas fa-heart"></i> Wishlist</button>
              <button onclick="toggleCompare('${p.id}')" style="background:none;color:var(--text);display:flex;align-items:center;gap:8px;font-size:0.9rem"><i class="fas fa-exchange-alt"></i> Compare</button>
            </div>
          </div>
        </div>

        <!-- TABS -->
        <div class="detail-tabs">
          <div class="tab-headers">
            <div class="tab-header active" onclick="switchTab('specs', this)">Specifications</div>
            <div class="tab-header" onclick="switchTab('desc', this)">Description</div>
            <div class="tab-header" onclick="switchTab('reviews', this)">Reviews (${p.reviewCount})</div>
            <div class="tab-header" onclick="switchTab('qa', this)">Q&A</div>
          </div>
          <div class="tab-content active" id="tab-specs">
            <table class="spec-table">
              ${Object.entries(p.specs).map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}
            </table>
          </div>
          <div class="tab-content" id="tab-desc">
            <p style="line-height:1.8">${p.description}</p>
            <h4 style="margin:20px 0 12px">Key Features</h4>
            <ul style="list-style:disc; padding-left:20px; color:var(--text-light); line-height:1.8">
              <li>Premium build quality with ${p.warranty}</li>
              <li>EMI facility: ${p.emi}</li>
              <li>Genuine product with official warranty</li>
              <li>Fast nationwide delivery</li>
            </ul>
          </div>
          <div class="tab-content" id="tab-reviews">
            <div style="display:flex; gap:24px; align-items:center; margin-bottom:24px; flex-wrap:wrap">
              <div style="text-align:center">
                <div style="font-size:3rem; font-weight:800; color:var(--accent)">${p.rating}</div>
                <div class="stars">${stars(p.rating)}</div>
                <div style="font-size:0.8rem; color:var(--text-light)">${p.reviewCount} reviews</div>
              </div>
              <button class="btn-add-cart" onclick="promptReview('${p.id}')"><i class="fas fa-pen"></i> Write a Review</button>
            </div>
            <div id="productReviews">
              ${State.reviews.slice(0, 3).map(r => `
                <div class="review-card" style="margin-bottom:12px">
                  <div class="review-stars">${stars(r.rating)}</div>
                  <p class="review-text">"${r.text}"</p>
                  <div class="review-name">${r.name} · <span style="color:var(--text-light);font-weight:400">${r.date}</span></div>
                </div>`).join('')}
            </div>
          </div>
          <div class="tab-content" id="tab-qa">
            <div style="margin-bottom:16px">
              <input type="text" id="questionInput" placeholder="Ask a question about this product..." style="width:100%;padding:12px 16px;border-radius:10px;border:1px solid var(--border);background:var(--bg-alt);color:var(--text)">
              <button class="btn-add-cart" style="margin-top:12px" onclick="askQuestion()"><i class="fas fa-question-circle"></i> Ask Question</button>
            </div>
            <div class="review-card"><strong>Q: Is this product original?</strong><p style="margin-top:8px;color:var(--text-light)">A: Yes, all our products are 100% genuine with official warranty.</p></div>
          </div>
        </div>

        <!-- RELATED -->
        ${related.length ? `
        <div class="related-products">
          <div class="section-header"><h2 class="section-title">Related Products</h2></div>
          <div class="product-grid">${related.map(productCard).join('')}</div>
        </div>` : ''}
      </div>
    </div>
    ${footerHTML()}
  `;
  updateBadges();
}

function changeMainImage(src, thumb) {
  $('#mainImage').src = src;
  $$('.gallery-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}
function toggleZoom(el) { el.classList.toggle('zoomed'); }
function changeQty(delta) {
  const input = $('#detailQty');
  let val = parseInt(input.value) + delta;
  if (val < 1) val = 1;
  if (val > parseInt(input.max)) val = parseInt(input.max);
  input.value = val;
}
function buyNowQty(id) { addToCart(id, parseInt($('#detailQty').value)); navigateTo('checkout'); }
function switchTab(tab, el) {
  $$('.tab-header').forEach(t => t.classList.remove('active'));
  $$('.tab-content').forEach(t => t.classList.remove('active'));
  el.classList.add('active');
  $('#tab-' + tab).classList.add('active');
}
function promptReview(id) {
  if (!State.user) { toast('Please login to write a review', 'warning'); openAuthModal(); return; }
  const text = prompt('Write your review:');
  if (text) { toast('Thank you for your review!', 'success'); }
}
function askQuestion() {
  const q = $('#questionInput').value.trim();
  if (!q) { toast('Please enter a question', 'error'); return; }
  toast('Your question has been submitted', 'success');
  $('#questionInput').value = '';
}

console.log('Gadgets BD app.js part 3 (products) loaded');

// ---------- DEALS PAGE ----------
function renderDeals() {
  const deals = State.products.filter(p => discountPct(p.price, p.discountPrice) > 0)
    .sort((a, b) => discountPct(b.price, b.discountPrice) - discountPct(a.price, a.discountPrice));
  $('#appContent').innerHTML = `
    <div class="page-container">
      <div class="container">
        <div class="breadcrumb"><a onclick="navigateTo('home')">Home</a> <i class="fas fa-chevron-right"></i> <span>Deals & Offers</span></div>
        <div class="flash-sale-section" style="margin-bottom:32px">
          <div class="flash-sale-header">
            <div class="flash-sale-title"><i class="fas fa-tags"></i><h2>Today's Best Deals</h2></div>
            <div class="countdown">
              <div class="countdown-box"><div class="num" id="cd-hours">00</div><div class="label">Hrs</div></div>
              <div class="countdown-box"><div class="num" id="cd-mins">00</div><div class="label">Min</div></div>
              <div class="countdown-box"><div class="num" id="cd-secs">00</div><div class="label">Sec</div></div>
            </div>
          </div>
        </div>
        <div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:32px">
          ${State.offers.map(o => `
            <div class="admin-card" style="text-align:center">
              <div class="admin-card-icon" style="background:var(--gradient); margin:0 auto 16px"><i class="fas fa-gift"></i></div>
              <h4 style="font-size:1.1rem; margin-bottom:8px">${o.title}</h4>
              <p style="color:var(--text-light); font-size:0.85rem; margin-bottom:12px">${o.description}</p>
              <div style="display:inline-block; padding:8px 16px; border:2px dashed var(--accent); border-radius:8px; font-weight:700; color:var(--accent); cursor:pointer" onclick="copyCoupon('${o.code}')">${o.code} <i class="fas fa-copy"></i></div>
            </div>`).join('')}
        </div>
        <div class="section-header"><h2 class="section-title">All Discounted Products</h2></div>
        <div class="product-grid">${deals.map(productCard).join('')}</div>
      </div>
    </div>
    ${footerHTML()}
  `;
  startCountdown();
  updateBadges();
}
function copyCoupon(code) {
  navigator.clipboard?.writeText(code).catch(() => {});
  toast(`Coupon "${code}" copied!`, 'success');
}

// ---------- CART PAGE ----------
function renderCart() {
  const items = State.cart.map(item => {
    const p = State.products.find(pr => pr.id === item.id);
    return p ? { ...p, qty: item.qty } : null;
  }).filter(Boolean);

  if (items.length === 0) {
    $('#appContent').innerHTML = `
      <div class="page-container"><div class="container">
        <div class="empty-state">
          <i class="fas fa-shopping-cart"></i>
          <h3>Your cart is empty</h3>
          <p>Looks like you haven't added anything yet</p>
          <button class="btn-buy" style="padding:14px 32px; margin:0 auto" onclick="navigateTo('products')">Start Shopping</button>
        </div>
      </div></div>${footerHTML()}`;
    updateBadges();
    return;
  }

  const subtotal = cartTotal();
  const shipping = subtotal >= 10000 ? 0 : 120;
  let discount = 0;
  if (State.appliedCoupon) {
    const c = State.appliedCoupon;
    if (c.type === 'flat') discount = c.discount;
    else if (c.type === 'percent') discount = Math.round(subtotal * c.discount / 100);
  }
  const total = subtotal - discount + shipping;

  $('#appContent').innerHTML = `
    <div class="page-container">
      <div class="container">
        <div class="breadcrumb"><a onclick="navigateTo('home')">Home</a> <i class="fas fa-chevron-right"></i> <span>Shopping Cart</span></div>
        <h2 class="section-title" style="margin-bottom:24px">Shopping Cart (${items.length})</h2>
        <div class="cart-layout">
          <div class="cart-items">
            ${items.map(p => `
              <div class="cart-item">
                <div class="cart-item-img"><img src="${p.images[0]}" alt="${p.name}"></div>
                <div class="cart-item-info">
                  <div class="cart-item-brand">${p.brandName}</div>
                  <div class="cart-item-name">${p.name}</div>
                  <div class="cart-item-price">${fmtPrice(p.discountPrice)}</div>
                  <div class="cart-item-controls">
                    <div class="qty-selector">
                      <button onclick="updateCartQty('${p.id}', -1)">−</button>
                      <input type="number" value="${p.qty}" readonly style="width:40px">
                      <button onclick="updateCartQty('${p.id}', 1)">+</button>
                    </div>
                    <span class="cart-item-remove" onclick="removeFromCart('${p.id}')"><i class="fas fa-trash"></i> Remove</span>
                  </div>
                </div>
                <div style="font-weight:800; color:var(--accent)">${fmtPrice(p.discountPrice * p.qty)}</div>
              </div>`).join('')}
          </div>
          <div class="cart-summary">
            <h3>Order Summary</h3>
            <div class="coupon-input">
              <input type="text" id="couponCode" placeholder="Coupon code" value="${State.appliedCoupon ? State.appliedCoupon.code : ''}">
              <button onclick="applyCoupon()">Apply</button>
            </div>
            <div class="summary-row"><span>Subtotal</span><span>${fmtPrice(subtotal)}</span></div>
            ${discount > 0 ? `<div class="summary-row" style="color:var(--success)"><span>Discount</span><span>−${fmtPrice(discount)}</span></div>` : ''}
            <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : fmtPrice(shipping)}</span></div>
            <div class="summary-row" style="font-size:0.8rem; color:var(--text-light)"><span>Estimated delivery</span><span>2-3 days</span></div>
            <div class="summary-row total"><span>Total</span><span>${fmtPrice(total)}</span></div>
            <button class="btn-checkout" onclick="navigateTo('checkout')">Proceed to Checkout <i class="fas fa-arrow-right"></i></button>
            <button class="btn-cart" style="width:100%; margin-top:12px; padding:14px" onclick="navigateTo('products')">Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
    ${footerHTML()}
  `;
  updateBadges();
}

function applyCoupon() {
  const code = $('#couponCode').value.trim().toUpperCase();
  const offer = State.offers.find(o => o.code === code && o.active);
  if (!offer) { toast('Invalid coupon code', 'error'); return; }
  const subtotal = cartTotal();
  if (subtotal < offer.minOrder) { toast(`Minimum order ৳${offer.minOrder.toLocaleString()} required`, 'warning'); return; }
  State.appliedCoupon = offer;
  toast(`Coupon "${code}" applied!`, 'success');
  renderCart();
}

// ---------- CHECKOUT PAGE ----------
function renderCheckout() {
  const items = State.cart.map(item => {
    const p = State.products.find(pr => pr.id === item.id);
    return p ? { ...p, qty: item.qty } : null;
  }).filter(Boolean);

  if (items.length === 0) { navigateTo('cart'); return; }

  const subtotal = cartTotal();
  const shipping = subtotal >= 10000 ? 0 : 120;
  let discount = 0;
  if (State.appliedCoupon) {
    const c = State.appliedCoupon;
    if (c.type === 'flat') discount = c.discount;
    else if (c.type === 'percent') discount = Math.round(subtotal * c.discount / 100);
  }
  const total = subtotal - discount + shipping;
  const u = State.user || {};

  $('#appContent').innerHTML = `
    <div class="page-container">
      <div class="container">
        <div class="breadcrumb"><a onclick="navigateTo('cart')">Cart</a> <i class="fas fa-chevron-right"></i> <span>Checkout</span></div>
        <h2 class="section-title" style="margin-bottom:24px">Checkout</h2>
        <div class="checkout-layout">
          <div class="checkout-form">
            <div class="form-section">
              <h3><i class="fas fa-user"></i> Billing Information</h3>
              <div class="form-grid">
                <div class="form-field"><label>Full Name *</label><input type="text" id="coName" value="${u.name || ''}" placeholder="Your name"></div>
                <div class="form-field"><label>Phone *</label><input type="tel" id="coPhone" value="${u.phone || ''}" placeholder="01XXXXXXXXX"></div>
              </div>
              <div class="form-field"><label>Email *</label><input type="email" id="coEmail" value="${u.email || ''}" placeholder="you@email.com"></div>
            </div>
            <div class="form-section">
              <h3><i class="fas fa-map-marker-alt"></i> Shipping Address</h3>
              <div class="form-field"><label>Address *</label><input type="text" id="coAddress" placeholder="House, road, area"></div>
              <div class="form-grid">
                <div class="form-field"><label>City *</label>
                  <select id="coCity">
                    <option>Dhaka</option><option>Chittagong</option><option>Sylhet</option>
                    <option>Khulna</option><option>Rajshahi</option><option>Barisal</option>
                    <option>Rangpur</option><option>Mymensingh</option>
                  </select>
                </div>
                <div class="form-field"><label>Postal Code</label><input type="text" id="coPostal" placeholder="1200"></div>
              </div>
            </div>
            <div class="form-section">
              <h3><i class="fas fa-truck"></i> Delivery Option</h3>
              <div class="payment-methods">
                <label class="payment-option selected" onclick="selectDelivery(this, 'standard')">
                  <input type="radio" name="delivery" checked>
                  <span class="pay-icon"><i class="fas fa-box"></i></span>
                  <div><label>Standard Delivery</label><div style="font-size:0.8rem;color:var(--text-light)">2-3 days · ${shipping === 0 ? 'FREE' : fmtPrice(120)}</div></div>
                </label>
                <label class="payment-option" onclick="selectDelivery(this, 'express')">
                  <input type="radio" name="delivery">
                  <span class="pay-icon"><i class="fas fa-shipping-fast"></i></span>
                  <div><label>Express Delivery</label><div style="font-size:0.8rem;color:var(--text-light)">Same day in Dhaka · ${fmtPrice(250)}</div></div>
                </label>
              </div>
            </div>
            <div class="form-section">
              <h3><i class="fas fa-credit-card"></i> Payment Method</h3>
              <div class="payment-methods">
                <label class="payment-option selected" onclick="selectPayment(this, 'cod')"><input type="radio" name="payment" checked><span class="pay-icon">💵</span><label>Cash on Delivery</label></label>
                <label class="payment-option" onclick="selectPayment(this, 'bkash')"><input type="radio" name="payment"><span class="pay-icon" style="color:#E2136E">📱</span><label>bKash</label></label>
                <label class="payment-option" onclick="selectPayment(this, 'nagad')"><input type="radio" name="payment"><span class="pay-icon" style="color:#F60">📲</span><label>Nagad</label></label>
                <label class="payment-option" onclick="selectPayment(this, 'rocket')"><input type="radio" name="payment"><span class="pay-icon" style="color:#8C3FA0">🚀</span><label>Rocket</label></label>
                <label class="payment-option" onclick="selectPayment(this, 'card')"><input type="radio" name="payment"><span class="pay-icon">💳</span><label>Visa / MasterCard (SSLCommerz)</label></label>
              </div>
            </div>
            <div class="form-section">
              <h3><i class="fas fa-sticky-note"></i> Order Notes</h3>
              <div class="form-field"><textarea id="coNotes" rows="3" placeholder="Any special instructions? (optional)"></textarea></div>
            </div>
          </div>
          <div class="cart-summary">
            <h3>Order Summary</h3>
            <div style="max-height:240px; overflow-y:auto; margin-bottom:16px">
              ${items.map(p => `
                <div style="display:flex; gap:12px; margin-bottom:12px; align-items:center">
                  <img src="${p.images[0]}" style="width:50px;height:50px;border-radius:8px;object-fit:cover">
                  <div style="flex:1"><div style="font-size:0.8rem;font-weight:600">${p.name}</div><div style="font-size:0.75rem;color:var(--text-light)">Qty: ${p.qty}</div></div>
                  <div style="font-weight:700;font-size:0.85rem">${fmtPrice(p.discountPrice * p.qty)}</div>
                </div>`).join('')}
            </div>
            <div class="summary-row"><span>Subtotal</span><span>${fmtPrice(subtotal)}</span></div>
            ${discount > 0 ? `<div class="summary-row" style="color:var(--success)"><span>Discount</span><span>−${fmtPrice(discount)}</span></div>` : ''}
            <div class="summary-row"><span>Shipping</span><span>${shipping === 0 ? 'FREE' : fmtPrice(shipping)}</span></div>
            <div class="summary-row total"><span>Total</span><span>${fmtPrice(total)}</span></div>
            <button class="btn-checkout" onclick="placeOrder(${total})">Place Order <i class="fas fa-check"></i></button>
          </div>
        </div>
      </div>
    </div>
    ${footerHTML()}
  `;
  window._checkoutData = { delivery: 'standard', payment: 'cod', total };
  updateBadges();
}

function selectDelivery(el, mode) {
  $$('.payment-option').forEach(o => { if (o.querySelector('input[name=delivery]')) o.classList.remove('selected'); });
  el.classList.add('selected');
  el.querySelector('input').checked = true;
  window._checkoutData.delivery = mode;
}
function selectPayment(el, mode) {
  $$('.payment-option').forEach(o => { if (o.querySelector('input[name=payment]')) o.classList.remove('selected'); });
  el.classList.add('selected');
  el.querySelector('input').checked = true;
  window._checkoutData.payment = mode;
}

async function placeOrder(total) {
  const name = $('#coName').value.trim();
  const phone = $('#coPhone').value.trim();
  const email = $('#coEmail').value.trim();
  const address = $('#coAddress').value.trim();
  const city = $('#coCity').value;
  if (!name || !phone || !address) { toast('Please fill all required fields', 'error'); return; }

  const order = {
    id: 'GBD' + Date.now().toString().slice(-8),
    items: State.cart.map(item => {
      const p = State.products.find(pr => pr.id === item.id);
      return { id: p.id, name: p.name, price: p.discountPrice, qty: item.qty, image: p.images[0] };
    }),
    customer: { name, phone, email, address, city },
    payment: window._checkoutData.payment,
    delivery: window._checkoutData.delivery,
    notes: $('#coNotes').value.trim(),
    total,
    status: 'pending',
    date: new Date().toISOString(),
    userId: State.user ? State.user.uid : 'guest',
  };

  // Save to Firebase
  if (firebaseInitialized && db) {
    try { await db.collection('orders').doc(order.id).set(order); } catch (e) { console.warn(e); }
  }
  State.orders.push(order);
  State.cart = [];
  State.appliedCoupon = null;
  saveState();
  navigateTo('order-success?id=' + order.id);
}

function renderOrderSuccess(orderId) {
  const order = State.orders.find(o => o.id === orderId);
  $('#appContent').innerHTML = `
    <div class="page-container"><div class="container">
      <div class="empty-state" style="max-width:600px; margin:0 auto">
        <i class="fas fa-check-circle" style="color:var(--success)"></i>
        <h3>Order Placed Successfully!</h3>
        <p>Thank you for your order. Your order ID is <strong>${orderId}</strong></p>
        ${order ? `<div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--radius);padding:24px;margin:24px 0;text-align:left">
          <div class="summary-row"><span>Order ID</span><span>${order.id}</span></div>
          <div class="summary-row"><span>Total</span><span>${fmtPrice(order.total)}</span></div>
          <div class="summary-row"><span>Payment</span><span style="text-transform:uppercase">${order.payment}</span></div>
          <div class="summary-row"><span>Status</span><span class="order-status status-pending">Pending</span></div>
        </div>` : ''}
        <div style="display:flex; gap:12px; justify-content:center">
          <button class="btn-buy" style="padding:14px 28px" onclick="navigateTo('track-order?id=${orderId}')">Track Order</button>
          <button class="btn-cart" style="padding:14px 28px" onclick="navigateTo('products')">Continue Shopping</button>
        </div>
      </div>
    </div></div>${footerHTML()}`;
  updateBadges();
}

console.log('Gadgets BD app.js part 4 (cart/checkout) loaded');

// ---------- WISHLIST PAGE ----------
function renderWishlist() {
  const items = State.wishlist.map(id => State.products.find(p => p.id === id)).filter(Boolean);
  $('#appContent').innerHTML = `
    <div class="page-container"><div class="container">
      <div class="breadcrumb"><a onclick="navigateTo('home')">Home</a> <i class="fas fa-chevron-right"></i> <span>Wishlist</span></div>
      <h2 class="section-title" style="margin-bottom:24px">My Wishlist (${items.length})</h2>
      ${items.length ? `<div class="product-grid">${items.map(productCard).join('')}</div>` :
        `<div class="empty-state"><i class="fas fa-heart"></i><h3>Your wishlist is empty</h3><p>Save items you love for later</p><button class="btn-buy" style="padding:14px 32px; margin:0 auto" onclick="navigateTo('products')">Explore Products</button></div>`}
    </div></div>${footerHTML()}`;
  updateBadges();
}

// ---------- COMPARE PAGE ----------
function renderCompare() {
  const items = State.compare.map(id => State.products.find(p => p.id === id)).filter(Boolean);
  if (items.length === 0) {
    $('#appContent').innerHTML = `<div class="page-container"><div class="container">
      <div class="empty-state"><i class="fas fa-exchange-alt"></i><h3>No products to compare</h3><p>Add products to compare their features side by side</p><button class="btn-buy" style="padding:14px 32px; margin:0 auto" onclick="navigateTo('products')">Browse Products</button></div>
    </div></div>${footerHTML()}`;
    return;
  }
  // Collect all spec keys
  const specKeys = [...new Set(items.flatMap(p => Object.keys(p.specs)))];
  $('#appContent').innerHTML = `
    <div class="page-container"><div class="container">
      <div class="breadcrumb"><a onclick="navigateTo('home')">Home</a> <i class="fas fa-chevron-right"></i> <span>Compare</span></div>
      <h2 class="section-title" style="margin-bottom:24px">Compare Products (${items.length})</h2>
      <div style="overflow-x:auto">
        <table class="compare-table">
          <tr><td class="compare-label"></td>${items.map(p => `<th><img src="${p.images[0]}"><div style="margin-top:8px;font-size:0.85rem">${p.name}</div><button class="cart-item-remove" style="margin-top:4px" onclick="toggleCompare('${p.id}')">Remove</button></th>`).join('')}</tr>
          <tr><td class="compare-label">Price</td>${items.map(p => `<td style="font-weight:800;color:var(--accent)">${fmtPrice(p.discountPrice)}</td>`).join('')}</tr>
          <tr><td class="compare-label">Brand</td>${items.map(p => `<td>${p.brandName}</td>`).join('')}</tr>
          <tr><td class="compare-label">Rating</td>${items.map(p => `<td><span class="stars">${stars(p.rating)}</span></td>`).join('')}</tr>
          <tr><td class="compare-label">Stock</td>${items.map(p => `<td>${p.stock > 0 ? '<span class="stock-in">In Stock</span>' : '<span class="stock-out">Out</span>'}</td>`).join('')}</tr>
          <tr><td class="compare-label">Warranty</td>${items.map(p => `<td>${p.warranty}</td>`).join('')}</tr>
          ${specKeys.map(k => `<tr><td class="compare-label">${k}</td>${items.map(p => `<td>${p.specs[k] || '—'}</td>`).join('')}</tr>`).join('')}
          <tr><td class="compare-label"></td>${items.map(p => `<td><button class="btn-buy" style="padding:10px 16px" onclick="addToCart('${p.id}')">Add to Cart</button></td>`).join('')}</tr>
        </table>
      </div>
    </div></div>${footerHTML()}`;
  updateBadges();
}

// ---------- QUICK VIEW MODAL ----------
function openQuickView(id) {
  const p = State.products.find(pr => pr.id === id);
  if (!p) return;
  const pct = discountPct(p.price, p.discountPrice);
  $('#quickViewContent').innerHTML = `
    <div class="qv-layout">
      <div class="qv-img"><img src="${p.images[0]}" alt="${p.name}"></div>
      <div>
        <div class="detail-brand">${p.brandName}</div>
        <h2 style="font-size:1.3rem; margin:8px 0">${p.name}</h2>
        <div class="detail-rating"><span class="stars">${stars(p.rating)}</span><span class="rating-count">(${p.reviewCount})</span></div>
        <div class="detail-price" style="margin:16px 0">
          <span class="current" style="font-size:1.6rem">${fmtPrice(p.discountPrice)}</span>
          ${pct > 0 ? `<span class="old">${fmtPrice(p.price)}</span><span class="save">${pct}% OFF</span>` : ''}
        </div>
        <p style="color:var(--text-light); font-size:0.9rem; margin-bottom:20px">${p.description.slice(0, 150)}...</p>
        <div style="display:flex; gap:12px">
          <button class="btn-add-cart" onclick="addToCart('${p.id}'); closeQuickView()"><i class="fas fa-shopping-cart"></i> Add to Cart</button>
          <button class="btn-buy-now" onclick="closeQuickView(); navigateTo('product?id=${p.id}')">View Details</button>
        </div>
      </div>
    </div>`;
  $('#quickViewModal').classList.add('active');
}
function closeQuickView() { $('#quickViewModal').classList.remove('active'); }

// ---------- TRACK ORDER ----------
function renderTrackOrder(preId) {
  const params = new URLSearchParams((window.location.hash.split('?')[1]) || '');
  const orderId = preId || params.get('id') || '';
  $('#appContent').innerHTML = `
    <div class="page-container"><div class="container">
      <div class="breadcrumb"><a onclick="navigateTo('home')">Home</a> <i class="fas fa-chevron-right"></i> <span>Track Order</span></div>
      <div class="tracking-container">
        <h2 class="section-title" style="margin-bottom:24px">Track Your Order</h2>
        <div style="display:flex; gap:12px; margin-bottom:32px">
          <input type="text" id="trackInput" value="${orderId}" placeholder="Enter Order ID (e.g. GBD12345678)" style="flex:1; padding:14px 16px; border-radius:10px; border:1px solid var(--border); background:var(--bg-alt); color:var(--text)">
          <button class="btn-buy" style="padding:14px 28px" onclick="trackOrder()">Track</button>
        </div>
        <div id="trackingResult"></div>
      </div>
    </div></div>${footerHTML()}`;
  if (orderId) setTimeout(trackOrder, 100);
  updateBadges();
}

async function trackOrder() {
  const id = $('#trackInput').value.trim();
  if (!id) { toast('Please enter an order ID', 'error'); return; }
  let order = State.orders.find(o => o.id === id);
  if (!order && firebaseInitialized && db) {
    try { const doc = await db.collection('orders').doc(id).get(); if (doc.exists) order = doc.data(); } catch (e) {}
  }
  const result = $('#trackingResult');
  if (!order) {
    result.innerHTML = `<div class="empty-state"><i class="fas fa-box-open"></i><h3>Order not found</h3><p>Please check your order ID and try again</p></div>`;
    return;
  }
  const statuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];
  const labels = { pending: 'Order Placed', confirmed: 'Confirmed', processing: 'Processing', shipped: 'Shipped', delivered: 'Delivered' };
  const icons = { pending: 'fa-receipt', confirmed: 'fa-check', processing: 'fa-cog', shipped: 'fa-truck', delivered: 'fa-box-open' };
  const currentIdx = order.status === 'cancelled' ? -1 : statuses.indexOf(order.status);

  result.innerHTML = `
    <div style="background:var(--glass);border:1px solid var(--border);border-radius:var(--radius);padding:24px;margin-bottom:24px">
      <div class="summary-row"><span>Order ID</span><strong>${order.id}</strong></div>
      <div class="summary-row"><span>Total</span><span>${fmtPrice(order.total)}</span></div>
      <div class="summary-row"><span>Status</span><span class="order-status status-${order.status}">${order.status.toUpperCase()}</span></div>
    </div>
    ${order.status === 'cancelled' ? `<div class="empty-state"><i class="fas fa-times-circle" style="color:var(--danger)"></i><h3>Order Cancelled</h3></div>` :
    `<div class="tracking-timeline">
      ${statuses.map((s, i) => `
        <div class="tracking-step ${i < currentIdx ? 'completed' : ''} ${i === currentIdx ? 'current' : ''}">
          <div class="tracking-icon"><i class="fas ${icons[s]}"></i></div>
          <div class="tracking-info"><h4>${labels[s]}</h4><p>${i <= currentIdx ? 'Completed' : 'Pending'}</p></div>
        </div>`).join('')}
    </div>`}`;
}

console.log('Gadgets BD app.js part 5 (wishlist/compare/track) loaded');

// ---------- USER DASHBOARD ----------
function renderDashboard() {
  if (!State.user) { openAuthModal(); navigateTo('home'); return; }
  const u = State.user;
  const userOrders = State.orders.filter(o => o.userId === u.uid || o.customer?.email === u.email);
  const initial = (u.name || u.email || 'U').charAt(0).toUpperCase();

  $('#appContent').innerHTML = `
    <div class="page-container"><div class="container">
      <div class="breadcrumb"><a onclick="navigateTo('home')">Home</a> <i class="fas fa-chevron-right"></i> <span>My Account</span></div>
      <div class="dashboard-layout">
        <aside class="dashboard-sidebar">
          <div class="dashboard-user">
            <div class="dashboard-avatar">${initial}</div>
            <h4>${u.name || 'User'}</h4>
            <p>${u.email}</p>
          </div>
          <div class="dashboard-menu-item active" onclick="switchDashPanel('overview', this)"><i class="fas fa-th-large"></i> Overview</div>
          <div class="dashboard-menu-item" onclick="switchDashPanel('orders', this)"><i class="fas fa-box"></i> My Orders</div>
          <div class="dashboard-menu-item" onclick="switchDashPanel('wishlist', this)"><i class="fas fa-heart"></i> Wishlist</div>
          <div class="dashboard-menu-item" onclick="switchDashPanel('addresses', this)"><i class="fas fa-map-marker-alt"></i> Addresses</div>
          <div class="dashboard-menu-item" onclick="switchDashPanel('profile', this)"><i class="fas fa-user"></i> Profile</div>
          <div class="dashboard-menu-item" onclick="switchDashPanel('security', this)"><i class="fas fa-lock"></i> Security</div>
          <div class="dashboard-menu-item" onclick="handleLogout()"><i class="fas fa-sign-out-alt"></i> Logout</div>
        </aside>
        <main class="dashboard-content">
          <div class="dashboard-panel active" id="dash-overview">
            <h2 style="margin-bottom:24px">Welcome back, ${u.name || 'User'}! 👋</h2>
            <div class="dashboard-stats">
              <div class="stat-card"><div class="stat-icon"><i class="fas fa-box"></i></div><div class="stat-value">${userOrders.length}</div><div class="stat-label">Total Orders</div></div>
              <div class="stat-card"><div class="stat-icon"><i class="fas fa-heart"></i></div><div class="stat-value">${State.wishlist.length}</div><div class="stat-label">Wishlist Items</div></div>
              <div class="stat-card"><div class="stat-icon"><i class="fas fa-wallet"></i></div><div class="stat-value">${fmtPrice(userOrders.reduce((s, o) => s + o.total, 0))}</div><div class="stat-label">Total Spent</div></div>
            </div>
            <h3 style="margin-bottom:16px">Recent Orders</h3>
            ${userOrders.slice(-3).reverse().map(orderCardHTML).join('') || '<p style="color:var(--text-light)">No orders yet.</p>'}
          </div>
          <div class="dashboard-panel" id="dash-orders">
            <h2 style="margin-bottom:24px">My Orders</h2>
            ${userOrders.length ? userOrders.slice().reverse().map(orderCardHTML).join('') : '<div class="empty-state"><i class="fas fa-box"></i><h3>No orders yet</h3><button class="btn-buy" style="padding:12px 24px" onclick="navigateTo(\'products\')">Start Shopping</button></div>'}
          </div>
          <div class="dashboard-panel" id="dash-wishlist">
            <h2 style="margin-bottom:24px">My Wishlist</h2>
            ${State.wishlist.length ? `<div class="product-grid" style="grid-template-columns:repeat(2,1fr)">${State.wishlist.map(id => State.products.find(p => p.id === id)).filter(Boolean).map(productCard).join('')}</div>` : '<p style="color:var(--text-light)">Your wishlist is empty.</p>'}
          </div>
          <div class="dashboard-panel" id="dash-addresses">
            <h2 style="margin-bottom:24px">Address Book</h2>
            <div style="background:var(--bg-alt);border-radius:var(--radius);padding:24px;margin-bottom:16px">
              <div style="font-weight:700;margin-bottom:8px"><i class="fas fa-home"></i> Default Address</div>
              <p style="color:var(--text-light);font-size:0.9rem">${u.address || 'No address saved. Add one during checkout.'}</p>
            </div>
            <button class="btn-add-cart" onclick="toast('Add address during checkout', 'info')"><i class="fas fa-plus"></i> Add New Address</button>
          </div>
          <div class="dashboard-panel" id="dash-profile">
            <h2 style="margin-bottom:24px">Profile Settings</h2>
            <div class="admin-form">
              <div class="form-field"><label>Full Name</label><input type="text" id="profName" value="${u.name || ''}"></div>
              <div class="form-field"><label>Email</label><input type="email" value="${u.email}" disabled style="opacity:0.6"></div>
              <div class="form-field"><label>Phone</label><input type="tel" id="profPhone" value="${u.phone || ''}"></div>
              <button class="btn-auth" style="margin-top:16px" onclick="updateProfile()">Save Changes</button>
            </div>
          </div>
          <div class="dashboard-panel" id="dash-security">
            <h2 style="margin-bottom:24px">Security</h2>
            <div class="admin-form">
              <div class="form-field"><label>Current Password</label><input type="password" placeholder="••••••••"></div>
              <div class="form-field"><label>New Password</label><input type="password" placeholder="••••••••"></div>
              <button class="btn-auth" style="margin-top:16px" onclick="toast('Password updated', 'success')">Update Password</button>
            </div>
          </div>
        </main>
      </div>
    </div></div>${footerHTML()}`;
  updateBadges();
}

function orderCardHTML(o) {
  return `<div class="order-card">
    <div class="order-header">
      <div><div class="order-id">#${o.id}</div><div style="font-size:0.75rem;color:var(--text-light)">${new Date(o.date).toLocaleDateString()}</div></div>
      <span class="order-status status-${o.status}">${o.status.toUpperCase()}</span>
    </div>
    <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap">
      ${o.items.slice(0, 4).map(i => `<img src="${i.image}" style="width:44px;height:44px;border-radius:8px;object-fit:cover" title="${i.name}">`).join('')}
      ${o.items.length > 4 ? `<div style="width:44px;height:44px;border-radius:8px;background:var(--bg-alt);display:flex;align-items:center;justify-content:center;font-size:0.75rem">+${o.items.length - 4}</div>` : ''}
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center">
      <strong>${fmtPrice(o.total)}</strong>
      <button class="admin-btn admin-btn-primary" onclick="navigateTo('track-order?id=${o.id}')">Track</button>
    </div>
  </div>`;
}

function switchDashPanel(panel, el) {
  $$('.dashboard-menu-item').forEach(m => m.classList.remove('active'));
  $$('.dashboard-panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  $('#dash-' + panel).classList.add('active');
}
function updateProfile() {
  State.user.name = $('#profName').value.trim();
  State.user.phone = $('#profPhone').value.trim();
  saveState();
  toast('Profile updated successfully', 'success');
  renderDashboard();
}

// ---------- STATIC PAGES ----------
function renderAbout() {
  $('#appContent').innerHTML = `
    <div class="page-container"><div class="container">
      <div class="breadcrumb"><a onclick="navigateTo('home')">Home</a> <i class="fas fa-chevron-right"></i> <span>About Us</span></div>
      <div style="max-width:800px;margin:0 auto;text-align:center">
        <div class="logo" style="justify-content:center;font-size:2.5rem;margin-bottom:24px"><div class="logo-icon" style="width:60px;height:60px;font-size:1.8rem"><i class="fas fa-bolt"></i></div><span class="logo-text">Gadgets<span>BD</span></span></div>
        <h1 style="font-size:2rem;margin-bottom:16px">Bangladesh's Premium Electronics Marketplace</h1>
        <p style="color:var(--text-light);line-height:1.8;margin-bottom:32px">Gadgets BD is your trusted destination for authentic electronics in Bangladesh. From premium laptops and gaming gear to smart home devices, we bring you the latest technology with genuine warranty, competitive prices, and lightning-fast delivery across the country.</p>
      </div>
      <div class="service-highlights" style="margin-top:32px">
        ${State.services.map(s => `<div class="service-card"><div class="service-icon"><i class="${s.icon}"></i></div><div><h4>${s.title}</h4><p>${s.desc}</p></div></div>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:24px;margin-top:48px;text-align:center">
        <div><div style="font-size:2.5rem;font-weight:800;color:var(--accent)">50K+</div><div style="color:var(--text-light)">Happy Customers</div></div>
        <div><div style="font-size:2.5rem;font-weight:800;color:var(--accent)">10K+</div><div style="color:var(--text-light)">Products</div></div>
        <div><div style="font-size:2.5rem;font-weight:800;color:var(--accent)">64</div><div style="color:var(--text-light)">Districts Covered</div></div>
        <div><div style="font-size:2.5rem;font-weight:800;color:var(--accent)">99%</div><div style="color:var(--text-light)">Satisfaction</div></div>
      </div>
    </div></div>${footerHTML()}`;
  updateBadges();
}

function renderContact() {
  $('#appContent').innerHTML = `
    <div class="page-container"><div class="container">
      <div class="breadcrumb"><a onclick="navigateTo('home')">Home</a> <i class="fas fa-chevron-right"></i> <span>Contact</span></div>
      <h2 class="section-title" style="margin-bottom:24px">Get in Touch</h2>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px">
        <div class="checkout-form">
          <div class="form-field"><label>Your Name</label><input type="text" id="contactName" placeholder="Name"></div>
          <div class="form-field"><label>Email</label><input type="email" id="contactEmail" placeholder="you@email.com"></div>
          <div class="form-field"><label>Subject</label><input type="text" id="contactSubject" placeholder="How can we help?"></div>
          <div class="form-field"><label>Message</label><textarea id="contactMsg" rows="5" placeholder="Your message..."></textarea></div>
          <button class="btn-auth" onclick="submitContact()">Send Message</button>
        </div>
        <div>
          <div class="admin-card" style="margin-bottom:16px"><div class="admin-card-icon" style="background:var(--gradient)"><i class="fas fa-map-marker-alt"></i></div><h4>Visit Us</h4><p style="color:var(--text-light)">Level 5, Tech Tower, Gulshan-1, Dhaka 1212, Bangladesh</p></div>
          <div class="admin-card" style="margin-bottom:16px"><div class="admin-card-icon" style="background:var(--gradient)"><i class="fas fa-phone"></i></div><h4>Call Us</h4><p style="color:var(--text-light)">+880 1700-000000<br>Sat-Thu: 9AM - 9PM</p></div>
          <div class="admin-card"><div class="admin-card-icon" style="background:var(--gradient)"><i class="fas fa-envelope"></i></div><h4>Email Us</h4><p style="color:var(--text-light)">support@gadgetsbd.com</p></div>
        </div>
      </div>
    </div></div>${footerHTML()}`;
  updateBadges();
}
function submitContact() {
  const name = $('#contactName').value.trim();
  const msg = $('#contactMsg').value.trim();
  if (!name || !msg) { toast('Please fill in your name and message', 'error'); return; }
  if (firebaseInitialized && db) db.collection('contacts').add({ name, email: $('#contactEmail').value, subject: $('#contactSubject').value, message: msg, date: new Date().toISOString() }).catch(() => {});
  toast('Message sent! We\'ll get back to you soon.', 'success');
  ['contactName', 'contactEmail', 'contactSubject', 'contactMsg'].forEach(id => $('#' + id).value = '');
}

function renderSupport() {
  const faqs = [
    { q: 'What payment methods do you accept?', a: 'We accept Cash on Delivery, bKash, Nagad, Rocket, and Visa/MasterCard through SSLCommerz.' },
    { q: 'How long does delivery take?', a: 'Same-day delivery in Dhaka and 2-3 business days for the rest of Bangladesh.' },
    { q: 'Are your products genuine?', a: 'Yes! All products are 100% authentic with official manufacturer warranty.' },
    { q: 'What is your return policy?', a: 'We offer a 7-day return policy for defective or wrong products.' },
    { q: 'Do you offer EMI?', a: 'Yes, EMI facility is available on select products through partner banks.' },
  ];
  $('#appContent').innerHTML = `
    <div class="page-container"><div class="container">
      <div class="breadcrumb"><a onclick="navigateTo('home')">Home</a> <i class="fas fa-chevron-right"></i> <span>Support</span></div>
      <div style="max-width:800px;margin:0 auto">
        <h2 class="section-title" style="margin-bottom:24px">Frequently Asked Questions</h2>
        ${faqs.map((f, i) => `
          <div class="admin-card" style="margin-bottom:12px;cursor:pointer" onclick="toggleFaq(${i})">
            <div style="display:flex;justify-content:space-between;align-items:center">
              <strong>${f.q}</strong><i class="fas fa-chevron-down" id="faq-icon-${i}"></i>
            </div>
            <p id="faq-${i}" style="color:var(--text-light);margin-top:12px;display:none">${f.a}</p>
          </div>`).join('')}
        <div class="newsletter-section" style="margin-top:32px">
          <h2>Still need help?</h2>
          <p>Our support team is available 24/7</p>
          <button class="hero-btn" style="background:var(--primary)" onclick="navigateTo('contact')">Contact Support</button>
        </div>
      </div>
    </div></div>${footerHTML()}`;
  updateBadges();
}
function toggleFaq(i) {
  const el = $('#faq-' + i);
  const icon = $('#faq-icon-' + i);
  const open = el.style.display === 'block';
  el.style.display = open ? 'none' : 'block';
  icon.style.transform = open ? 'rotate(0)' : 'rotate(180deg)';
}

console.log('Gadgets BD app.js part 6 (dashboard/static) loaded');

// ============================================================
// AUTHENTICATION (Firebase Auth + local fallback)
// ============================================================
function openAuthModal() {
  if (State.user) { navigateTo('dashboard'); return; }
  $('#authModal').classList.add('active');
}
function closeAuthModal() { $('#authModal').classList.remove('active'); }
function switchAuthTab(tab) {
  $$('.auth-tab').forEach(t => t.classList.remove('active'));
  $$('.auth-form').forEach(f => f.classList.remove('active'));
  if (tab === 'login') { $$('.auth-tab')[0].classList.add('active'); $('#loginForm').classList.add('active'); }
  else if (tab === 'register') { $$('.auth-tab')[1].classList.add('active'); $('#registerForm').classList.add('active'); }
  else if (tab === 'forgot') { $('#forgotForm').classList.add('active'); }
}
function showForgotPassword() { $$('.auth-form').forEach(f => f.classList.remove('active')); $('#forgotForm').classList.add('active'); }

async function handleLogin() {
  const email = $('#loginEmail').value.trim();
  const password = $('#loginPassword').value;
  if (!email || !password) { toast('Please enter email and password', 'error'); return; }

  if (firebaseInitialized && auth) {
    try {
      const cred = await auth.signInWithEmailAndPassword(email, password);
      let profile = { uid: cred.user.uid, email: cred.user.email, name: cred.user.displayName || email.split('@')[0] };
      try { const doc = await db.collection('users').doc(cred.user.uid).get(); if (doc.exists) profile = { ...profile, ...doc.data() }; } catch (e) {}
      setUser(profile);
    } catch (e) { toast(e.message || 'Login failed', 'error'); return; }
  } else {
    // Local mode
    const users = JSON.parse(localStorage.getItem('gbd_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) { toast('Invalid credentials. Register first or use Firebase.', 'error'); return; }
    setUser({ uid: found.uid, email: found.email, name: found.name, phone: found.phone });
  }
  closeAuthModal();
  toast('Welcome back! 🎉', 'success');
  navigateTo('dashboard');
}

async function handleRegister() {
  const name = $('#regName').value.trim();
  const email = $('#regEmail').value.trim();
  const phone = $('#regPhone').value.trim();
  const password = $('#regPassword').value;
  if (!name || !email || !password) { toast('Please fill all fields', 'error'); return; }
  if (password.length < 6) { toast('Password must be at least 6 characters', 'error'); return; }

  if (firebaseInitialized && auth) {
    try {
      const cred = await auth.createUserWithEmailAndPassword(email, password);
      await cred.user.updateProfile({ displayName: name });
      const profile = { uid: cred.user.uid, email, name, phone };
      try { await db.collection('users').doc(cred.user.uid).set({ ...profile, createdAt: new Date().toISOString() }); } catch (e) {}
      try { await cred.user.sendEmailVerification(); } catch (e) {}
      setUser(profile);
      toast('Account created! Verification email sent.', 'success');
    } catch (e) { toast(e.message || 'Registration failed', 'error'); return; }
  } else {
    const users = JSON.parse(localStorage.getItem('gbd_users') || '[]');
    if (users.find(u => u.email === email)) { toast('Email already registered', 'error'); return; }
    const newUser = { uid: uid(), name, email, phone, password };
    users.push(newUser);
    localStorage.setItem('gbd_users', JSON.stringify(users));
    setUser({ uid: newUser.uid, email, name, phone });
    toast('Account created successfully! 🎉', 'success');
  }
  closeAuthModal();
  navigateTo('dashboard');
}

async function handleGoogleLogin() {
  if (firebaseInitialized && auth) {
    try {
      const provider = new firebase.auth.GoogleAuthProvider();
      const result = await auth.signInWithPopup(provider);
      const profile = { uid: result.user.uid, email: result.user.email, name: result.user.displayName, photo: result.user.photoURL };
      try { await db.collection('users').doc(result.user.uid).set({ ...profile, createdAt: new Date().toISOString() }, { merge: true }); } catch (e) {}
      setUser(profile);
      closeAuthModal();
      toast('Signed in with Google! 🎉', 'success');
      navigateTo('dashboard');
    } catch (e) { toast(e.message || 'Google sign-in failed', 'error'); }
  } else {
    // Local demo mode
    setUser({ uid: uid(), email: 'demo@google.com', name: 'Demo User' });
    closeAuthModal();
    toast('Signed in (demo mode)', 'success');
    navigateTo('dashboard');
  }
}

async function handleResetPassword() {
  const email = $('#resetEmail').value.trim();
  if (!email) { toast('Please enter your email', 'error'); return; }
  if (firebaseInitialized && auth) {
    try { await auth.sendPasswordResetEmail(email); toast('Password reset link sent!', 'success'); }
    catch (e) { toast(e.message || 'Failed to send reset link', 'error'); return; }
  } else { toast('Password reset link sent! (demo mode)', 'success'); }
  switchAuthTab('login');
}

function setUser(profile) {
  State.user = profile;
  saveState();
  const btn = $('#accountBtn');
  if (btn) btn.innerHTML = `<i class="fas fa-user-check"></i>`;
}

function handleLogout() {
  if (firebaseInitialized && auth) auth.signOut().catch(() => {});
  State.user = null;
  saveState();
  const btn = $('#accountBtn');
  if (btn) btn.innerHTML = `<i class="fas fa-user"></i>`;
  toast('Logged out successfully', 'info');
  navigateTo('home');
}

// ============================================================
// SEARCH (live search with suggestions)
// ============================================================
function handleSearch(event) {
  const query = event.target.value.trim().toLowerCase();
  const box = $('#searchSuggestions');
  if (!box) return;
  if (query.length < 1) { box.classList.remove('active'); return; }

  const matches = State.products.filter(p =>
    `${p.name} ${p.brandName} ${p.categoryName} ${(p.tags || []).join(' ')}`.toLowerCase().includes(query)
  ).slice(0, 6);

  const popular = ['MacBook', 'Gaming Laptop', 'iPhone', 'Monitor', 'SSD'];
  box.innerHTML = matches.length ? matches.map(p => `
    <div class="suggestion-item" onclick="selectSuggestion('${p.id}')">
      <img src="${p.images[0]}" alt="">
      <div style="flex:1"><div class="s-name">${p.name}</div><div class="s-price">${fmtPrice(p.discountPrice)}</div></div>
    </div>`).join('') + `<div class="suggestion-item" style="justify-content:center;color:var(--accent);font-weight:600" onclick="performSearch()">View all results for "${query}"</div>`
    : `<div style="padding:16px"><div style="font-size:0.8rem;color:var(--text-light);margin-bottom:8px">No results. Popular searches:</div>${popular.map(s => `<span onclick="quickSearch('${s}')" style="display:inline-block;padding:4px 12px;margin:4px 4px 0 0;background:var(--bg-alt);border-radius:20px;font-size:0.8rem;cursor:pointer">${s}</span>`).join('')}</div>`;
  box.classList.add('active');
}
function showSuggestions() {
  const input = $('#searchInput');
  if (input && input.value.trim()) $('#searchSuggestions').classList.add('active');
}
function selectSuggestion(id) { $('#searchSuggestions').classList.remove('active'); $('#searchInput').value = ''; navigateTo('product?id=' + id); }
function quickSearch(term) { $('#searchInput').value = term; performSearch(); }
function performSearch() {
  const query = $('#searchInput').value.trim();
  if (!query) return;
  if (!State.searchHistory.includes(query)) { State.searchHistory.unshift(query); State.searchHistory = State.searchHistory.slice(0, 10); localStorage.setItem('gbd_search_history', JSON.stringify(State.searchHistory)); }
  $('#searchSuggestions').classList.remove('active');
  navigateTo('products?search=' + encodeURIComponent(query));
}
// Close suggestions on outside click
document.addEventListener('click', (e) => {
  if (!e.target.closest('.search-bar')) $('#searchSuggestions')?.classList.remove('active');
});

// ============================================================
// FOOTER
// ============================================================
function footerHTML() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3><i class="fas fa-bolt" style="color:var(--accent)"></i> Gadgets BD</h3>
            <p>Bangladesh's premium destination for authentic electronics. Genuine products, competitive prices, and fast nationwide delivery.</p>
            <div class="footer-social">
              <a href="#" onclick="return false"><i class="fab fa-facebook-f"></i></a>
              <a href="#" onclick="return false"><i class="fab fa-instagram"></i></a>
              <a href="#" onclick="return false"><i class="fab fa-youtube"></i></a>
              <a href="#" onclick="return false"><i class="fab fa-whatsapp"></i></a>
            </div>
          </div>
          <div class="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><a onclick="navigateTo('products?category=laptop')">Laptops</a></li>
              <li><a onclick="navigateTo('products?category=gaming')">Gaming</a></li>
              <li><a onclick="navigateTo('products?category=monitor')">Monitors</a></li>
              <li><a onclick="navigateTo('products?category=accessories')">Accessories</a></li>
              <li><a onclick="navigateTo('deals')">Deals</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Account</h4>
            <ul>
              <li><a onclick="openAuthModal()">Login</a></li>
              <li><a onclick="navigateTo('dashboard')">My Account</a></li>
              <li><a onclick="navigateTo('wishlist')">Wishlist</a></li>
              <li><a onclick="navigateTo('track-order')">Track Order</a></li>
              <li><a onclick="navigateTo('cart')">Cart</a></li>
            </ul>
          </div>
          <div class="footer-col">
            <h4>Company</h4>
            <ul>
              <li><a onclick="navigateTo('about')">About Us</a></li>
              <li><a onclick="navigateTo('contact')">Contact</a></li>
              <li><a onclick="navigateTo('support')">Support</a></li>
              <li><a onclick="navigateTo('support')">FAQ</a></li>
              <li><a href="#" onclick="return false">Privacy Policy</a></li>
            </ul>
          </div>
          <div class="footer-col footer-contact">
            <h4>Contact</h4>
            <p><i class="fas fa-map-marker-alt"></i> Gulshan-1, Dhaka 1212</p>
            <p><i class="fas fa-phone"></i> +880 1700-000000</p>
            <p><i class="fas fa-envelope"></i> support@gadgetsbd.com</p>
            <p><i class="fas fa-clock"></i> Sat-Thu: 9AM - 9PM</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 Gadgets BD. All rights reserved. Premium Electronics Marketplace.</p>
          <div class="footer-payment">
            <span>💵 COD</span><span>bKash</span><span>Nagad</span><span>Rocket</span><span>Visa</span><span>MasterCard</span><span>SSLCommerz</span>
          </div>
        </div>
      </div>
    </footer>`;
}

console.log('Gadgets BD app.js part 7 (auth/search/footer) loaded');


// ============================================================
// FIREBASE UTILITY FUNCTIONS
// ============================================================
// (createAdminUser removed - admin setup done via Firebase Console)

// Setup admin account (called from settings page)
// (setupAdminAccount removed - admin setup done via Firebase Console)
// (resyncDataToFirebase removed - no dummy data to sync)

// ============================================================
// ADMIN PANEL (accessed only via #admin)
// ============================================================
const AdminState = { authenticated: false, section: 'dashboard', adminName: localStorage.getItem('gbd_admin_name') || 'admin' };

function renderAdmin() {
  // Hide public header/nav while in admin
  const header = document.getElementById('header');
  const navBar = document.getElementById('navBar');
  if (header) header.style.display = 'none';
  if (navBar) navBar.style.display = 'none';

  if (!AdminState.authenticated) {
    renderAdminLogin();
    return;
  }
  renderAdminDashboard();
}

function restorePublicUI() {
  const header = document.getElementById('header');
  const navBar = document.getElementById('navBar');
  if (header) header.style.display = '';
  if (navBar) navBar.style.display = '';
}

// ---------- ADMIN LOGIN ----------
function renderAdminLogin() {
  document.getElementById('appContent').innerHTML = `
    <div class="admin-login">
      <div class="admin-login-box">
        <div class="logo" style="justify-content:center;margin-bottom:16px">
          <div class="logo-icon"><i class="fas fa-bolt"></i></div>
          <span class="logo-text">Gadgets<span>BD</span></span>
        </div>
        <h2>Admin Panel</h2>
        <p>Authorized personnel only</p>
        <div class="form-field" style="margin-bottom:16px">
          <input type="text" id="adminUsername" placeholder="Username" style="width:100%;padding:14px 16px;border-radius:10px;border:1px solid var(--border);background:var(--bg-alt);color:var(--text)" onkeydown="if(event.key==='Enter')document.getElementById('adminPassword').focus()">
        </div>
        <div class="form-field" style="margin-bottom:16px">
          <input type="password" id="adminPassword" placeholder="Password" style="width:100%;padding:14px 16px;border-radius:10px;border:1px solid var(--border);background:var(--bg-alt);color:var(--text)" onkeydown="if(event.key==='Enter')handleAdminLogin()">
        </div>
        <button class="btn-auth" onclick="handleAdminLogin()">Login to Dashboard</button>
        <button class="btn-cart" style="width:100%;margin-top:12px;padding:12px" onclick="restorePublicUI(); navigateTo('home')">&larr; Back to Store</button>
      </div>
    </div>`;
}

function handleAdminLogin() {
  const username = document.getElementById('adminUsername').value.trim();
  const password = document.getElementById('adminPassword').value;
  if (!username || !password) { toast('Please enter username and password', 'error'); return; }

  // Admin login - hardcoded credentials in script (NOT Firebase Auth)
  const inputEmail = username.includes('@') ? username : username + '@gadgetsbd.com';
  const savedPassword = localStorage.getItem('gbd_admin_password') || ADMIN_PASSWORD;

  if (inputEmail === ADMIN_EMAIL && password === savedPassword) {
    AdminState.authenticated = true;
    AdminState.adminName = localStorage.getItem('gbd_admin_name') || 'Admin';
    toast('Welcome, ' + AdminState.adminName, 'success');
    renderAdminDashboard();
  } else {
    toast('Invalid admin credentials', 'error');
  }
}

function adminLogout() {
  AdminState.authenticated = false;
  AdminState.section = 'dashboard';
  restorePublicUI();
  navigateTo('home');
}

// ---------- ADMIN DASHBOARD LAYOUT ----------
function renderAdminDashboard() {
  const menu = [
    ['dashboard',  'fa-th-large',     'Dashboard'],
    ['products',   'fa-box',          'Products'],
    ['categories', 'fa-layer-group',  'Categories'],
    ['brands',     'fa-tag',          'Brands'],
    ['orders',     'fa-shopping-bag', 'Orders'],
    ['customers',  'fa-users',        'Customers'],
    ['reviews',    'fa-star',         'Reviews'],
    ['banners',    'fa-image',        'Banners'],
    ['inventory',  'fa-warehouse',    'Inventory'],
    ['admin-profile', 'fa-user-cog',  'Admin Profile'],
    ['settings',   'fa-cog',          'Settings'],
  ];

  document.getElementById('appContent').innerHTML = `
    <div class="admin-layout">
      <div class="admin-sidebar-overlay" id="adminSidebarOverlay" onclick="toggleAdminSidebar()"></div>
      <aside class="admin-sidebar" id="adminSidebar">
        <div class="admin-logo"><i class="fas fa-bolt"></i> GadgetsBD Admin</div>
        <div style="padding:8px 16px;margin-bottom:16px;font-size:0.8rem;color:rgba(255,255,255,0.5);border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px">
          <i class="fas fa-user-shield"></i> ${AdminState.adminName || 'admin'}
        </div>
        ${menu.map(function(m) {
          return '<div class="admin-nav-item ' + (AdminState.section === m[0] ? 'active' : '') + '" data-section="' + m[0] + '" onclick="adminNavigate(\'' + m[0] + '\', this)"><i class="fas ' + m[1] + '"></i> ' + m[2] + '</div>';
        }).join('')}
        <div style="margin-top:24px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.1)">
          <div class="admin-nav-item" onclick="restorePublicUI(); navigateTo('home')" style="color:#22C55E"><i class="fas fa-store"></i> View Store</div>
          <div class="admin-nav-item" onclick="adminLogout()" style="color:#EF4444"><i class="fas fa-sign-out-alt"></i> Logout</div>
        </div>
      </aside>
      <main class="admin-content">
        <div class="admin-topbar">
          <div class="admin-topbar-left">
            <div style="display:flex;align-items:center;gap:12px">
              <button class="admin-mobile-toggle" onclick="toggleAdminSidebar()"><i class="fas fa-bars"></i></button>
              <h2 id="adminSectionTitle">Dashboard Overview</h2>
            </div>
            <span style="color:var(--text-light);font-size:0.8rem" id="adminDateText">${new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'short', day:'numeric' })}</span>
          </div>
          <div class="admin-topbar-right">
            <button class="admin-btn admin-btn-primary" onclick="restorePublicUI(); navigateTo('home')"><i class="fas fa-store"></i> View Store</button>
            <button class="admin-btn admin-btn-danger" onclick="adminLogout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
          </div>
        </div>
        <div id="adminSectionContent"></div>
      </main>
    </div>`;

  adminRenderSection();
}

function toggleAdminSidebar() {
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('adminSidebarOverlay');
  if (sidebar) sidebar.classList.toggle('open');
  if (overlay) overlay.classList.toggle('active');
}

function adminNavigate(section, el) {
  AdminState.section = section;
  // Update active states
  document.querySelectorAll('.admin-nav-item').forEach(function(n) { n.classList.remove('active'); });
  if (el) el.classList.add('active');
  // Close sidebar on mobile after navigation
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('adminSidebarOverlay');
  if (sidebar) sidebar.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  adminRenderSection();
}

function adminRenderSection() {
  const c = document.getElementById('adminSectionContent');
  if (!c) return;

  // Update top bar title
  const titles = {
    dashboard: 'Dashboard Overview', products: 'Product Management',
    categories: 'Category Management', brands: 'Brand Management',
    orders: 'Order Management', customers: 'Customer Management',
    reviews: 'Review Management', banners: 'Banner Management',
    inventory: 'Inventory Management',
    'admin-profile': 'Admin Profile & Security',
    settings: 'Store Settings',
  };
  const titleEl = document.getElementById('adminSectionTitle');
  if (titleEl) titleEl.textContent = titles[AdminState.section] || 'Admin';

  switch (AdminState.section) {
    case 'dashboard':  adminDashboardView(c); break;
    case 'products':   adminProductsView(c); break;
    case 'categories': adminCategoriesView(c); break;
    case 'brands':     adminBrandsView(c); break;
    case 'orders':     adminOrdersView(c); break;
    case 'customers':  adminCustomersView(c); break;
    case 'reviews':    adminReviewsView(c); break;
    case 'banners':    adminBannersView(c); break;
    case 'inventory':  adminInventoryView(c); break;
    case 'admin-profile': adminProfileView(c); break;
    case 'settings':   adminSettingsView(c); break;
  }
}

// ---------- ADMIN: DASHBOARD ----------
function adminDashboardView(c) {
  const totalRevenue = State.orders.reduce(function(s, o) { return s + o.total; }, 0);
  const lowStock = State.products.filter(function(p) { return p.stock < 15; }).length;
  const pendingOrders = State.orders.filter(function(o) { return o.status === 'pending'; }).length;

  c.innerHTML = `
    <div class="admin-cards">
      <div class="admin-card">
        <div class="admin-card-icon" style="background:var(--gradient)"><i class="fas fa-box"></i></div>
        <div class="admin-card-value">${State.products.length}</div>
        <div class="admin-card-label">Total Products</div>
      </div>
      <div class="admin-card">
        <div class="admin-card-icon" style="background:linear-gradient(135deg,#22C55E,#16A34A)"><i class="fas fa-shopping-bag"></i></div>
        <div class="admin-card-value">${State.orders.length}</div>
        <div class="admin-card-label">Total Orders</div>
      </div>
      <div class="admin-card">
        <div class="admin-card-icon" style="background:linear-gradient(135deg,#F59E0B,#D97706)"><i class="fas fa-wallet"></i></div>
        <div class="admin-card-value">${fmtPrice(totalRevenue)}</div>
        <div class="admin-card-label">Total Revenue</div>
      </div>
      <div class="admin-card">
        <div class="admin-card-icon" style="background:linear-gradient(135deg,#EF4444,#DC2626)"><i class="fas fa-exclamation-triangle"></i></div>
        <div class="admin-card-value">${lowStock}</div>
        <div class="admin-card-label">Low Stock Alerts</div>
      </div>
    </div>
    <div class="admin-dashboard-grid">
      <div class="admin-panel">
        <div class="admin-section-header">
          <h3><i class="fas fa-clock" style="color:var(--accent)"></i> Recent Orders</h3>
        </div>
        <div class="admin-table-wrapper">
          <table class="admin-table">
            <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th></tr>
            ${State.orders.slice(-5).reverse().map(function(o) {
              return '<tr><td><strong>#' + o.id + '</strong></td><td>' + (o.customer ? o.customer.name : 'Guest') + '</td><td>' + fmtPrice(o.total) + '</td><td><span class="order-status status-' + o.status + '">' + o.status + '</span></td></tr>';
            }).join('') || '<tr><td colspan="4" style="text-align:center;color:var(--text-light);padding:24px">No orders yet</td></tr>'}
          </table>
        </div>
      </div>
      <div class="admin-panel">
        <div class="admin-section-header">
          <h3><i class="fas fa-bolt" style="color:var(--warning)"></i> Quick Actions</h3>
        </div>
        <div class="admin-quick-actions">
          <button class="admin-quick-action-btn" style="background:var(--accent)" onclick="adminNavigate('products', document.querySelector('[data-section=products]'))"><i class="fas fa-plus-circle"></i> Add New Product</button>
          <button class="admin-quick-action-btn" style="background:linear-gradient(135deg,#22C55E,#16A34A)" onclick="adminNavigate('orders', document.querySelector('[data-section=orders]'))"><i class="fas fa-list"></i> View All Orders (${State.orders.length})</button>
          <button class="admin-quick-action-btn" style="background:linear-gradient(135deg,#F59E0B,#D97706)" onclick="adminNavigate('inventory', document.querySelector('[data-section=inventory]'))"><i class="fas fa-warehouse"></i> Check Inventory (${lowStock} low stock)</button>

        </div>
      </div>
    </div>`;
}

// ---------- ADMIN: PRODUCTS ----------
function adminProductsView(c) {
  c.innerHTML = `
    <div class="admin-panel">
      <div class="admin-toolbar">
        <div class="admin-toolbar-left">
          <input type="text" class="admin-search-input" id="adminProductSearch" placeholder="Search products..." oninput="filterAdminProducts()">
        </div>
        <div class="admin-toolbar-right">
          <button class="admin-btn admin-btn-primary" onclick="openProductForm()"><i class="fas fa-plus"></i> Add Product</button>
        </div>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table" id="adminProductsTable">
          <tr><th>Image</th><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Flags</th><th style="text-align:right">Actions</th></tr>
          ${State.products.map(function(p) {
            var pct = discountPct(p.price, p.discountPrice);
            var flags = '';
            if (p.featured) flags += '<span class="badge badge-trending" style="font-size:0.6rem">Featured</span> ';
            if (p.flashSale) flags += '<span class="badge badge-flash" style="font-size:0.6rem">Flash</span> ';
            if (p.newArrival) flags += '<span class="badge badge-new" style="font-size:0.6rem">New</span> ';
            return '<tr data-name="' + p.name.toLowerCase() + '"><td><img src="' + p.images[0] + '" onerror="this.src=\'https://via.placeholder.com/40\'"></td><td>' + p.name + '</td><td>' + p.categoryName + '</td><td>' + fmtPrice(p.discountPrice) + (pct > 0 ? '<br><span style="font-size:0.7rem;color:var(--text-light);text-decoration:line-through">' + fmtPrice(p.price) + '</span>' : '') + '</td><td><span style="color:' + (p.stock < 15 ? 'var(--danger)' : 'var(--success)') + ';font-weight:600">' + p.stock + '</span></td><td>' + flags + '</td><td><div class="admin-table-actions"><button class="admin-btn admin-btn-edit admin-btn-icon" onclick="openProductForm(\'' + p.id + '\')" title="Edit"><i class="fas fa-edit"></i></button><button class="admin-btn admin-btn-primary admin-btn-icon" onclick="duplicateProduct(\'' + p.id + '\')" title="Duplicate"><i class="fas fa-copy"></i></button><button class="admin-btn admin-btn-danger admin-btn-icon" onclick="deleteProduct(\'' + p.id + '\')" title="Delete"><i class="fas fa-trash"></i></button></div></td></tr>';
          }).join('')}
        </table>
      </div>
    </div>`;
}

function filterAdminProducts() {
  const q = (document.getElementById('adminProductSearch').value || '').toLowerCase();
  document.querySelectorAll('#adminProductsTable tr[data-name]').forEach(function(row) {
    row.style.display = row.dataset.name.indexOf(q) >= 0 ? '' : 'none';
  });
}

// ---------- IMAGE UPLOAD (Drag & Drop + base64 for Firestore) ----------
// Images are stored as base64 data URLs. We use a separate array variable
// instead of comma-separated text, because base64 strings contain commas
// which would break comma-splitting.
var _pfUploadedImages = [];

function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.style.borderColor = 'var(--accent)';
  e.currentTarget.style.background = 'var(--bg-alt)';
}
function handleDragLeave(e) {
  e.preventDefault();
  e.currentTarget.style.borderColor = 'var(--border)';
  e.currentTarget.style.background = 'transparent';
}
function handleImageDrop(e) {
  e.preventDefault();
  e.currentTarget.style.borderColor = 'var(--border)';
  e.currentTarget.style.background = 'transparent';
  var files = e.dataTransfer.files;
  if (files && files.length > 0) processImageFiles(files);
}
function handleFileSelect(e) {
  var files = e.target.files;
  if (files && files.length > 0) processImageFiles(files);
}

async function processImageFiles(files) {
  var progressDiv = document.getElementById('pf-upload-progress');
  var progressBar = document.getElementById('pf-progress-bar');
  progressDiv.style.display = 'block';

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    if (!file.type.startsWith('image/')) { toast(file.name + ' is not an image', 'warning'); continue; }
    if (file.size > 10 * 1024 * 1024) { toast(file.name + ' exceeds 10MB', 'warning'); continue; }

    var pct = Math.round(((i) / files.length) * 100);
    progressBar.style.width = pct + '%';

    try {
      // Compress image to base64 data URL for Firestore storage
      // Firestore supports up to 1MB per field, so we compress to ~800KB max
      var url = await compressImageToBase64(file, 800, 800, 0.7);
      // Add to our images array (NOT to a comma-separated text field)
      _pfUploadedImages.push(url);
      updateImagePreview();
    } catch (err) {
      toast('Upload failed: ' + err.message, 'error');
    }
  }
  progressBar.style.width = '100%';
  setTimeout(function() { progressDiv.style.display = 'none'; progressBar.style.width = '0%'; }, 1000);
  toast(files.length + ' image(s) uploaded', 'success');
}

// Compress image file to base64 data URL with max dimensions and quality
function compressImageToBase64(file, maxWidth, maxHeight, quality) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function(e) {
      var img = new Image();
      img.onload = function() {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var w = img.width, h = img.height;
        // Scale down if too large
        if (w > maxWidth || h > maxHeight) {
          var ratio = Math.min(maxWidth / w, maxHeight / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        ctx.drawImage(img, 0, 0, w, h);
        // Try with given quality, reduce if too large for Firestore
        var dataUrl = canvas.toDataURL('image/jpeg', quality);
        // Firestore limit is ~1MB per field. If too large, reduce quality
        while (dataUrl.length > 900000 && quality > 0.1) {
          quality -= 0.1;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        resolve(dataUrl);
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function fileToDataURL(file) {
  return new Promise(function(resolve, reject) {
    var reader = new FileReader();
    reader.onload = function() { resolve(reader.result); };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// Get all images: combine uploaded base64 images + URL text field images
// URL text field is for pasting external image URLs (comma-separated)
// _pfUploadedImages is for drag/drop uploaded base64 images
function getAllProductImages() {
  var images = [];
  // First, add uploaded base64 images
  _pfUploadedImages.forEach(function(url) {
    if (url && url.trim()) images.push(url.trim());
  });
  // Then, add URL text field images (these are external URLs, safe to split by comma)
  var urlField = document.getElementById('pf-images');
  if (urlField && urlField.value.trim()) {
    var raw = urlField.value.trim();
    if (raw.startsWith('data:')) {
      // It's a base64 string - add as single image
      images.push(raw);
    } else {
      // Split by comma for multiple URLs (external URLs don't contain commas)
      raw.split(',').forEach(function(s) {
        var trimmed = s.trim();
        if (trimmed && !trimmed.startsWith('data:')) images.push(trimmed);
      });
    }
  }
  // Remove duplicates
  var unique = [];
  var seen = {};
  images.forEach(function(url) {
    if (!seen[url]) { seen[url] = true; unique.push(url); }
  });
  return unique;
}

function updateImagePreview() {
  var preview = document.getElementById('pf-image-preview');
  if (!preview) return;
  var images = getAllProductImages();
  preview.innerHTML = images.map(function(url, i) {
    return '<div style="position:relative;width:64px;height:64px;border-radius:8px;overflow:hidden;border:1px solid var(--border)">' +
      '<img src="' + url + '" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'">' +
      '<button type="button" onclick="removeImage(' + i + ')" style="position:absolute;top:0;right:0;background:var(--danger);color:white;border:none;border-radius:0 8px 0 4px;cursor:pointer;padding:2px 6px;font-size:0.7rem"><i class="fas fa-times"></i></button>' +
      '</div>';
  }).join('');
}

function removeImage(index) {
  var images = getAllProductImages();
  images.splice(index, 1);
  // Rebuild: put base64 images back in _pfUploadedImages, URLs back in text field
  _pfUploadedImages = images.filter(function(url) { return url.startsWith('data:'); });
  var urlImages = images.filter(function(url) { return !url.startsWith('data:'); });
  var urlField = document.getElementById('pf-images');
  if (urlField) urlField.value = urlImages.join(', ');
  updateImagePreview();
}

function openProductForm(id) {
  const p = id ? State.products.find(function(pr) { return pr.id === id; }) : null;
  const c = document.getElementById('adminSectionContent') || document.getElementById('adminContent');
  c.innerHTML = `
    <div class="admin-form-header">
      <h2>${p ? 'Edit' : 'Add'} Product</h2>
      <button class="admin-btn admin-btn-primary" onclick="AdminState.section='products'; adminRenderSection()"><i class="fas fa-arrow-left"></i> Back to Products</button>
    </div>
    <div class="admin-form-card">
      <div class="admin-form">
        <div class="form-grid">
          <div class="form-field"><label>Product Name *</label><input type="text" id="pf-name" value="${p ? p.name : ''}"></div>
          <div class="form-field"><label>SKU</label><input type="text" id="pf-sku" value="${p ? (p.sku || '') : ''}"></div>
        </div>
        <div class="form-grid">
          <div class="form-field"><label>Category *</label><select id="pf-category">${State.categories.map(function(cat) { return '<option value="' + cat.id + '"' + (p && p.category === cat.id ? ' selected' : '') + '>' + cat.name + '</option>'; }).join('')}</select></div>
          <div class="form-field"><label>Brand *</label><select id="pf-brand">${State.brands.map(function(b) { return '<option value="' + b.id + '"' + (p && p.brand === b.id ? ' selected' : '') + '>' + b.name + '</option>'; }).join('')}</select></div>
        </div>
        <div class="form-grid">
          <div class="form-field"><label>Regular Price (\u09f3) *</label><input type="number" id="pf-price" value="${p ? p.price : ''}"></div>
          <div class="form-field"><label>Discount Price (\u09f3)</label><input type="number" id="pf-discount" value="${p ? p.discountPrice : ''}"></div>
        </div>
        <div class="form-grid">
          <div class="form-field"><label>Stock *</label><input type="number" id="pf-stock" value="${p ? p.stock : ''}"></div>
          <div class="form-field"><label>Warranty</label><input type="text" id="pf-warranty" value="${p ? (p.warranty || '') : ''}"></div>
        </div>
        <div class="form-field">
          <label>Product Images *</label>
          <div id="pf-image-preview" style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:8px"></div>
          <div id="pf-drop-zone" style="border:2px dashed var(--border);border-radius:var(--radius-sm);padding:24px;text-align:center;cursor:pointer;transition:all 0.3s;margin-bottom:8px" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" ondrop="handleImageDrop(event)" onclick="document.getElementById('pf-file-input').click()">
            <i class="fas fa-cloud-upload-alt" style="font-size:2rem;color:var(--text-light);margin-bottom:8px"></i>
            <p style="color:var(--text-light);margin:0">Drag & drop images here, or click to select</p>
            <p style="font-size:0.75rem;color:var(--text-light);margin-top:4px">PNG, JPG, WEBP up to 5MB each</p>
          </div>
          <input type="file" id="pf-file-input" accept="image/*" multiple style="display:none" onchange="handleFileSelect(event)">
          <input type="text" id="pf-images" value="${p ? p.images.join(', ') : ''}" placeholder="Or paste image URLs (comma separated)">
          <div id="pf-upload-progress" style="display:none;margin-top:8px">
            <div style="background:var(--bg-alt);border-radius:8px;height:6px;overflow:hidden">
              <div id="pf-progress-bar" style="background:var(--accent);height:100%;width:0%;transition:width 0.3s"></div>
            </div>
            <p style="font-size:0.75rem;color:var(--text-light);margin-top:4px">Uploading...</p>
          </div>
        </div>
        <div class="form-field"><label>Description</label><textarea id="pf-desc" rows="3">${p ? (p.description || '') : ''}</textarea></div>
        <div class="form-field"><label>Specifications (key: value, one per line)</label><textarea id="pf-specs" rows="4">${p ? Object.entries(p.specs).map(function(e) { return e[0] + ': ' + e[1]; }).join('\\n') : ''}</textarea></div>
        <div class="admin-checkbox-group">
          <label class="filter-option"><input type="checkbox" id="pf-featured" ${p && p.featured ? 'checked' : ''}> Featured</label>
          <label class="filter-option"><input type="checkbox" id="pf-trending" ${p && p.trending ? 'checked' : ''}> Trending</label>
          <label class="filter-option"><input type="checkbox" id="pf-flash" ${p && p.flashSale ? 'checked' : ''}> Flash Sale</label>
          <label class="filter-option"><input type="checkbox" id="pf-new" ${p && p.newArrival ? 'checked' : ''}> New Arrival</label>
        </div>
        <button class="btn-auth" onclick="saveProduct('${id || ''}')">${p ? 'Update' : 'Create'} Product</button>
      </div>
    </div>`;
  _pfUploadedImages = [];
  // When editing, load existing images properly
  if (p && p.images && p.images.length > 0) {
    // Separate base64 images from URL images
    _pfUploadedImages = p.images.filter(function(url) { return url && url.startsWith('data:'); });
    var urlImages = p.images.filter(function(url) { return url && !url.startsWith('data:'); });
    var urlField = document.getElementById('pf-images');
    if (urlField) urlField.value = urlImages.join(', ');
  }
  setTimeout(updateImagePreview, 50);
}

async function saveProduct(id) {
  const name = document.getElementById('pf-name').value.trim();
  const price = Number(document.getElementById('pf-price').value);
  const discountPrice = Number(document.getElementById('pf-discount').value) || price;
  const stock = Number(document.getElementById('pf-stock').value);
  if (!name || !price) { toast('Name and price are required', 'error'); return; }

  const catId = document.getElementById('pf-category').value;
  const brandId = document.getElementById('pf-brand').value;
  const specs = {};
  document.getElementById('pf-specs').value.split('\n').forEach(function(line) {
    const parts = line.split(':');
    if (parts.length >= 2) specs[parts[0].trim()] = parts.slice(1).join(':').trim();
  });

  // Generate a unique ID for new products
  // Use the provided ID for edits, generate a new one for new products
  var productId = id || ('prod_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8));

  const product = {
    id: productId,
    name: name,
    sku: document.getElementById('pf-sku').value.trim(),
    category: catId,
    categoryName: (State.categories.find(function(c) { return c.id === catId; }) || {}).name || '',
    brand: brandId,
    brandName: (State.brands.find(function(b) { return b.id === brandId; }) || {}).name || '',
    price: price,
    discountPrice: discountPrice,
    stock: stock,
    images: getAllProductImages(),
    description: document.getElementById('pf-desc').value.trim(),
    specs: specs,
    warranty: document.getElementById('pf-warranty').value.trim(),
    emi: 'Available',
    rating: id ? ((State.products.find(function(p) { return p.id === id; }) || {}).rating || 4.5) : 4.5,
    reviewCount: id ? ((State.products.find(function(p) { return p.id === id; }) || {}).reviewCount || 0) : 0,
    featured: document.getElementById('pf-featured').checked,
    trending: document.getElementById('pf-trending').checked,
    flashSale: document.getElementById('pf-flash').checked,
    newArrival: document.getElementById('pf-new').checked,
    tags: [name.toLowerCase(), brandId, catId],
    createdAt: id ? ((State.products.find(function(p) { return p.id === id; }) || {}).createdAt || new Date().toISOString()) : new Date().toISOString(),
  };

  if (firebaseInitialized && db) {
    // Save to Firestore — onSnapshot listener will automatically update State.products
    // No need to manually push to State.products (that caused the duplicate bug)
    try {
      await db.collection('products').doc(product.id).set(product);
      toast('Product saved & synced to store!', 'success');
    }
    catch (e) { toast('Firebase error: ' + e.message, 'error'); return; }
  } else {
    // Local mode — manually update state
    const idx = State.products.findIndex(function(p) { return p.id === product.id; });
    if (idx >= 0) State.products[idx] = product; else State.products.push(product);
    toast('Product saved (local mode)', 'success');
  }
  AdminState.section = 'products';
  adminRenderSection();
}

async function deleteProduct(id) {
  if (!confirm('Delete this product? This cannot be undone.')) return;
  if (firebaseInitialized && db) {
    try { await db.collection('products').doc(id).delete(); } catch (e) { toast('Error: ' + e.message, 'error'); return; }
  } else {
    State.products = State.products.filter(function(p) { return p.id !== id; });
  }
  toast('Product deleted', 'info');
  adminRenderSection();
}

async function duplicateProduct(id) {
  const p = State.products.find(function(pr) { return pr.id === id; });
  if (!p) return;
  var newId = 'prod_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const copy = Object.assign({}, p, { id: newId, name: p.name + ' (Copy)', sku: (p.sku || '') + '-COPY', createdAt: new Date().toISOString() });
  if (firebaseInitialized && db) {
    // Only save to Firestore — onSnapshot will update state automatically
    try { await db.collection('products').doc(newId).set(copy); } catch (e) { toast('Error: ' + e.message, 'error'); return; }
  } else {
    State.products.push(copy);
  }
  toast('Product duplicated', 'success');
  adminRenderSection();
}

// ---------- ADMIN: CATEGORIES ----------
function adminCategoriesView(c) {
  c.innerHTML = `
    <div class="admin-panel">
      <div class="admin-toolbar">
        <div class="admin-toolbar-left">
          <span class="admin-section-meta">${State.categories.length} categories</span>
        </div>
        <div class="admin-toolbar-right">
          <button class="admin-btn admin-btn-primary" onclick="addCategory()"><i class="fas fa-plus"></i> Add Category</button>
        </div>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <tr><th>Icon</th><th>Name</th><th>ID</th><th>Products</th><th style="text-align:right">Actions</th></tr>
          ${State.categories.map(function(cat) {
            return '<tr><td><i class="' + cat.icon + '" style="font-size:1.3rem;color:var(--accent)"></i></td><td>' + cat.name + '</td><td><code style="font-size:0.8rem">' + cat.id + '</code></td><td>' + State.products.filter(function(p) { return p.category === cat.id; }).length + '</td><td><div class="admin-table-actions"><button class="admin-btn admin-btn-edit admin-btn-icon" onclick="editCategory(\'' + cat.id + '\')" title="Edit"><i class="fas fa-edit"></i></button><button class="admin-btn admin-btn-danger admin-btn-icon" onclick="deleteCategory(\'' + cat.id + '\')" title="Delete"><i class="fas fa-trash"></i></button></div></td></tr>';
          }).join('')}
        </table>
      </div>
    </div>`;
}

async function addCategory() {
  const name = prompt('Category name:'); if (!name) return;
  const catId = name.toLowerCase().replace(/\s+/g, '-');
  const cat = { id: catId, name: name, icon: 'fas fa-tag', banner: catId };
  if (firebaseInitialized && db) {
    // Only save to Firestore — onSnapshot will update state automatically
    try { await db.collection('categories').doc(cat.id).set(cat); } catch (e) { toast('Error: ' + e.message, 'error'); return; }
  } else {
    State.categories.push(cat);
  }
  toast('Category added', 'success');
  adminRenderSection();
}

function editCategory(id) {
  const cat = State.categories.find(function(c) { return c.id === id; });
  if (!cat) return;
  const name = prompt('Edit category name:', cat.name); if (!name) return;
  if (firebaseInitialized && db) {
    try { db.collection('categories').doc(id).update({ name: name }); } catch (e) { toast('Error: ' + e.message, 'error'); return; }
  } else {
    cat.name = name;
  }
  toast('Category updated', 'success');
  adminRenderSection();
}

async function deleteCategory(id) {
  if (!confirm('Delete this category?')) return;
  if (firebaseInitialized && db) {
    try { await db.collection('categories').doc(id).delete(); } catch (e) { toast('Error: ' + e.message, 'error'); return; }
  } else {
    State.categories = State.categories.filter(function(c) { return c.id !== id; });
  }
  toast('Category deleted', 'info');
  adminRenderSection();
}

// ---------- ADMIN: BRANDS ----------
function adminBrandsView(c) {
  c.innerHTML = `
    <div class="admin-panel">
      <div class="admin-toolbar">
        <div class="admin-toolbar-left">
          <span class="admin-section-meta">${State.brands.length} brands</span>
        </div>
        <div class="admin-toolbar-right">
          <button class="admin-btn admin-btn-primary" onclick="addBrand()"><i class="fas fa-plus"></i> Add Brand</button>
        </div>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <tr><th>Logo</th><th>Name</th><th>Website</th><th>Products</th><th style="text-align:right">Actions</th></tr>
          ${State.brands.map(function(b) {
            return '<tr><td style="font-weight:700;color:var(--accent)">' + b.name + '</td><td>' + b.name + '</td><td>' + (b.website || '\u2014') + '</td><td>' + State.products.filter(function(p) { return p.brand === b.id; }).length + '</td><td><div class="admin-table-actions"><button class="admin-btn admin-btn-edit admin-btn-icon" onclick="editBrand(\'' + b.id + '\')" title="Edit"><i class="fas fa-edit"></i></button><button class="admin-btn admin-btn-danger admin-btn-icon" onclick="deleteBrand(\'' + b.id + '\')" title="Delete"><i class="fas fa-trash"></i></button></div></td></tr>';
          }).join('')}
        </table>
      </div>
    </div>`;
}

async function addBrand() {
  const name = prompt('Brand name:'); if (!name) return;
  const brandId = name.toLowerCase().replace(/\s+/g, '-');
  const brand = { id: brandId, name: name, logo: '', website: '', visible: true };
  if (firebaseInitialized && db) {
    // Only save to Firestore — onSnapshot will update state automatically
    try { await db.collection('brands').doc(brand.id).set(brand); } catch (e) { toast('Error: ' + e.message, 'error'); return; }
  } else {
    State.brands.push(brand);
  }
  toast('Brand added', 'success');
  adminRenderSection();
}

function editBrand(id) {
  const b = State.brands.find(function(x) { return x.id === id; });
  if (!b) return;
  const name = prompt('Edit brand name:', b.name); if (!name) return;
  if (firebaseInitialized && db) {
    try { db.collection('brands').doc(id).update({ name: name }); } catch (e) { toast('Error: ' + e.message, 'error'); return; }
  } else {
    b.name = name;
  }
  toast('Brand updated', 'success');
  adminRenderSection();
}

async function deleteBrand(id) {
  if (!confirm('Delete this brand?')) return;
  if (firebaseInitialized && db) {
    try { await db.collection('brands').doc(id).delete(); } catch (e) { toast('Error: ' + e.message, 'error'); return; }
  } else {
    State.brands = State.brands.filter(function(b) { return b.id !== id; });
  }
  toast('Brand deleted', 'info');
  adminRenderSection();
}

// ---------- ADMIN: ORDERS ----------
function adminOrdersView(c) {
  c.innerHTML = `
    <div class="admin-panel">
      <div class="admin-toolbar">
        <div class="admin-toolbar-left">
          <span class="admin-section-meta">${State.orders.length} total orders</span>
        </div>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Payment</th><th>Status</th><th>Update Status</th></tr>
          ${State.orders.slice().reverse().map(function(o) {
            return '<tr><td><strong>#' + o.id + '</strong></td><td>' + (o.customer ? o.customer.name : 'Guest') + '<br><span style="font-size:0.75rem;color:var(--text-light)">' + (o.customer ? (o.customer.phone || '') : '') + '</span></td><td>' + o.items.length + ' items</td><td>' + fmtPrice(o.total) + '</td><td style="text-transform:uppercase;font-size:0.8rem">' + o.payment + '</td><td><span class="order-status status-' + o.status + '">' + o.status + '</span></td><td><select class="sort-select" style="padding:6px" onchange="updateOrderStatus(\'' + o.id + '\', this.value)">' + ['pending','confirmed','processing','shipped','delivered','cancelled'].map(function(s) { return '<option value="' + s + '"' + (o.status === s ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></td></tr>';
          }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text-light);padding:32px">No orders yet</td></tr>'}
        </table>
      </div>
    </div>`;
}

async function updateOrderStatus(id, status) {
  if (firebaseInitialized && db) {
    // Only update Firestore — onSnapshot will sync state automatically
    try { await db.collection('orders').doc(id).update({ status: status }); } catch (e) { toast('Error: ' + e.message, 'error'); return; }
  } else {
    const order = State.orders.find(function(o) { return o.id === id; });
    if (order) order.status = status;
    saveState();
  }
  toast('Order #' + id + ' \u2192 ' + status, 'success');
}

// ---------- ADMIN: CUSTOMERS ----------
function adminCustomersView(c) {
  const customers = {};
  State.orders.forEach(function(o) {
    const email = (o.customer && o.customer.email) || 'guest';
    if (!customers[email]) customers[email] = { name: o.customer ? o.customer.name : 'Guest', email: email, phone: o.customer ? o.customer.phone : '', orders: 0, spent: 0 };
    customers[email].orders++;
    customers[email].spent += o.total;
  });
  const list = Object.values(customers);
  c.innerHTML = `
    <div class="admin-panel">
      <div class="admin-toolbar">
        <div class="admin-toolbar-left">
          <span class="admin-section-meta">${list.length} customers</span>
        </div>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <tr><th>Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Total Spent</th><th style="text-align:right">Actions</th></tr>
          ${list.map(function(cu) {
            return '<tr><td>' + (cu.name || 'Guest') + '</td><td>' + cu.email + '</td><td>' + (cu.phone || '\u2014') + '</td><td>' + cu.orders + '</td><td>' + fmtPrice(cu.spent) + '</td><td><div class="admin-table-actions"><button class="admin-btn admin-btn-primary admin-btn-icon" onclick="toast(\'Email sent to ' + cu.email + '\', \'success\')" title="Email"><i class="fas fa-envelope"></i></button><button class="admin-btn admin-btn-danger admin-btn-icon" onclick="toast(\'Customer blocked\', \'warning\')" title="Block"><i class="fas fa-ban"></i></button></div></td></tr>';
          }).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text-light);padding:32px">No customers yet</td></tr>'}
        </table>
      </div>
    </div>`;
}

// ---------- ADMIN: REVIEWS ----------
function adminReviewsView(c) {
  c.innerHTML = `
    <div class="admin-panel">
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <tr><th>Customer</th><th>Product</th><th>Rating</th><th>Review</th><th>Date</th><th style="text-align:right">Actions</th></tr>
          ${State.reviews.map(function(r) {
            return '<tr><td>' + r.name + '</td><td>' + r.product + '</td><td><span class="stars">' + stars(r.rating) + '</span></td><td style="max-width:300px">' + r.text + '</td><td>' + (r.date || '\u2014') + '</td><td><div class="admin-table-actions"><button class="admin-btn admin-btn-danger admin-btn-icon" onclick="toast(\'Review removed\', \'info\')" title="Delete"><i class="fas fa-trash"></i></button></div></td></tr>';
          }).join('')}
        </table>
      </div>
    </div>`;
}

// ---------- ADMIN: BANNERS ----------
function adminBannersView(c) {
  // Use Firebase banners or fall back to defaults
  var banners = State.banners.length > 0 ? State.banners : (window.GBD_DATA.BANNERS || []);
  c.innerHTML = `
    <div class="admin-panel">
      <div class="admin-toolbar">
        <div class="admin-toolbar-left">
          <span class="admin-section-meta">${banners.length} banners · Hero slider shows all active banners</span>
        </div>
        <div class="admin-toolbar-right">
          <button class="admin-btn admin-btn-primary" onclick="addBanner()"><i class="fas fa-plus"></i> Add Banner</button>
        </div>
      </div>
      <div style="margin-bottom:16px;padding:16px;background:var(--bg-alt);border-radius:var(--radius);font-size:0.85rem;color:var(--text-light)">
        <i class="fas fa-info-circle" style="color:var(--accent)"></i> Banners appear as sliding hero images on the homepage. The first 3 active banners will be shown in the slider. Change the image URL to change the entire hero background.
      </div>
      <div class="admin-cards" style="grid-template-columns:repeat(3,1fr)">
        ${banners.map(function(b) {
          return '<div class="admin-card" style="padding:0;overflow:hidden">' +
            '<div style="width:100%;height:140px;background:url(\'' + b.image + '\') center/cover;position:relative" onerror="this.style.background=\'#0F172A\'">' +
              '<div style="position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(0,0,0,0.7));padding:12px">' +
                '<span style="color:white;font-size:0.8rem;font-weight:600">' + (b.btnText || 'Shop Now') + '</span>' +
              '</div>' +
            '</div>' +
            '<div style="padding:16px">' +
              '<h4>' + b.title + '</h4>' +
              '<p style="color:var(--text-light);font-size:0.8rem;margin:8px 0">' + (b.subtitle || '') + '</p>' +
              '<p style="font-size:0.7rem;color:var(--text-light);margin:4px 0;word-break:break-all"><i class="fas fa-link"></i> ' + (b.link || '#products') + '</p>' +
              '<div style="display:flex;gap:8px;margin-top:12px">' +
                '<button class="admin-btn admin-btn-edit" onclick="editBanner(\'' + b.id + '\')"><i class="fas fa-edit"></i> Edit</button>' +
                '<button class="admin-btn admin-btn-danger" onclick="deleteBanner(\'' + b.id + '\')"><i class="fas fa-trash"></i> Delete</button>' +
              '</div>' +
            '</div>' +
          '</div>';
        }).join('')}
      </div>
    </div>`;
}

function editBanner(id) {
  var banners = State.banners.length > 0 ? State.banners : (window.GBD_DATA.BANNERS || []);
  var b = banners.find(function(x) { return x.id === id; });
  if (!b) { toast('Banner not found', 'error'); return; }
  var title = prompt('Banner title:', b.title); if (title === null) return;
  var subtitle = prompt('Subtitle:', b.subtitle || ''); if (subtitle === null) return;
  var image = prompt('Image URL (this changes the entire hero background):', b.image); if (image === null) return;
  var link = prompt('Link (e.g. #products or #products?category=gaming):', b.link || '#products'); if (link === null) return;
  var btnText = prompt('Button text:', b.btnText || 'Shop Now'); if (btnText === null) return;
  
  var updated = { id: b.id, title: title, subtitle: subtitle, image: image, link: link, btnText: btnText, active: true };
  if (firebaseInitialized && db) {
    try { db.collection('banners').doc(id).set(updated); } catch (e) { toast('Error: ' + e.message, 'error'); return; }
  } else {
    var idx = State.banners.findIndex(function(x) { return x.id === id; });
    if (idx >= 0) State.banners[idx] = updated;
  }
  toast('Banner updated', 'success');
  adminRenderSection();
}

async function addBanner() {
  const title = prompt('Banner title:'); if (!title) return;
  const subtitle = prompt('Subtitle:') || '';
  const image = prompt('Image URL:') || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=1600&h=600&fit=crop';
  const link = prompt('Link (e.g. #products or #products?category=gaming):') || '#products';
  var bannerId = 'banner_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  const banner = { id: bannerId, title: title, subtitle: subtitle, image: image, link: link, btnText: 'Shop Now', active: true };
  if (firebaseInitialized && db) {
    // Only save to Firestore — onSnapshot will update state automatically
    try { await db.collection('banners').doc(banner.id).set(banner); } catch (e) { toast('Error: ' + e.message, 'error'); return; }
  } else {
    State.banners.push(banner);
  }
  toast('Banner added', 'success');
  adminRenderSection();
}

async function deleteBanner(id) {
  if (!confirm('Delete this banner?')) return;
  if (firebaseInitialized && db) {
    try { await db.collection('banners').doc(id).delete(); } catch (e) { toast('Error: ' + e.message, 'error'); return; }
  } else {
    State.banners = State.banners.filter(function(b) { return b.id !== id; });
  }
  toast('Banner deleted', 'info');
  adminRenderSection();
}

// ---------- ADMIN: INVENTORY ----------
function adminInventoryView(c) {
  const lowStock = State.products.filter(function(p) { return p.stock < 15; });
  const outStock = State.products.filter(function(p) { return p.stock === 0; });
  c.innerHTML = `
    <div class="admin-cards">
      <div class="admin-card"><div class="admin-card-icon" style="background:var(--gradient)"><i class="fas fa-boxes"></i></div><div class="admin-card-value">${State.products.reduce(function(s, p) { return s + p.stock; }, 0)}</div><div class="admin-card-label">Total Stock Units</div></div>
      <div class="admin-card"><div class="admin-card-icon" style="background:linear-gradient(135deg,#F59E0B,#D97706)"><i class="fas fa-exclamation-triangle"></i></div><div class="admin-card-value">${lowStock.length}</div><div class="admin-card-label">Low Stock Items</div></div>
      <div class="admin-card"><div class="admin-card-icon" style="background:linear-gradient(135deg,#EF4444,#DC2626)"><i class="fas fa-times-circle"></i></div><div class="admin-card-value">${outStock.length}</div><div class="admin-card-label">Out of Stock</div></div>
    </div>
    <div class="admin-panel">
      <div class="admin-section-header">
        <h3><i class="fas fa-warehouse" style="color:var(--accent)"></i> Stock Levels</h3>
      </div>
      <div class="admin-table-wrapper">
        <table class="admin-table">
          <tr><th>Product</th><th>Current Stock</th><th>Status</th><th>Update Stock</th></tr>
          ${State.products.map(function(p) {
            return '<tr><td>' + p.name + '</td><td><strong>' + p.stock + '</strong></td><td>' + (p.stock === 0 ? '<span class="stock-out">Out of Stock</span>' : p.stock < 15 ? '<span style="color:var(--warning);font-weight:600">Low Stock</span>' : '<span class="stock-in">In Stock</span>') + '</td><td><input type="number" value="' + p.stock + '" style="width:80px;padding:6px;border-radius:6px;border:1px solid var(--border);background:var(--bg-alt);color:var(--text)" onchange="updateStock(\'' + p.id + '\', this.value)"></td></tr>';
          }).join('')}
        </table>
      </div>
    </div>`;
}

async function updateStock(id, value) {
  const stock = Number(value);
  if (firebaseInitialized && db) {
    // Only update Firestore — onSnapshot will sync state automatically
    try { await db.collection('products').doc(id).update({ stock: stock }); } catch (e) { toast('Error: ' + e.message, 'error'); return; }
  } else {
    const p = State.products.find(function(pr) { return pr.id === id; });
    if (p) p.stock = stock;
  }
  toast('Stock updated', 'success');
}

// ---------- ADMIN: ANALYTICS ----------
// (adminAnalyticsView removed - analytics section removed per user request)

// ---------- ADMIN: ADMIN PROFILE & SECURITY ----------
function adminProfileView(c) {
  const adminName = AdminState.adminName || 'admin';
  c.innerHTML = `
    <div style="max-width:700px;margin:0 auto">
      <div class="admin-settings-card">
        <div style="display:flex;align-items:center;gap:20px;margin-bottom:32px">
          <div style="width:72px;height:72px;border-radius:50%;background:var(--gradient);display:flex;align-items:center;justify-content:center;color:white;font-size:2rem;font-weight:800">
            <i class="fas fa-user-shield"></i>
          </div>
          <div>
            <h3 style="font-size:1.3rem;font-weight:700">${adminName}</h3>
            <p style="color:var(--text-light);font-size:0.85rem">Administrator \u00b7 Full Access</p>
          </div>
        </div>
        <h4 style="margin-bottom:16px;font-size:1rem"><i class="fas fa-id-card" style="color:var(--accent)"></i> Profile Information</h4>
        <div class="form-field" style="margin-bottom:16px">
          <label>Admin Username</label>
          <input type="text" id="adminProfName" value="${adminName}" style="width:100%;padding:12px 16px;border-radius:10px;border:1px solid var(--border);background:var(--bg-alt);color:var(--text)">
        </div>
        <button class="admin-btn admin-btn-primary" style="padding:12px 24px" onclick="updateAdminName()"><i class="fas fa-save"></i> Update Username</button>
      </div>
      <div class="admin-settings-card">
        <h4 style="margin-bottom:16px;font-size:1rem"><i class="fas fa-lock" style="color:var(--accent)"></i> Change Password</h4>
        <div class="form-field" style="margin-bottom:16px">
          <label>Current Password</label>
          <input type="password" id="adminCurPass" placeholder="Enter current password" style="width:100%;padding:12px 16px;border-radius:10px;border:1px solid var(--border);background:var(--bg-alt);color:var(--text)">
        </div>
        <div class="form-field" style="margin-bottom:16px">
          <label>New Password</label>
          <input type="password" id="adminNewPass" placeholder="Enter new password (min 6 chars)" style="width:100%;padding:12px 16px;border-radius:10px;border:1px solid var(--border);background:var(--bg-alt);color:var(--text)">
        </div>
        <div class="form-field" style="margin-bottom:16px">
          <label>Confirm New Password</label>
          <input type="password" id="adminConfPass" placeholder="Re-enter new password" style="width:100%;padding:12px 16px;border-radius:10px;border:1px solid var(--border);background:var(--bg-alt);color:var(--text)">
        </div>
        <button class="admin-btn admin-btn-primary" style="padding:12px 24px" onclick="changeAdminPassword()"><i class="fas fa-key"></i> Update Password</button>
      </div>
      <div class="admin-settings-card">
        <h4 style="margin-bottom:16px;font-size:1rem"><i class="fas fa-info-circle" style="color:var(--accent)"></i> Session Info</h4>
        <div class="summary-row"><span>Login Status</span><span style="color:var(--success);font-weight:600">Active</span></div>
        <div class="summary-row"><span>Mode</span><span>Script Auth</span></div>
        <div class="summary-row"><span>Role</span><span>Super Admin</span></div>
      </div>
    </div>`;
}

function updateAdminName() {
  const newName = document.getElementById('adminProfName').value.trim();
  if (!newName) { toast('Username cannot be empty', 'error'); return; }
  AdminState.adminName = newName;
  // Update sidebar display
  const sidebarUser = document.querySelector('.admin-sidebar div[style*="user-shield"]');
  if (sidebarUser) sidebarUser.innerHTML = '<i class="fas fa-user-shield"></i> ' + newName;
  // Save to localStorage
  localStorage.setItem('gbd_admin_name', newName);
  toast('Username updated successfully', 'success');
}

function changeAdminPassword() {
  const cur = document.getElementById('adminCurPass').value;
  const newP = document.getElementById('adminNewPass').value;
  const conf = document.getElementById('adminConfPass').value;
  if (!cur || !newP || !conf) { toast('Please fill all password fields', 'error'); return; }
  const savedPassword = localStorage.getItem('gbd_admin_password') || ADMIN_PASSWORD;
  if (cur !== savedPassword) { toast('Current password is incorrect', 'error'); return; }
  if (newP.length < 6) { toast('New password must be at least 6 characters', 'error'); return; }
  if (newP !== conf) { toast('New passwords do not match', 'error'); return; }
  localStorage.setItem('gbd_admin_password', newP);
  toast('Password changed successfully! Please login again.', 'success');
  setTimeout(function() { adminLogout(); }, 2000);
}

// ---------- ADMIN: SETTINGS ----------
function adminSettingsView(c) {
  c.innerHTML = `
    <div style="max-width:700px;margin:0 auto">
      <div class="admin-settings-card">
        <h4 style="margin-bottom:20px;font-size:1.1rem"><i class="fas fa-store" style="color:var(--accent)"></i> Store Information</h4>
        <div class="admin-form">
          <div class="form-field"><label>Store Name</label><input type="text" value="Gadgets BD"></div>
          <div class="form-field"><label>Contact Email</label><input type="email" value="support@gadgetsbd.com"></div>
          <div class="form-field"><label>Contact Phone</label><input type="tel" value="+880 1700-000000"></div>
          <div class="form-grid">
            <div class="form-field"><label>Free Shipping Threshold (\u09f3)</label><input type="number" value="10000"></div>
            <div class="form-field"><label>Standard Shipping (\u09f3)</label><input type="number" value="120"></div>
          </div>
          <div class="form-field"><label>Firebase Status</label><input type="text" value="${firebaseInitialized ? '\u2705 Connected & Realtime Sync Active' : '\u26a0\ufe0f Not Connected'}" disabled style="opacity:0.7"></div>
          <button class="btn-auth" style="margin-top:16px" onclick="toast('Settings saved', 'success')">Save Settings</button>
        </div>
      </div>
      <div class="admin-settings-card">
        <h4 style="margin-bottom:16px;font-size:1.1rem"><i class="fas fa-database" style="color:var(--accent)"></i> Firebase Status</h4>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
          <div><strong>Firebase Initialized:</strong> <span style="color:${firebaseInitialized ? 'var(--success)' : 'var(--danger)'}">${firebaseInitialized ? 'Yes' : 'No'}</span></div>
          <div><strong>Firestore:</strong> <span style="color:${db ? 'var(--success)' : 'var(--danger)'}">${db ? 'Connected' : 'Not Connected'}</span></div>
          <div><strong>Auth:</strong> <span style="color:${auth ? 'var(--success)' : 'var(--danger)'}">${auth ? 'Connected' : 'Not Connected'}</span></div>
          <div><strong>Storage:</strong> <span style="color:${storage ? 'var(--success)' : 'var(--danger)'}">${storage ? 'Connected' : 'Not Connected'}</span></div>
        </div>
      </div>
    </div>`;
}

// APP INITIALIZATION
// ============================================================
async function initApp() {
  // Populate nav dropdowns from State (will be updated by onSnapshot listeners)
  updateNavDropdowns();

  // Restore user button state
  if (State.user) { const btn = $('#accountBtn'); if (btn) btn.innerHTML = `<i class="fas fa-user-check"></i>`; }

  // Firebase auth state listener - for regular users only (admin uses hardcoded login)
  if (firebaseInitialized && auth) {
    auth.onAuthStateChanged(user => {
      if (user && !State.user) {
        setUser({ uid: user.uid, email: user.email, name: user.displayName || user.email.split('@')[0], photo: user.photoURL });
      }
    });
  }

  await loadData();
  updateBadges();
  router(false);
}

// Update navigation dropdowns from current State (called by onSnapshot listeners)
function updateNavDropdowns() {
  var navCats = $('#navCategories');
  if (navCats) {
    var cats = State.categories.length > 0 ? State.categories : (window.GBD_DATA.CATEGORIES || []);
    navCats.innerHTML = cats.map(function(c) {
      return '<a onclick="navigateTo(\'products?category=' + c.id + '\')">' + c.name + '</a>';
    }).join('');
  }
  var navBrands = $('#navBrands');
  if (navBrands) {
    var brands = State.brands.length > 0 ? State.brands : (window.GBD_DATA.BRANDS || []);
    navBrands.innerHTML = brands.map(function(b) {
      return '<a onclick="navigateTo(\'products?brand=' + b.id + '\')">' + b.name + '</a>';
    }).join('');
  }
}

// Start the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

console.log('Gadgets BD app.js part 9 (admin sections/init) loaded - App ready!');
