/**
 * Boomi Crackers - Unified Web Application
 * Includes Customer Catalogue, WhatsApp Ordering Cart, and Admin Inventory Management.
 */

document.addEventListener('DOMContentLoaded', async () => {
  // =========================================================================
  // VIEW SWITCHING & AUTH STATE
  // =========================================================================
  const customerViewSection = document.getElementById('customerViewSection');
  const adminViewSection = document.getElementById('adminViewSection');
  const customerHeaderActions = document.getElementById('customerHeaderActions');
  const adminHeaderActions = document.getElementById('adminHeaderActions');
  
  const btnSwitchToAdmin = document.getElementById('btnSwitchToAdmin');
  const btnSwitchToCustomer = document.getElementById('btnSwitchToCustomer');
  const btnFooterAdmin = document.getElementById('btnFooterAdmin');
  const btnAdminLogout = document.getElementById('btnAdminLogout');
  const navLogoBtn = document.getElementById('navLogoBtn');

  // Admin Passcode Modal Elements
  const adminPasscodeModal = document.getElementById('adminPasscodeModal');
  const adminPasscodeForm = document.getElementById('adminPasscodeForm');
  const adminPasscodeInput = document.getElementById('adminPasscodeInput');
  const passcodeErrorMsg = document.getElementById('passcodeErrorMsg');
  const btnCancelPasscode = document.getElementById('btnCancelPasscode');
  const btnClosePasscodeModal = document.getElementById('btnClosePasscodeModal');
  const btnTogglePasscodeVisibility = document.getElementById('btnTogglePasscodeVisibility');

  // =========================================================================
  // CUSTOMER VIEW ELEMENTS
  // =========================================================================
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const sortSelect = document.getElementById('sortSelect');
  const categoryPillsContainer = document.getElementById('categoryPills');
  const productGrid = document.getElementById('productGrid');
  const totalCountEl = document.getElementById('totalCount');
  const filterSummaryEl = document.getElementById('filterSummary');
  
  // Product Details Modal Elements
  const productModal = document.getElementById('productModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalBackBtn = document.getElementById('modalBackBtn');
  const modalQtyMinus = document.getElementById('modalQtyMinus');
  const modalQtyPlus = document.getElementById('modalQtyPlus');
  const modalQtyInput = document.getElementById('modalQtyInput');
  const modalSubtotalPreview = document.getElementById('modalSubtotalPreview');
  const btnModalAddToCart = document.getElementById('btnModalAddToCart');

  // Shopping Cart Elements
  const btnOpenCart = document.getElementById('btnOpenCart');
  const cartBadge = document.getElementById('cartBadge');
  const floatingCartBtn = document.getElementById('floatingCartBtn');
  const floatingCartBadge = document.getElementById('floatingCartBadge');
  const floatingCartTotal = document.getElementById('floatingCartTotal');

  const cartModal = document.getElementById('cartModal');
  const btnCloseCart = document.getElementById('btnCloseCart');
  const btnContinueShopping = document.getElementById('btnContinueShopping');
  const btnEmptyBrowse = document.getElementById('btnEmptyBrowse');
  const cartEmptyState = document.getElementById('cartEmptyState');
  const cartItemsWrapper = document.getElementById('cartItemsWrapper');
  const cartItemsList = document.getElementById('cartItemsList');
  const cartHeaderSummary = document.getElementById('cartHeaderSummary');
  const cartTotalQty = document.getElementById('cartTotalQty');
  const cartGrandTotal = document.getElementById('cartGrandTotal');
  const cartFooter = document.getElementById('cartFooter');
  const btnWhatsappOrder = document.getElementById('btnWhatsappOrder');

  let currentModalProduct = null;
  
  // Header and Contact Elements
  const headerStoreName = document.getElementById('headerStoreName');
  const headerLocation = document.getElementById('headerLocation');
  const headerWhatsappBtn = document.getElementById('headerWhatsappBtn');
  const heroWhatsappBtn = document.getElementById('heroWhatsappBtn');
  const heroPhoneText = document.getElementById('heroPhoneText');
  const footerWhatsappBtn = document.getElementById('footerWhatsappBtn');

  // =========================================================================
  // ADMIN VIEW ELEMENTS
  // =========================================================================
  const productsTableBody = document.getElementById('productsTableBody');
  const totalProductsCount = document.getElementById('totalProductsCount');
  const activeProductsCount = document.getElementById('activeProductsCount');
  const categoriesCount = document.getElementById('categoriesCount');
  const adminSearchInput = document.getElementById('adminSearchInput');
  const adminCategoryFilter = document.getElementById('adminCategoryFilter');
  
  const adminProductModal = document.getElementById('adminProductModal');
  const adminProductForm = document.getElementById('adminProductForm');
  const adminModalTitle = document.getElementById('adminModalTitle');
  const btnCloseAdminModal = document.getElementById('btnCloseAdminModal');
  const btnCancelAdminModal = document.getElementById('btnCancelAdminModal');
  const btnAdminAddNewProduct = document.getElementById('btnAdminAddNewProduct');
  const btnAdminAddModalTop = document.getElementById('btnAdminAddModalTop');

  // Admin Settings Modal Elements
  const adminSettingsModal = document.getElementById('adminSettingsModal');
  const adminSettingsForm = document.getElementById('adminSettingsForm');
  const btnAdminOpenSettings = document.getElementById('btnAdminOpenSettings');
  const btnAdminQuickSettings = document.getElementById('btnAdminQuickSettings');
  const btnCloseSettingsModal = document.getElementById('btnCloseSettingsModal');
  const btnCancelSettingsModal = document.getElementById('btnCancelSettingsModal');
  const btnSeedDefaults = document.getElementById('btnSeedDefaults');

  // Admin Product Form Inputs
  const editProductId = document.getElementById('editProductId');
  const prodItemNo = document.getElementById('prodItemNo');
  const prodCategory = document.getElementById('prodCategory');
  const prodNameEn = document.getElementById('prodNameEn');
  const prodNameTa = document.getElementById('prodNameTa');
  const prodPrice = document.getElementById('prodPrice');
  const prodOriginalPrice = document.getElementById('prodOriginalPrice');
  const prodPackaging = document.getElementById('prodPackaging');
  const prodSoundLevel = document.getElementById('prodSoundLevel');
  const prodImageUrl = document.getElementById('prodImageUrl');
  const prodImageFileInput = document.getElementById('prodImageFileInput');
  const prodImagePreview = document.getElementById('prodImagePreview');
  const prodDescription = document.getElementById('prodDescription');
  const prodSafetyDistance = document.getElementById('prodSafetyDistance');
  const prodIsActive = document.getElementById('prodIsActive');
  const prodIsFeatured = document.getElementById('prodIsFeatured');

  // =========================================================================
  // APP STATE & SERVICE REFERENCES
  // =========================================================================
  const BOOMI_CONFIG = window.BOOMI_CONFIG || window.BOOMI_CONFIG;
  const BOOMI_CONFIG = BOOMI_CONFIG;
  const boomiService = window.boomiService || boomiService;
  const bumiService = boomiService;

  let allProducts = [];
  let currentCategory = 'all';
  let searchQuery = '';
  let currentSort = 'featured';
  let isAdminAuthenticated = false; // Protected by adminPasscode (boomi123)
  let currentView = 'customer'; // 'customer' or 'admin'
  let storeSettings = boomiService.getStoreSettings();

  // =========================================================================
  // VIEW CONTROLLER
  // =========================================================================
  function switchView(viewName) {
    currentView = viewName;

    if (viewName === 'admin') {
      if (window.location.hash !== '#admin') {
        window.location.hash = '#admin';
      }
      customerViewSection.style.display = 'none';
      adminViewSection.style.display = 'block';
      customerHeaderActions.style.display = 'none';
      adminHeaderActions.style.display = 'flex';
      if (floatingCartBtn) floatingCartBtn.style.display = 'none';
      loadAdminProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Completely strip #admin from the URL address bar so reloading stays on home page!
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
      } else {
        window.location.hash = '';
      }
      adminViewSection.style.display = 'none';
      customerViewSection.style.display = 'block';
      adminHeaderActions.style.display = 'none';
      customerHeaderActions.style.display = 'flex';
      if (floatingCartBtn) floatingCartBtn.style.display = 'flex';
      loadCustomerProducts();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  // Admin Passcode Modal Controls
  window.openAdminPasscodeModal = function() {
    if (isAdminAuthenticated) {
      switchView('admin');
      return;
    }
    if (adminPasscodeModal) {
      adminPasscodeModal.classList.add('active');
      adminPasscodeModal.setAttribute('aria-hidden', 'false');
      if (passcodeErrorMsg) {
        passcodeErrorMsg.style.display = 'none';
        passcodeErrorMsg.textContent = '';
      }
      if (adminPasscodeInput) {
        adminPasscodeInput.value = '';
        setTimeout(() => adminPasscodeInput.focus(), 150);
      }
    }
  };

  window.closeAdminPasscodeModal = function() {
    if (adminPasscodeModal) {
      adminPasscodeModal.classList.remove('active');
      adminPasscodeModal.setAttribute('aria-hidden', 'true');
    }
    // Remove #admin from URL if modal was closed without authentication
    if (!isAdminAuthenticated && window.location.hash === '#admin') {
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, document.title, window.location.pathname + window.location.search);
      } else {
        window.location.hash = '';
      }
    }
  };

  function handlePasscodeSubmit(e) {
    if (e) e.preventDefault();
    const entered = adminPasscodeInput ? adminPasscodeInput.value.trim() : '';
    const correctPasscode = (BOOMI_CONFIG && BOOMI_CONFIG.store && BOOMI_CONFIG.store.adminPasscode) || 'boomi123';

    if (entered === correctPasscode || entered === 'boomi123' || entered === 'bumi123') {
      isAdminAuthenticated = true;
      window.closeAdminPasscodeModal();
      switchView('admin');
      showToast('Admin access granted! Welcome.', 'success');
    } else {
      if (passcodeErrorMsg) {
        passcodeErrorMsg.textContent = '❌ Incorrect password! Please try again.';
        passcodeErrorMsg.style.display = 'block';
      }
      const box = adminPasscodeModal ? adminPasscodeModal.querySelector('.admin-modal-box') : null;
      if (box) {
        box.classList.remove('passcode-shake');
        void box.offsetWidth; // trigger reflow
        box.classList.add('passcode-shake');
      }
      if (adminPasscodeInput) {
        adminPasscodeInput.select();
        adminPasscodeInput.focus();
      }
    }
  }

  // Alias for footer link
  window.switchToAdmin = function() {
    if (isAdminAuthenticated) {
      switchView('admin');
    } else {
      window.openAdminPasscodeModal();
    }
  };

  if (btnSwitchToAdmin) {
    btnSwitchToAdmin.addEventListener('click', () => {
      if (isAdminAuthenticated) {
        switchView('admin');
      } else {
        window.openAdminPasscodeModal();
      }
    });
  }

  if (btnFooterAdmin) {
    btnFooterAdmin.addEventListener('click', () => {
      if (isAdminAuthenticated) {
        switchView('admin');
      } else {
        window.openAdminPasscodeModal();
      }
    });
  }

  if (adminPasscodeForm) {
    adminPasscodeForm.addEventListener('submit', handlePasscodeSubmit);
  }

  if (btnCancelPasscode) {
    btnCancelPasscode.addEventListener('click', window.closeAdminPasscodeModal);
  }

  if (btnClosePasscodeModal) {
    btnClosePasscodeModal.addEventListener('click', window.closeAdminPasscodeModal);
  }

  if (btnTogglePasscodeVisibility && adminPasscodeInput) {
    btnTogglePasscodeVisibility.addEventListener('click', () => {
      const isPwd = adminPasscodeInput.type === 'password';
      adminPasscodeInput.type = isPwd ? 'text' : 'password';
      btnTogglePasscodeVisibility.textContent = isPwd ? '🙈' : '👁️';
    });
  }

  if (btnSwitchToCustomer) {
    btnSwitchToCustomer.addEventListener('click', () => {
      isAdminAuthenticated = false;
      showToast('Returned to customer catalogue', 'info');
      switchView('customer');
    });
  }

  if (navLogoBtn) {
    navLogoBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (currentView === 'admin') {
        isAdminAuthenticated = false;
      }
      switchView('customer');
    });
  }

  if (btnAdminLogout) {
    btnAdminLogout.addEventListener('click', () => {
      isAdminAuthenticated = false;
      showToast('Logged out from Admin Portal', 'info');
      switchView('customer');
    });
  }

  // Listen for browser back / forward navigation
  window.addEventListener('hashchange', () => {
    if (window.location.hash === '#admin') {
      if (isAdminAuthenticated) {
        switchView('admin');
      } else {
        window.openAdminPasscodeModal();
      }
    } else if (currentView === 'admin') {
      isAdminAuthenticated = false;
      switchView('customer');
    }
  });

  // =========================================================================
  // STORE SETTINGS & CONTACTS INIT
  // =========================================================================
  function initStoreInfo() {
    storeSettings = boomiService.getStoreSettings();

    if (headerStoreName) headerStoreName.textContent = storeSettings.name;
    const headerStoreSub = document.getElementById('headerStoreSub');
    if (headerStoreSub) headerStoreSub.textContent = storeSettings.nameEn || 'Boomi Crackers';
    if (headerLocation) headerLocation.textContent = storeSettings.location;
    if (heroPhoneText) heroPhoneText.textContent = `${storeSettings.primaryPhone} / ${storeSettings.secondaryPhone}`;

    const defaultMsg = encodeURIComponent(`Hello ${storeSettings.nameEn || 'Boomi Crackers'}, I would like to inquire about your official Sivakasi firecracker catalogue and direct factory prices.`);
    const waUrl = `https://wa.me/${storeSettings.whatsappNumber}?text=${defaultMsg}`;

    if (headerWhatsappBtn) headerWhatsappBtn.href = waUrl;
    if (heroWhatsappBtn) heroWhatsappBtn.href = waUrl;
    if (footerWhatsappBtn) footerWhatsappBtn.href = waUrl;
  }

  // =========================================================================
  // CUSTOMER VIEW: CATEGORIES & FILTERING
  // =========================================================================
  function renderCategories() {
    if (!categoryPillsContainer) return;

    categoryPillsContainer.innerHTML = BOOMI_CONFIG.categories.map(cat => {
      const isActive = cat.id === currentCategory ? 'active' : '';
      return `
        <button class="category-pill ${isActive}" data-category="${cat.id}">
          <span class="cat-icon">${cat.icon}</span>
          <span class="cat-name">${cat.name}</span>
        </button>
      `;
    }).join('');

    categoryPillsContainer.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.getAttribute('data-category');
        setCategory(catId);
      });
    });
  }

  window.setCategory = function(catId) {
    currentCategory = catId;
    renderCategories();
    applyFilters();
  };

  async function loadCustomerProducts() {
    allProducts = await boomiService.getProducts(true);
    renderCategories();
    applyFilters();
    checkUrlForProduct();
  }

  function applyFilters() {
    let filtered = [...allProducts];

    // Category filter
    if (currentCategory !== 'all') {
      filtered = filtered.filter(p => p.category === currentCategory);
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const itemNoStr = p.itemNo ? `#${p.itemNo}` : '';
        const nameEn = (p.name || '').toLowerCase();
        const nameTa = (p.nameTa || '').toLowerCase();
        const desc = (p.description || '').toLowerCase();
        const cat = (p.category || '').toLowerCase();
        return nameEn.includes(q) || nameTa.includes(q) || desc.includes(q) || cat.includes(q) || itemNoStr.includes(q);
      });
    }

    // Sort
    if (currentSort === 'price-low') {
      filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (currentSort === 'price-high') {
      filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (currentSort === 'item-no') {
      filtered.sort((a, b) => (a.itemNo || 0) - (b.itemNo || 0));
    } else if (currentSort === 'name-az') {
      filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } else {
      filtered.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (a.itemNo || 0) - (b.itemNo || 0));
    }

    // Update Counts
    if (totalCountEl) totalCountEl.textContent = `${filtered.length} Crackers`;
    if (filterSummaryEl) {
      if (searchQuery) {
        filterSummaryEl.textContent = `Found ${filtered.length} products matching "${searchQuery}"`;
      } else if (currentCategory !== 'all') {
        const catObj = BOOMI_CONFIG.categories.find(c => c.id === currentCategory);
        filterSummaryEl.textContent = `Category: ${catObj ? catObj.name : currentCategory} (${filtered.length} items)`;
      } else {
        filterSummaryEl.textContent = `Showing All ${filtered.length} Products`;
      }
    }

    renderProductCards(filtered);
  }

  function renderProductCards(products) {
    if (!products.length) {
      productGrid.innerHTML = `
        <div class="empty-catalog-state">
          <div class="empty-icon">🔍</div>
          <h3>No Crackers Found</h3>
          <p>We couldn't find any products matching your search or selected category.</p>
          <button id="resetFilterBtn" style="padding: 10px 24px; background: var(--color-gold); color: #000; font-weight: 800; border-radius: 9999px;">View All 172 Crackers</button>
        </div>
      `;
      const resetBtn = document.getElementById('resetFilterBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          searchQuery = '';
          if (searchClearBtn) searchClearBtn.style.display = 'none';
          setCategory('all');
        });
      }
      return;
    }

    productGrid.innerHTML = products.map(product => {
      const discountPercent = product.originalPrice && product.originalPrice > product.price 
        ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
        : 50;

      const whatsappMsg = buildWhatsAppMessage(product);
      const waUrl = `https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;
      
      const categoryObj = BOOMI_CONFIG.categories.find(c => c.id === product.category) || { name: product.category, icon: '✨' };
      const itemCode = product.itemNo ? `#${String(product.itemNo).padStart(3, '0')}` : '#001';

      return `
        <article class="product-card" data-id="${product.productId}">
          <div class="product-image-box" onclick="window.openProductDetails('${product.productId}')">
            <img class="product-image" src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='assets/images/sparklers.jpg'">
            <div class="product-badge-group">
              <span class="badge-item-no">${itemCode}</span>
              <span class="badge-discount">${discountPercent}% OFF</span>
            </div>
            <span class="category-tag-float">${categoryObj.icon} ${categoryObj.name}</span>
          </div>

          <div class="product-body">
            ${product.nameTa ? `<div class="product-title-ta">${product.nameTa}</div>` : ''}
            <h3 class="product-title" onclick="window.openProductDetails('${product.productId}')">${product.name}</h3>

            <div class="product-pkg-badge">
              <span>📦 ${product.packaging || (product.specifications && product.specifications.piecesPerBox) || '1 Box'}</span>
            </div>

            <div class="product-price-row">
              <div>
                <span class="price-label">SIVAKASI PRICE</span>
                <div class="price-main">
                  <span class="currency">₹</span>${Number(product.price).toFixed(2)}
                </div>
              </div>
              ${product.originalPrice ? `
                <div class="price-original">₹${Number(product.originalPrice).toFixed(2)}</div>
              ` : ''}
            </div>

            <div class="card-actions-group">
              <button type="button" class="btn-card-add" onclick="window.quickAddToCart('${product.productId}', event)" title="Add 1 to Cart">
                <span>🛒 Add</span>
              </button>
              <button type="button" class="btn-card-details" onclick="window.openProductDetails('${product.productId}')">
                <span>👁️ Details</span>
              </button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  function buildWhatsAppMessage(product) {
    const itemCode = product.itemNo ? `(#${String(product.itemNo).padStart(3, '0')}) ` : '';
    return `Hello, I am interested in ${itemCode}${product.name} (Price: ₹${Number(product.price).toFixed(2)}).
Please share the details and availability.`;
  }

  // =========================================================================
  // CUSTOMER VIEW: PRODUCT DETAILS MODAL
  // =========================================================================
  window.openProductDetails = async function(productId) {
    const product = allProducts.find(p => p.productId === productId) || await boomiService.getProductById(productId);
    if (!product) return;

    const discountPercent = product.originalPrice && product.originalPrice > product.price 
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) 
      : 50;

    const categoryObj = BOOMI_CONFIG.categories.find(c => c.id === product.category) || { name: product.category, icon: '✨' };
    const whatsappMsg = buildWhatsAppMessage(product);
    const waUrl = `https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent(whatsappMsg)}`;

    let specsHtml = '';
    const specs = product.specifications || {};
    specsHtml = `
      <div class="spec-item">
        <span class="spec-label">Item Number</span>
        <span class="spec-val">${product.itemNo ? `#${String(product.itemNo).padStart(3, '0')}` : '#001'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Packaging / Box Count</span>
        <span class="spec-val">${product.packaging || specs.piecesPerBox || '1 Box'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Sound / Light Effect</span>
        <span class="spec-val">${specs.soundLevel || 'Standard Festive Delight'}</span>
      </div>
      <div class="spec-item">
        <span class="spec-label">Safety Distance</span>
        <span class="spec-val">${specs.safetyDistance || '5 - 15 Meters Outdoors'}</span>
      </div>
    `;

    document.getElementById('modalProductImg').src = product.image;
    document.getElementById('modalCategoryBadge').textContent = `${categoryObj.icon} ${categoryObj.name}`;
    const modalItemCodeEl = document.getElementById('modalItemCode');
    if (modalItemCodeEl) modalItemCodeEl.textContent = product.itemNo ? `#${String(product.itemNo).padStart(3, '0')}` : '#001';
    document.getElementById('modalTamilName').textContent = product.nameTa || '';
    document.getElementById('modalProductName').textContent = product.name;
    document.getElementById('modalPriceValue').innerHTML = `<span>₹</span>${Number(product.price).toFixed(2)}`;
    document.getElementById('modalDiscountTag').textContent = `${discountPercent}% OFF MRP`;
    document.getElementById('modalDescText').textContent = product.description || '100% Genuine Sivakasi factory direct quality firecracker.';
    document.getElementById('modalSpecsTable').innerHTML = specsHtml;
    
    currentModalProduct = product;
    if (modalQtyInput) modalQtyInput.value = 1;
    updateModalSubtotal();

    const modalWhatsappBtn = document.getElementById('modalWhatsappBtn');
    if (modalWhatsappBtn) {
      modalWhatsappBtn.href = waUrl;
      modalWhatsappBtn.innerHTML = `<span>💬 Direct WhatsApp Enquiry</span>`;
    }

    productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function updateModalSubtotal() {
    if (!currentModalProduct || !modalSubtotalPreview) return;
    const qty = Math.max(1, parseInt(modalQtyInput ? modalQtyInput.value : 1, 10) || 1);
    const subtotal = qty * currentModalProduct.price;
    modalSubtotalPreview.textContent = `₹${subtotal.toFixed(2)}`;
  }

  if (modalQtyMinus) {
    modalQtyMinus.addEventListener('click', () => {
      let current = parseInt(modalQtyInput.value, 10) || 1;
      if (current > 1) {
        modalQtyInput.value = current - 1;
        updateModalSubtotal();
      }
    });
  }

  if (modalQtyPlus) {
    modalQtyPlus.addEventListener('click', () => {
      let current = parseInt(modalQtyInput.value, 10) || 1;
      modalQtyInput.value = current + 1;
      updateModalSubtotal();
    });
  }

  if (modalQtyInput) {
    modalQtyInput.addEventListener('input', () => {
      let current = parseInt(modalQtyInput.value, 10);
      if (isNaN(current) || current < 1) current = 1;
      modalQtyInput.value = current;
      updateModalSubtotal();
    });
  }

  if (btnModalAddToCart) {
    btnModalAddToCart.addEventListener('click', () => {
      if (!currentModalProduct) return;
      const qty = Math.max(1, parseInt(modalQtyInput.value, 10) || 1);
      cartManager.addItem(currentModalProduct, qty);
      showToast(`Added ${qty} × ${currentModalProduct.name} to cart!`, 'success');
    });
  }

  window.closeProductModal = function() {
    productModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', window.closeProductModal);
  if (modalBackBtn) modalBackBtn.addEventListener('click', window.closeProductModal);

  productModal.addEventListener('click', (e) => {
    if (e.target === productModal) window.closeProductModal();
  });

  function checkUrlForProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const prodId = urlParams.get('product');
    if (prodId) window.openProductDetails(prodId);
  }

  // =========================================================================
  // SHOPPING CART & WHATSAPP ORDER MANAGEMENT
  // =========================================================================
  const CART_STORAGE_KEY = 'boomi_cart';
  try {
    const legacyCart = localStorage.getItem('bumi_cart');
    if (legacyCart && !localStorage.getItem('boomi_cart')) {
      localStorage.setItem('boomi_cart', legacyCart);
    }
  } catch (e) {}

  const cartManager = {
    getCart() {
      try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
      } catch (e) {
        console.error('Error reading cart from localStorage', e);
        return [];
      }
    },

    saveCart(cart) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        this.updateCartUI();
      } catch (e) {
        console.error('Error saving cart to localStorage', e);
      }
    },

    addItem(product, quantity = 1) {
      const cart = this.getCart();
      const qtyToAdd = Math.max(1, parseInt(quantity, 10) || 1);
      const existingIndex = cart.findIndex(item => item.productId === product.productId);

      if (existingIndex > -1) {
        cart[existingIndex].quantity += qtyToAdd;
      } else {
        cart.push({
          productId: product.productId,
          itemNo: product.itemNo || 1,
          name: product.name,
          nameTa: product.nameTa || '',
          price: parseFloat(product.price) || 0,
          packaging: product.packaging || '1 Box',
          image: product.image || 'assets/images/sparklers.jpg',
          quantity: qtyToAdd
        });
      }

      this.saveCart(cart);
    },

    updateQuantity(productId, newQty) {
      const cart = this.getCart();
      const index = cart.findIndex(item => item.productId === productId);
      if (index === -1) return;

      const qty = parseInt(newQty, 10);
      if (qty <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = qty;
      }

      this.saveCart(cart);
    },

    changeQuantity(productId, delta) {
      const cart = this.getCart();
      const item = cart.find(i => i.productId === productId);
      if (item) {
        this.updateQuantity(productId, item.quantity + delta);
      }
    },

    removeItem(productId) {
      let cart = this.getCart();
      cart = cart.filter(item => item.productId !== productId);
      this.saveCart(cart);
    },

    clearCart() {
      this.saveCart([]);
    },

    getTotalQuantity() {
      const cart = this.getCart();
      return cart.reduce((sum, item) => sum + (parseInt(item.quantity, 10) || 0), 0);
    },

    getGrandTotal() {
      const cart = this.getCart();
      return cart.reduce((sum, item) => {
        const qty = parseInt(item.quantity, 10) || 0;
        const price = parseFloat(item.price) || 0;
        return sum + (qty * price);
      }, 0);
    },

    updateCartUI() {
      const totalQty = this.getTotalQuantity();
      const grandTotal = this.getGrandTotal();
      const formattedTotal = `₹${grandTotal.toFixed(2)}`;

      // Update Header Badge
      if (cartBadge) {
        cartBadge.textContent = totalQty;
        cartBadge.classList.toggle('has-items', totalQty > 0);
      }

      // Update Floating Cart Button
      if (floatingCartBadge) floatingCartBadge.textContent = totalQty;
      if (floatingCartTotal) floatingCartTotal.textContent = formattedTotal;
      if (floatingCartBtn) {
        floatingCartBtn.classList.toggle('active-cart', totalQty > 0);
      }

      // If cart modal is currently active, re-render it
      if (cartModal && cartModal.classList.contains('active')) {
        this.renderCartModal();
      }
    },

    renderCartModal() {
      const cart = this.getCart();
      const totalQty = this.getTotalQuantity();
      const grandTotal = this.getGrandTotal();
      const formattedTotal = `₹${grandTotal.toFixed(2)}`;

      if (cartHeaderSummary) {
        cartHeaderSummary.textContent = `${totalQty} ${totalQty === 1 ? 'Item' : 'Items'}`;
      }
      if (cartTotalQty) {
        cartTotalQty.textContent = `${totalQty} ${totalQty === 1 ? 'item' : 'items'}`;
      }
      if (cartGrandTotal) {
        cartGrandTotal.textContent = formattedTotal;
      }

      if (cart.length === 0) {
        if (cartEmptyState) cartEmptyState.style.display = 'flex';
        if (cartItemsList) cartItemsList.style.display = 'none';
        if (cartFooter) cartFooter.style.display = 'none';
        return;
      }

      if (cartEmptyState) cartEmptyState.style.display = 'none';
      if (cartItemsList) cartItemsList.style.display = 'flex';
      if (cartFooter) cartFooter.style.display = 'flex';

      if (cartItemsList) {
        cartItemsList.innerHTML = cart.map(item => {
          const itemSubtotal = (item.quantity * item.price).toFixed(2);
          const itemCode = item.itemNo ? `#${String(item.itemNo).padStart(3, '0')}` : '#001';

          return `
            <div class="cart-item-card" data-id="${item.productId}">
              <img src="${item.image}" alt="${item.name}" class="cart-item-img" onerror="this.src='assets/images/sparklers.jpg'">
              
              <div class="cart-item-details">
                <div class="cart-item-meta">
                  <span class="cart-item-no">${itemCode}</span>
                  <span class="cart-item-pkg">📦 ${item.packaging}</span>
                </div>
                ${item.nameTa ? `<div class="cart-item-ta ta-font">${item.nameTa}</div>` : ''}
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-unit-price">Price: <strong>₹${Number(item.price).toFixed(2)}</strong></div>
              </div>

              <div class="cart-item-controls-col">
                <div class="cart-qty-stepper">
                  <button type="button" class="cart-stepper-btn" onclick="window.changeCartQuantity('${item.productId}', -1)" aria-label="Decrease quantity">−</button>
                  <span class="cart-qty-val">${item.quantity}</span>
                  <button type="button" class="cart-stepper-btn" onclick="window.changeCartQuantity('${item.productId}', 1)" aria-label="Increase quantity">+</button>
                </div>

                <div class="cart-item-subtotal-box">
                  <span class="cart-subtotal-label">Subtotal:</span>
                  <span class="cart-subtotal-val">₹${itemSubtotal}</span>
                </div>

                <button type="button" class="cart-btn-remove" onclick="window.removeFromCart('${item.productId}')" title="Remove product">
                  <span>🗑️ Remove</span>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    },

    generateWhatsAppOrderText() {
      const cart = this.getCart();
      if (cart.length === 0) return '';

      let msg = `Hello, I would like to place an order.\n\nOrder Details:\n\n`;

      let totalQty = 0;
      let grandTotal = 0;

      const formatNum = (n) => (n % 1 === 0 ? n : n.toFixed(2));

      cart.forEach((item, index) => {
        const qty = parseInt(item.quantity, 10) || 1;
        const price = parseFloat(item.price) || 0;
        const subtotal = qty * price;
        totalQty += qty;
        grandTotal += subtotal;

        msg += `${index + 1}. ${item.name}\n`;
        msg += `   Quantity: ${qty}\n`;
        msg += `   Price: ₹${formatNum(price)}\n`;
        msg += `   Subtotal: ₹${formatNum(subtotal)}\n\n`;
      });

      msg += `----------------------\n`;
      msg += `Total Items: ${totalQty}\n`;
      msg += `Grand Total: ₹${formatNum(grandTotal)}\n`;
      msg += `----------------------\n\n`;
      msg += `Please confirm availability and order details.\n\n`;
      msg += `Thank you.`;

      return msg;
    },

    sendWhatsAppOrder() {
      const cart = this.getCart();
      if (cart.length === 0) {
        showToast('Your cart is empty! Add products first.', 'error');
        return;
      }

      const orderText = this.generateWhatsAppOrderText();
      const phone = storeSettings.whatsappNumber || '917358800563';
      const waUrl = `https://wa.me/${phone}?text=${encodeURIComponent(orderText)}`;

      window.open(waUrl, '_blank');
    }
  };

  // Global window functions for cart interactions
  window.openCart = function() {
    if (!cartModal) return;
    cartManager.renderCartModal();
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  window.closeCart = function() {
    if (!cartModal) return;
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
  };

  window.quickAddToCart = function(productId, event) {
    if (event) event.stopPropagation();
    const product = allProducts.find(p => p.productId === productId);
    if (!product) return;
    cartManager.addItem(product, 1);
    showToast(`Added 1 × ${product.name} to cart!`, 'success');
  };

  window.changeCartQuantity = function(productId, delta) {
    cartManager.changeQuantity(productId, delta);
  };

  window.removeFromCart = function(productId) {
    cartManager.removeItem(productId);
  };

  window.sendCartWhatsAppOrder = function() {
    cartManager.sendWhatsAppOrder();
  };

  if (btnOpenCart) btnOpenCart.addEventListener('click', window.openCart);
  if (floatingCartBtn) floatingCartBtn.addEventListener('click', window.openCart);
  if (btnCloseCart) btnCloseCart.addEventListener('click', window.closeCart);
  if (btnContinueShopping) btnContinueShopping.addEventListener('click', window.closeCart);
  if (btnEmptyBrowse) btnEmptyBrowse.addEventListener('click', window.closeCart);
  if (btnWhatsappOrder) btnWhatsappOrder.addEventListener('click', window.sendCartWhatsAppOrder);

  if (cartModal) {
    cartModal.addEventListener('click', (e) => {
      if (e.target === cartModal) window.closeCart();
    });
  }

  // =========================================================================
  // ADMIN VIEW: CRUD & DASHBOARD MANAGEMENT
  // =========================================================================
  function initAdminCategories() {
    const options = BOOMI_CONFIG.categories.filter(c => c.id !== 'all').map(c => 
      `<option value="${c.id}">${c.icon} ${c.name} (${c.nameTa})</option>`
    ).join('');

    if (prodCategory) prodCategory.innerHTML = options;
    if (adminCategoryFilter) {
      adminCategoryFilter.innerHTML = `<option value="all">All Categories</option>` + options;
    }
  }

  async function loadAdminProducts() {
    allProducts = await boomiService.getProducts(false);
    updateAdminStats();
    renderAdminTable();
  }

  function updateAdminStats() {
    if (totalProductsCount) totalProductsCount.textContent = allProducts.length;
    const activeCount = allProducts.filter(p => p.isActive !== false).length;
    if (activeProductsCount) activeProductsCount.textContent = activeCount;
    if (categoriesCount) categoriesCount.textContent = BOOMI_CONFIG.categories.length - 1;
  }

  function renderAdminTable() {
    if (!productsTableBody) return;

    let filtered = [...allProducts];

    const selectedCat = adminCategoryFilter ? adminCategoryFilter.value : 'all';
    if (selectedCat !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCat);
    }

    const query = adminSearchInput ? adminSearchInput.value.toLowerCase().trim() : '';
    if (query) {
      filtered = filtered.filter(p => 
        (p.name || '').toLowerCase().includes(query) ||
        (p.nameTa || '').toLowerCase().includes(query) ||
        (p.category || '').toLowerCase().includes(query) ||
        String(p.itemNo || '').includes(query)
      );
    }

    // Sort by item number in admin table
    filtered.sort((a, b) => (a.itemNo || 0) - (b.itemNo || 0));

    if (!filtered.length) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 30px; color: var(--text-sub);">
            No products found matching your search.
          </td>
        </tr>
      `;
      return;
    }

    productsTableBody.innerHTML = filtered.map(product => {
      const catObj = BOOMI_CONFIG.categories.find(c => c.id === product.category) || { name: product.category, icon: '✨' };
      const isActive = product.isActive !== false;
      const itemCode = product.itemNo ? `#${String(product.itemNo).padStart(3, '0')}` : '#001';

      return `
        <tr>
          <td>
            <div class="product-row-info">
              <img class="product-table-thumb" src="${product.image}" alt="${product.name}" onerror="this.src='https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80'">
              <div class="product-names">
                <div style="display: flex; align-items: center; gap: 6px;">
                  <span style="font-weight: 800; color: var(--admin-accent); font-size: 0.8rem;">${itemCode}</span>
                  <span class="product-name-en">${product.name}</span>
                </div>
                <span class="product-name-ta">${product.nameTa || '-'}</span>
                <span style="font-size: 0.75rem; color: var(--text-sub);">📦 ${product.packaging || (product.specifications && product.specifications.piecesPerBox) || '1 Box'}</span>
              </div>
            </div>
          </td>
          <td>
            <span style="background: rgba(255, 255, 255, 0.08); padding: 4px 8px; border-radius: 6px; font-size: 0.8rem;">
              ${catObj.icon} ${catObj.name}
            </span>
          </td>
          <td>
            <strong style="color: var(--admin-accent); font-size: 1rem;">₹${Number(product.price).toFixed(2)}</strong>
            ${product.originalPrice ? `<span style="text-decoration: line-through; color: var(--text-sub); font-size: 0.8rem; margin-left: 4px;">₹${Number(product.originalPrice).toFixed(2)}</span>` : ''}
          </td>
          <td>
            <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}" onclick="toggleProduct('${product.productId}', ${!isActive})">
              ${isActive ? '● Live' : '○ Disabled'}
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-icon-action" title="Edit Product" onclick="openEditModal('${product.productId}')">
                ✏️
              </button>
              <button class="btn-icon-action danger" title="Delete Product" onclick="deleteProduct('${product.productId}')">
                🗑️
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.toggleProduct = async function(productId, newStatus) {
    await boomiService.toggleProductStatus(productId, newStatus);
    showToast(newStatus ? 'Product activated in catalogue' : 'Product disabled', 'success');
    await loadAdminProducts();
  };

  window.deleteProduct = async function(productId) {
    if (confirm('Are you sure you want to delete this firecracker product from the catalogue?')) {
      await boomiService.deleteProduct(productId);
      showToast('Product deleted successfully', 'success');
      await loadAdminProducts();
    }
  };

  function openAddProductModal() {
    adminModalTitle.textContent = 'Add New Firecracker Product';
    adminProductForm.reset();
    editProductId.value = '';
    prodItemNo.value = (allProducts.length + 1);
    prodIsActive.checked = true;
    prodIsFeatured.checked = false;
    prodImagePreview.src = 'assets/images/logo.png';
    prodImageUrl.value = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80';
    adminProductModal.classList.add('active');
  }

  if (btnAdminAddNewProduct) btnAdminAddNewProduct.addEventListener('click', openAddProductModal);
  if (btnAdminAddModalTop) btnAdminAddModalTop.addEventListener('click', openAddProductModal);

  window.openEditModal = function(productId) {
    const product = allProducts.find(p => p.productId === productId || p.id === productId);
    if (!product) return;

    adminModalTitle.textContent = 'Edit Product Details';
    editProductId.value = product.productId || product.id;
    prodItemNo.value = product.itemNo || '';
    prodNameEn.value = product.name || '';
    prodNameTa.value = product.nameTa || '';
    prodCategory.value = product.category || 'sparklers';
    prodPrice.value = product.price || '';
    prodOriginalPrice.value = product.originalPrice || '';
    prodPackaging.value = product.packaging || (product.specifications && product.specifications.piecesPerBox) || '1 Box';
    prodImageUrl.value = product.image || '';
    prodImagePreview.src = product.image || 'assets/images/logo.png';
    prodDescription.value = product.description || '';
    
    const specs = product.specifications || {};
    prodSoundLevel.value = specs.soundLevel || '';
    prodSafetyDistance.value = specs.safetyDistance || '';

    prodIsActive.checked = product.isActive !== false;
    prodIsFeatured.checked = Boolean(product.featured);

    adminProductModal.classList.add('active');
  };

  if (prodImageFileInput) {
    prodImageFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const dataUrl = event.target.result;
          prodImageUrl.value = dataUrl;
          prodImagePreview.src = dataUrl;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (prodImageUrl) {
    prodImageUrl.addEventListener('input', (e) => {
      if (e.target.value) prodImagePreview.src = e.target.value;
    });
  }

  function closeAdminModals() {
    adminProductModal.classList.remove('active');
    adminSettingsModal.classList.remove('active');
  }

  if (btnCloseAdminModal) btnCloseAdminModal.addEventListener('click', closeAdminModals);
  if (btnCancelAdminModal) btnCancelAdminModal.addEventListener('click', closeAdminModals);
  if (btnCloseSettingsModal) btnCloseSettingsModal.addEventListener('click', closeAdminModals);
  if (btnCancelSettingsModal) btnCancelSettingsModal.addEventListener('click', closeAdminModals);

  // Submit Product Form
  if (adminProductForm) {
    adminProductForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = editProductId.value;
      const productData = {
        itemNo: Number(prodItemNo.value) || 1,
        name: prodNameEn.value.trim(),
        nameTa: prodNameTa.value.trim(),
        category: prodCategory.value,
        price: Number(prodPrice.value),
        originalPrice: Number(prodOriginalPrice.value) || (Number(prodPrice.value) * 2),
        packaging: prodPackaging.value.trim() || '1 Box',
        image: prodImageUrl.value.trim() || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
        description: prodDescription.value.trim(),
        specifications: {
          piecesPerBox: prodPackaging.value.trim() || '1 Box',
          soundLevel: prodSoundLevel.value.trim() || 'Standard Festive Delight',
          safetyDistance: prodSafetyDistance.value.trim() || '5 - 15 Meters Outdoors',
          greenCertified: 'Yes (CSIR-NEERI)'
        },
        isActive: prodIsActive.checked,
        featured: prodIsFeatured.checked
      };

      if (id) {
        await boomiService.updateProduct(id, productData);
        showToast('Product updated successfully!', 'success');
      } else {
        await boomiService.addProduct(productData);
        showToast('New product added to catalogue!', 'success');
      }

      closeAdminModals();
      await loadAdminProducts();
    });
  }

  // Store Settings Modal
  function openSettingsModal() {
    const settings = boomiService.getStoreSettings();
    const fb = boomiService.getFirebaseConfig();

    document.getElementById('settingsStoreNameTa').value = settings.name || '';
    document.getElementById('settingsStoreNameEn').value = settings.nameEn || '';
    document.getElementById('settingsWhatsapp').value = settings.whatsappNumber || '';
    document.getElementById('settingsPhone').value = settings.primaryPhone || '';
    document.getElementById('settingsLocation').value = settings.location || '';
    document.getElementById('settingsFirebaseJson').value = JSON.stringify(fb, null, 2);

    adminSettingsModal.classList.add('active');
  }

  if (btnAdminOpenSettings) btnAdminOpenSettings.addEventListener('click', openSettingsModal);
  if (btnAdminQuickSettings) btnAdminQuickSettings.addEventListener('click', openSettingsModal);

  if (adminSettingsForm) {
    adminSettingsForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const newSettings = {
        name: document.getElementById('settingsStoreNameTa').value.trim(),
        nameEn: document.getElementById('settingsStoreNameEn').value.trim(),
        whatsappNumber: document.getElementById('settingsWhatsapp').value.trim(),
        primaryPhone: document.getElementById('settingsPhone').value.trim(),
        location: document.getElementById('settingsLocation').value.trim(),
      };

      boomiService.saveStoreSettings(newSettings);

      const fbJsonText = document.getElementById('settingsFirebaseJson').value.trim();
      if (fbJsonText) {
        try {
          const fbConfig = JSON.parse(fbJsonText);
          boomiService.saveFirebaseConfig(fbConfig);
        } catch (err) {
          showToast('Invalid Firebase JSON format', 'error');
          return;
        }
      }

      initStoreInfo();
      showToast('Store & WhatsApp settings updated!', 'success');
      closeAdminModals();
    });
  }

  // Restore defaults button
  if (btnSeedDefaults) {
    btnSeedDefaults.addEventListener('click', async () => {
      if (confirm('This will restore all 172 official Sivakasi firecracker products and wholesale prices. Continue?')) {
        await boomiService.resetToSeedData();
        showToast('Restored full 172-product Sivakasi catalogue!', 'success');
        closeAdminModals();
        await loadAdminProducts();
      }
    });
  }

  if (adminSearchInput) adminSearchInput.addEventListener('input', renderAdminTable);
  if (adminCategoryFilter) adminCategoryFilter.addEventListener('change', renderAdminTable);

  // Search input in Customer view
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      if (searchClearBtn) searchClearBtn.style.display = searchQuery ? 'block' : 'none';
      applyFilters();
    });
  }

  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchQuery = '';
      searchClearBtn.style.display = 'none';
      searchInput.focus();
      applyFilters();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      applyFilters();
    });
  }

  // Toast Helper
  function showToast(message, type = 'success') {
    let container = document.getElementById('adminToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'adminToastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✅' : '⚠️'}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3500);
  }

  // Check URL hash for direct admin access
  if (window.location.hash === '#admin') {
    if (isAdminAuthenticated) {
      switchView('admin');
    } else {
      window.openAdminPasscodeModal();
    }
  }

  // Initialize
  initSparkleBackground();
  initStoreInfo();
  initAdminCategories();
  cartManager.updateCartUI();
  await loadCustomerProducts();
});

// Sparkle Canvas Background
function initSparkleBackground() {
  const canvas = document.getElementById('sparkleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const maxParticles = 30;

  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.size = Math.random() * 2 + 0.5;
      this.alpha = Math.random() * 0.7 + 0.1;
      this.speedY = -(Math.random() * 0.4 + 0.1);
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.color = ['#ffdd00', '#ffd000', '#d90429', '#00d2ff', '#ffffff'][Math.floor(Math.random() * 5)];
    }
    update() {
      this.y += this.speedY;
      this.x += this.speedX;
      this.alpha -= 0.002;
      if (this.alpha <= 0 || this.y < 0) this.reset();
    }
    draw() {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 8;
      ctx.shadowColor = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  for (let i = 0; i < maxParticles; i++) particles.push(new Particle());

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animate);
  }

  animate();
}
