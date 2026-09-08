/**
 * Boomi Crackers - Admin Dashboard Script
 * CRUD, Product status toggles, Image previews, and Store settings
 */

document.addEventListener('DOMContentLoaded', async () => {
  const BOOMI_CONFIG = window.BOOMI_CONFIG || window.BOOMI_CONFIG;
  const BOOMI_CONFIG = BOOMI_CONFIG;
  const boomiService = window.boomiService || boomiService;
  const bumiService = boomiService;

  // Elements
  const productsTableBody = document.getElementById('productsTableBody');
  const totalProductsCount = document.getElementById('totalProductsCount');
  const activeProductsCount = document.getElementById('activeProductsCount');
  const categoriesCount = document.getElementById('categoriesCount');
  const adminSearchInput = document.getElementById('adminSearchInput');
  const adminCategoryFilter = document.getElementById('adminCategoryFilter');
  
  // Product Modal Elements
  const productModal = document.getElementById('adminProductModal');
  const productForm = document.getElementById('adminProductForm');
  const modalTitle = document.getElementById('adminModalTitle');
  const btnCloseModal = document.getElementById('btnCloseAdminModal');
  const btnCancelModal = document.getElementById('btnCancelAdminModal');
  const btnAddNewProduct = document.getElementById('btnAddNewProduct');
  
  // Settings Modal Elements
  const settingsModal = document.getElementById('adminSettingsModal');
  const settingsForm = document.getElementById('adminSettingsForm');
  const btnOpenSettings = document.getElementById('btnOpenSettings');
  const btnCloseSettings = document.getElementById('btnCloseSettingsModal');
  const btnCancelSettings = document.getElementById('btnCancelSettingsModal');
  const btnSeedDefaults = document.getElementById('btnSeedDefaults');

  // Form Fields
  const editProductId = document.getElementById('editProductId');
  const prodNameEn = document.getElementById('prodNameEn');
  const prodNameTa = document.getElementById('prodNameTa');
  const prodCategory = document.getElementById('prodCategory');
  const prodPrice = document.getElementById('prodPrice');
  const prodOriginalPrice = document.getElementById('prodOriginalPrice');
  const prodImageUrl = document.getElementById('prodImageUrl');
  const prodImageFileInput = document.getElementById('prodImageFileInput');
  const prodImagePreview = document.getElementById('prodImagePreview');
  const prodDescription = document.getElementById('prodDescription');
  const prodPiecesBox = document.getElementById('prodPiecesBox');
  const prodSoundLevel = document.getElementById('prodSoundLevel');
  const prodSafetyDistance = document.getElementById('prodSafetyDistance');
  const prodIsActive = document.getElementById('prodIsActive');
  const prodIsFeatured = document.getElementById('prodIsFeatured');

  let allProducts = [];

  // Populate Categories in Dropdowns
  function initCategories() {
    const options = BOOMI_CONFIG.categories.filter(c => c.id !== 'all').map(c => 
      `<option value="${c.id}">${c.icon} ${c.name} (${c.nameTa})</option>`
    ).join('');

    if (prodCategory) prodCategory.innerHTML = options;

    if (adminCategoryFilter) {
      adminCategoryFilter.innerHTML = `<option value="all">All Categories</option>` + options;
    }
  }

  // Load and Render Products
  async function loadAdminProducts() {
    allProducts = await boomiService.getProducts(false);
    updateStats();
    renderTable();
  }

  function updateStats() {
    if (totalProductsCount) totalProductsCount.textContent = allProducts.length;
    const activeCount = allProducts.filter(p => p.isActive !== false).length;
    if (activeProductsCount) activeProductsCount.textContent = activeCount;
    if (categoriesCount) categoriesCount.textContent = BOOMI_CONFIG.categories.length - 1;
  }

  function renderTable() {
    if (!productsTableBody) return;

    let filtered = [...allProducts];

    // Filter by Category
    const selectedCat = adminCategoryFilter ? adminCategoryFilter.value : 'all';
    if (selectedCat !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCat);
    }

    // Filter by Search text
    const query = adminSearchInput ? adminSearchInput.value.toLowerCase().trim() : '';
    if (query) {
      filtered = filtered.filter(p => 
        (p.name || '').toLowerCase().includes(query) ||
        (p.nameTa || '').toLowerCase().includes(query) ||
        (p.category || '').toLowerCase().includes(query)
      );
    }

    if (!filtered.length) {
      productsTableBody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-sub);">
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
            <strong style="color: var(--admin-accent); font-size: 1rem;">₹${product.price.toFixed(2)}</strong>
            ${product.originalPrice ? `<span style="text-decoration: line-through; color: var(--text-sub); font-size: 0.8rem; margin-left: 4px;">₹${product.originalPrice.toFixed(2)}</span>` : ''}
          </td>
          <td>
            <span class="status-badge ${isActive ? 'status-active' : 'status-inactive'}" onclick="toggleProduct('${product.productId}', ${!isActive})">
              ${isActive ? '● Active' : '○ Disabled'}
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

  // Toggle active status
  window.toggleProduct = async function(productId, newStatus) {
    await boomiService.toggleProductStatus(productId, newStatus);
    showToast(newStatus ? 'Product activated' : 'Product disabled', 'success');
    await loadAdminProducts();
  };

  // Delete product
  window.deleteProduct = async function(productId) {
    if (confirm('Are you sure you want to delete this firecracker product from the catalogue?')) {
      await boomiService.deleteProduct(productId);
      showToast('Product deleted successfully', 'success');
      await loadAdminProducts();
    }
  };

  // Modal open for ADD
  if (btnAddNewProduct) {
    btnAddNewProduct.addEventListener('click', () => {
      modalTitle.textContent = 'Add New Firecracker Product';
      productForm.reset();
      editProductId.value = '';
      prodIsActive.checked = true;
      prodIsFeatured.checked = false;
      prodImagePreview.src = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80';
      prodImageUrl.value = 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80';
      productModal.classList.add('active');
    });
  }

  // Modal open for EDIT
  window.openEditModal = function(productId) {
    const product = allProducts.find(p => p.productId === productId || p.id === productId);
    if (!product) return;

    modalTitle.textContent = 'Edit Product Details';
    editProductId.value = product.productId || product.id;
    prodNameEn.value = product.name || '';
    prodNameTa.value = product.nameTa || '';
    prodCategory.value = product.category || 'sparklers';
    prodPrice.value = product.price || '';
    prodOriginalPrice.value = product.originalPrice || '';
    prodImageUrl.value = product.image || '';
    prodImagePreview.src = product.image || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80';
    prodDescription.value = product.description || '';
    
    // Specifications
    const specs = product.specifications || {};
    prodPiecesBox.value = specs.piecesPerBox || '';
    prodSoundLevel.value = specs.soundLevel || '';
    prodSafetyDistance.value = specs.safetyDistance || '';

    prodIsActive.checked = product.isActive !== false;
    prodIsFeatured.checked = Boolean(product.featured);

    productModal.classList.add('active');
  };

  // Handle Image File Upload Preview (Data URL)
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
      if (e.target.value) {
        prodImagePreview.src = e.target.value;
      }
    });
  }

  // Close modals
  function closeAllModals() {
    productModal.classList.remove('active');
    settingsModal.classList.remove('active');
  }

  if (btnCloseModal) btnCloseModal.addEventListener('click', closeAllModals);
  if (btnCancelModal) btnCancelModal.addEventListener('click', closeAllModals);
  if (btnCloseSettings) btnCloseSettings.addEventListener('click', closeAllModals);
  if (btnCancelSettings) btnCancelSettings.addEventListener('click', closeAllModals);

  // Save / Submit Product Form
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = editProductId.value;
      const productData = {
        name: prodNameEn.value.trim(),
        nameTa: prodNameTa.value.trim(),
        category: prodCategory.value,
        price: Number(prodPrice.value),
        originalPrice: Number(prodOriginalPrice.value) || (Number(prodPrice.value) * 2),
        image: prodImageUrl.value.trim() || 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=800&q=80',
        description: prodDescription.value.trim(),
        specifications: {
          piecesPerBox: prodPiecesBox.value.trim() || '1 Box',
          soundLevel: prodSoundLevel.value.trim() || 'Festive Standard',
          safetyDistance: prodSafetyDistance.value.trim() || '5 Meters',
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

      closeAllModals();
      await loadAdminProducts();
    });
  }

  // Settings Modal logic
  if (btnOpenSettings) {
    btnOpenSettings.addEventListener('click', () => {
      const settings = boomiService.getStoreSettings();
      const fb = boomiService.getFirebaseConfig();

      document.getElementById('settingsStoreNameTa').value = settings.name || '';
      document.getElementById('settingsStoreNameEn').value = settings.nameEn || '';
      document.getElementById('settingsWhatsapp').value = settings.whatsappNumber || '';
      document.getElementById('settingsPhone').value = settings.primaryPhone || '';
      document.getElementById('settingsLocation').value = settings.location || '';
      document.getElementById('settingsFirebaseJson').value = JSON.stringify(fb, null, 2);

      settingsModal.classList.add('active');
    });
  }

  if (settingsForm) {
    settingsForm.addEventListener('submit', (e) => {
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

      showToast('Store settings saved successfully!', 'success');
      closeAllModals();
    });
  }

  // Reset / Seed defaults button
  if (btnSeedDefaults) {
    btnSeedDefaults.addEventListener('click', async () => {
      if (confirm('This will load/restore the full Sivakasi cracker collection (Sparklers, Chakkars, Pots, Shots, etc.). Continue?')) {
        await boomiService.resetToSeedData();
        showToast('Catalogue restored with initial Sivakasi products!', 'success');
        closeAllModals();
        await loadAdminProducts();
      }
    });
  }

  // Search & Filter listeners
  if (adminSearchInput) {
    adminSearchInput.addEventListener('input', renderTable);
  }
  if (adminCategoryFilter) {
    adminCategoryFilter.addEventListener('change', renderTable);
  }

  // Toast helper
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

    setTimeout(() => {
      toast.remove();
    }, 3500);
  }

  // Initialize
  initCategories();
  await loadAdminProducts();
});
