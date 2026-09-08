/**
 * Boomi Crackers - Firebase & Data Service
 * Handles Firestore synchronization with resilient LocalStorage fallback
 */

class BoomiDataService {
  constructor() {
    this.storageKey = 'boomi_products_catalog';
    this.configKey = 'boomi_store_settings';
    this.firebaseConfigKey = 'boomi_firebase_custom_config';
    this.db = null;
    this.isFirebaseReady = false;
    this.init();
  }

  getConfig() {
    return window.BOOMI_CONFIG || window.BUMI_CONFIG;
  }

  init() {
    // Check if custom Firebase config exists in localStorage
    const customFbConfig = localStorage.getItem(this.firebaseConfigKey) || localStorage.getItem('bumi_firebase_custom_config');
    const cfg = this.getConfig();
    let activeFbConfig = cfg ? cfg.firebase : null;

    if (customFbConfig) {
      try {
        activeFbConfig = JSON.parse(customFbConfig);
      } catch (e) {
        console.warn("Could not parse saved Firebase config", e);
      }
    }

    // Try initializing Firebase if SDK is loaded and credentials are not default placeholder
    if (typeof firebase !== 'undefined' && activeFbConfig && activeFbConfig.apiKey && !activeFbConfig.apiKey.includes('DummyKey')) {
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(activeFbConfig);
        }
        this.db = firebase.firestore();
        this.isFirebaseReady = true;
        console.log("Firebase Firestore initialized successfully.");
      } catch (err) {
        console.warn("Firebase initialization skipped or failed. Falling back to local offline storage.", err);
        this.isFirebaseReady = false;
      }
    } else {
      this.isFirebaseReady = false;
    }

    // Initialize local storage seed if empty
    this.ensureLocalSeedData();
  }

  ensureLocalSeedData() {
    const cfg = this.getConfig();
    if (!cfg) return;

    // Version key — increment to force-refresh localStorage when images/data change
    const DATA_VERSION = 'v6-boomi-brand';
    const storedVersion = localStorage.getItem('boomi_data_version') || localStorage.getItem('bumi_data_version');

    const existing = localStorage.getItem(this.storageKey) || localStorage.getItem('bumi_products_catalog');

    if (!existing || storedVersion !== DATA_VERSION) {
      // Fresh install OR version changed — load from config
      localStorage.setItem(this.storageKey, JSON.stringify(cfg.initialProducts));
      localStorage.removeItem(this.configKey); // Reset any old cached store settings
      localStorage.removeItem('bumi_store_settings');
      localStorage.setItem('boomi_data_version', DATA_VERSION);
    } else {
      try {
        const parsed = JSON.parse(existing);
        // Also refresh if old Unsplash images, incomplete data, or corrupted Tamil text
        const hasMojibake = parsed.length > 0 && parsed[0].nameTa && parsed[0].nameTa.includes('à®');
        if (parsed.length < 172 || !parsed[0].image || hasMojibake || (parsed[0].productId && parsed[0].productId.startsWith('bumi-'))) {
          localStorage.setItem(this.storageKey, JSON.stringify(cfg.initialProducts));
          localStorage.removeItem(this.configKey);
          localStorage.removeItem('bumi_store_settings');
          localStorage.setItem('boomi_data_version', DATA_VERSION);
        }
      } catch (e) {
        localStorage.setItem(this.storageKey, JSON.stringify(cfg.initialProducts));
        localStorage.removeItem(this.configKey);
        localStorage.removeItem('bumi_store_settings');
        localStorage.setItem('boomi_data_version', DATA_VERSION);
      }
    }
  }

  // Retrieve store settings (name, phone, whatsapp, location)
  getStoreSettings() {
    const cfg = this.getConfig();
    const defaultStore = cfg ? cfg.store : {};
    const custom = localStorage.getItem(this.configKey) || localStorage.getItem('bumi_store_settings');
    if (custom) {
      try {
        const parsed = JSON.parse(custom);
        if (parsed.nameEn === 'Bumi Crackers') {
          parsed.nameEn = 'Boomi Crackers';
        }
        return { ...defaultStore, ...parsed };
      } catch (e) {
        return defaultStore;
      }
    }
    return defaultStore;
  }

  // Update store settings
  saveStoreSettings(newSettings) {
    localStorage.setItem(this.configKey, JSON.stringify(newSettings));
    return newSettings;
  }

  // Save custom Firebase config
  saveFirebaseConfig(newFbConfig) {
    localStorage.setItem(this.firebaseConfigKey, JSON.stringify(newFbConfig));
    return newFbConfig;
  }

  // Retrieve saved Firebase config
  getFirebaseConfig() {
    const cfg = this.getConfig();
    const custom = localStorage.getItem(this.firebaseConfigKey) || localStorage.getItem('bumi_firebase_custom_config');
    if (custom) {
      try {
        return JSON.parse(custom);
      } catch (e) {
        return cfg ? cfg.firebase : {};
      }
    }
    return cfg ? cfg.firebase : {};
  }

  // Get all products (with optional filter for active only)
  async getProducts(activeOnly = false) {
    const cfg = this.getConfig();
    if (this.isFirebaseReady && this.db) {
      try {
        let query = this.db.collection('products');
        if (activeOnly) {
          query = query.where('isActive', '==', true);
        }
        const snapshot = await query.get();
        if (!snapshot.empty) {
          const products = [];
          snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
          });
          // Cache to localStorage
          localStorage.setItem(this.storageKey, JSON.stringify(products));
          return products;
        }
      } catch (err) {
        console.warn("Error fetching from Firebase, using cached local data:", err);
      }
    }

    // Fallback to localStorage / initial data
    try {
      const cfg = this.getConfig();
      const initial = cfg ? cfg.initialProducts : [];
      const stored = localStorage.getItem(this.storageKey);
      let products = stored ? JSON.parse(stored) : initial;
      if (activeOnly) {
        products = products.filter(p => p.isActive !== false);
      }
      return products;
    } catch (e) {
      console.error("Local data parse error", e);
      const cfg = this.getConfig();
      return cfg ? cfg.initialProducts : [];
    }
  }

  // Get single product by ID
  async getProductById(productId) {
    const products = await this.getProducts(false);
    return products.find(p => p.productId === productId || p.id === productId);
  }

  // Add new product
  async addProduct(product) {
    const newProduct = {
      productId: product.productId || `boomi-${Date.now()}`,
      name: product.name || 'New Cracker',
      nameTa: product.nameTa || '',
      price: Number(product.price) || 0,
      originalPrice: Number(product.originalPrice) || (Number(product.price) * 2),
      category: product.category || 'sparklers',
      image: product.image || 'assets/images/sparklers.jpg',
      description: product.description || '',
      specifications: product.specifications || {},
      featured: Boolean(product.featured),
      isActive: product.isActive !== false,
      createdAt: new Date().toISOString()
    };

    if (this.isFirebaseReady && this.db) {
      try {
        await this.db.collection('products').doc(newProduct.productId).set(newProduct);
      } catch (err) {
        console.error("Firebase add error:", err);
      }
    }

    // Always update local storage
    const products = await this.getProducts(false);
    products.unshift(newProduct);
    localStorage.setItem(this.storageKey, JSON.stringify(products));
    return newProduct;
  }

  // Update existing product
  async updateProduct(productId, updatedFields) {
    let updatedProduct = null;

    if (this.isFirebaseReady && this.db) {
      try {
        await this.db.collection('products').doc(productId).update({
          ...updatedFields,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error("Firebase update error:", err);
      }
    }

    const products = await this.getProducts(false);
    const index = products.findIndex(p => p.productId === productId || p.id === productId);
    if (index !== -1) {
      products[index] = {
        ...products[index],
        ...updatedFields,
        updatedAt: new Date().toISOString()
      };
      updatedProduct = products[index];
      localStorage.setItem(this.storageKey, JSON.stringify(products));
    }

    return updatedProduct;
  }

  // Delete product
  async deleteProduct(productId) {
    if (this.isFirebaseReady && this.db) {
      try {
        await this.db.collection('products').doc(productId).delete();
      } catch (err) {
        console.error("Firebase delete error:", err);
      }
    }

    let products = await this.getProducts(false);
    products = products.filter(p => p.productId !== productId && p.id !== productId);
    localStorage.setItem(this.storageKey, JSON.stringify(products));
    return true;
  }

  // Toggle active / inactive status
  async toggleProductStatus(productId, isActive) {
    return this.updateProduct(productId, { isActive });
  }

  // Reset / Seed defaults
  async resetToSeedData() {
    const cfg = this.getConfig();
    const initial = cfg ? cfg.initialProducts : [];
    localStorage.setItem(this.storageKey, JSON.stringify(initial));
    
    if (this.isFirebaseReady && this.db) {
      try {
        const batch = this.db.batch();
        initial.forEach(prod => {
          const docRef = this.db.collection('products').doc(prod.productId);
          batch.set(docRef, prod);
        });
        await batch.commit();
      } catch (err) {
        console.warn("Could not batch write seed data to Firebase:", err);
      }
    }
    return initial;
  }
}

// Global instance (with backward-compatible alias)
window.boomiService = new BoomiDataService();
window.bumiService = window.boomiService;
