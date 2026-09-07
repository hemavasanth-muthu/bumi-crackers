/**
 * Bumi Crackers - Firebase & Data Service
 * Handles Firestore synchronization with resilient LocalStorage fallback
 */

class BumiDataService {
  constructor() {
    this.storageKey = 'bumi_products_catalog';
    this.configKey = 'bumi_store_settings';
    this.firebaseConfigKey = 'bumi_firebase_custom_config';
    this.db = null;
    this.isFirebaseReady = false;
    this.init();
  }

  init() {
    // Check if custom Firebase config exists in localStorage
    const customFbConfig = localStorage.getItem(this.firebaseConfigKey);
    let activeFbConfig = BUMI_CONFIG.firebase;

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
    // Version key — increment to force-refresh localStorage when images/data change
    const DATA_VERSION = 'v5-tamil-clean';
    const storedVersion = localStorage.getItem('bumi_data_version');

    const existing = localStorage.getItem(this.storageKey);

    if (!existing || storedVersion !== DATA_VERSION) {
      // Fresh install OR version changed — load from config
      localStorage.setItem(this.storageKey, JSON.stringify(BUMI_CONFIG.initialProducts));
      localStorage.removeItem(this.configKey); // Reset any old cached store settings
      localStorage.setItem('bumi_data_version', DATA_VERSION);
    } else {
      try {
        const parsed = JSON.parse(existing);
        // Also refresh if old Unsplash images, incomplete data, or corrupted Tamil text
        const hasMojibake = parsed.length > 0 && parsed[0].nameTa && parsed[0].nameTa.includes('à®');
        if (parsed.length < 172 || !parsed[0].image || hasMojibake) {
          localStorage.setItem(this.storageKey, JSON.stringify(BUMI_CONFIG.initialProducts));
          localStorage.removeItem(this.configKey);
          localStorage.setItem('bumi_data_version', DATA_VERSION);
        }
      } catch (e) {
        localStorage.setItem(this.storageKey, JSON.stringify(BUMI_CONFIG.initialProducts));
        localStorage.removeItem(this.configKey);
        localStorage.setItem('bumi_data_version', DATA_VERSION);
      }
    }
  }

  // Retrieve store settings (name, phone, whatsapp, location)
  getStoreSettings() {
    const custom = localStorage.getItem(this.configKey);
    if (custom) {
      try {
        return { ...BUMI_CONFIG.store, ...JSON.parse(custom) };
      } catch (e) {
        return BUMI_CONFIG.store;
      }
    }
    return BUMI_CONFIG.store;
  }

  // Update store settings
  saveStoreSettings(newSettings) {
    localStorage.setItem(this.configKey, JSON.stringify(newSettings));
    return newSettings;
  }

  // Save custom Firebase config
  saveFirebaseConfig(newFbConfig) {
    localStorage.setItem(this.firebaseConfigKey, JSON.stringify(newFbConfig));
    this.init();
  }

  getFirebaseConfig() {
    const custom = localStorage.getItem(this.firebaseConfigKey);
    if (custom) {
      try {
        return JSON.parse(custom);
      } catch (e) {
        return BUMI_CONFIG.firebase;
      }
    }
    return BUMI_CONFIG.firebase;
  }

  // Get all products (with optional filter for active only)
  async getProducts(activeOnly = false) {
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
      const stored = localStorage.getItem(this.storageKey);
      let products = stored ? JSON.parse(stored) : BUMI_CONFIG.initialProducts;
      if (activeOnly) {
        products = products.filter(p => p.isActive !== false);
      }
      return products;
    } catch (e) {
      console.error("Local data parse error", e);
      return BUMI_CONFIG.initialProducts;
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
      productId: product.productId || `bumi-${Date.now()}`,
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
    localStorage.setItem(this.storageKey, JSON.stringify(BUMI_CONFIG.initialProducts));
    
    if (this.isFirebaseReady && this.db) {
      try {
        const batch = this.db.batch();
        BUMI_CONFIG.initialProducts.forEach(prod => {
          const docRef = this.db.collection('products').doc(prod.productId);
          batch.set(docRef, prod);
        });
        await batch.commit();
      } catch (err) {
        console.warn("Could not batch write seed data to Firebase:", err);
      }
    }
    return BUMI_CONFIG.initialProducts;
  }
}

// Global instance
window.bumiService = new BumiDataService();
