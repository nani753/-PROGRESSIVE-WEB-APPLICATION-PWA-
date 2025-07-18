export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  stock: number;
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  name: string;
  image: string;
}

class IndexedDBManager {
  private dbName = 'ShopPWADB';
  private version = 1;
  private db: IDBDatabase | null = null;
  private _initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this._initPromise) {
      return this._initPromise;
    }

    this._initPromise = this._performInit();
    return this._initPromise;
  }

  private async _performInit(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create products store
        if (!db.objectStoreNames.contains('products')) {
          const productsStore = db.createObjectStore('products', { keyPath: 'id' });
          productsStore.createIndex('category', 'category', { unique: false });
        }

        // Create cart store
        if (!db.objectStoreNames.contains('cart')) {
          db.createObjectStore('cart', { keyPath: 'id' });
        }
      };
    });
  }

  private async _ensureInit(): Promise<void> {
    if (!this.db) {
      await this.init();
    }
  }

  async addProducts(products: Product[]): Promise<void> {
    await this._ensureInit();
    const transaction = this.db!.transaction(['products'], 'readwrite');
    const store = transaction.objectStore('products');
    
    for (const product of products) {
      await store.put(product);
    }
  }

  async getProducts(): Promise<Product[]> {
    await this._ensureInit();
    const transaction = this.db!.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getProduct(id: number): Promise<Product | undefined> {
    await this._ensureInit();
    const transaction = this.db!.transaction(['products'], 'readonly');
    const store = transaction.objectStore('products');
    const request = store.get(id);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getCartItems(): Promise<CartItem[]> {
    await this._ensureInit();
    const transaction = this.db!.transaction(['cart'], 'readonly');
    const store = transaction.objectStore('cart');
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async addToCart(item: CartItem): Promise<void> {
    await this._ensureInit();
    const transaction = this.db!.transaction(['cart'], 'readwrite');
    const store = transaction.objectStore('cart');
    await store.put(item);
  }

  async updateCartItem(id: number, quantity: number): Promise<void> {
    await this._ensureInit();
    const transaction = this.db!.transaction(['cart'], 'readwrite');
    const store = transaction.objectStore('cart');
    const request = store.get(id);
    
    request.onsuccess = () => {
      const item = request.result;
      if (item) {
        item.quantity = quantity;
        store.put(item);
      }
    };
  }

  async removeFromCart(id: number): Promise<void> {
    await this._ensureInit();
    const transaction = this.db!.transaction(['cart'], 'readwrite');
    const store = transaction.objectStore('cart');
    await store.delete(id);
  }

  async clearCart(): Promise<void> {
    await this._ensureInit();
    const transaction = this.db!.transaction(['cart'], 'readwrite');
    const store = transaction.objectStore('cart');
    await store.clear();
  }
}

export const db = new IndexedDBManager();