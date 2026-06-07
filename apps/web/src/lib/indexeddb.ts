// Custom lightweight wrapper for IndexedDB

const DB_NAME = 'arhat_pos_offline';
const DB_VERSION = 1;

interface SyncQueueItem {
  id?: number;
  url: string;
  method: string;
  body: any;
  timestamp: number;
}

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event: any) => reject(event.target.error);

    request.onsuccess = (event: any) => resolve(event.target.result);

    request.onupgradeneeded = (event: any) => {
      const db: IDBDatabase = event.target.result;
      
      if (!db.objectStoreNames.contains('products_cache')) {
        db.createObjectStore('products_cache', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('customers_cache')) {
        db.createObjectStore('customers_cache', { keyPath: 'id' });
      }
      
      if (!db.objectStoreNames.contains('sync_queue')) {
        db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

export const offlineDB = {
  // Store a list of items (products/customers)
  async saveCache(storeName: string, items: any[]) {
    try {
      const db = await getDB();
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      
      // Clear old cache first to avoid stale deleted items? 
      // For now we just put/update. If we want full clear:
      store.clear();
      
      items.forEach(item => {
        store.put(item);
      });
      
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.warn('Failed to save to cache', e);
    }
  },

  // Get all items from a cache
  async getCache(storeName: string): Promise<any[]> {
    try {
      const db = await getDB();
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('Failed to read from cache', e);
      return [];
    }
  },

  // Add a transaction to the sync queue
  async enqueueSync(url: string, method: string, body: any) {
    try {
      const db = await getDB();
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      
      const item: SyncQueueItem = {
        url,
        method,
        body,
        timestamp: Date.now()
      };
      
      store.add(item);
      
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error('Failed to enqueue sync', e);
    }
  },

  // Get all pending sync items
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const db = await getDB();
      const tx = db.transaction('sync_queue', 'readonly');
      const store = tx.objectStore('sync_queue');
      const request = store.getAll();
      
      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      return [];
    }
  },

  // Remove a synced item from queue
  async dequeueSync(id: number) {
    try {
      const db = await getDB();
      const tx = db.transaction('sync_queue', 'readwrite');
      const store = tx.objectStore('sync_queue');
      store.delete(id);
      
      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve(true);
        tx.onerror = () => reject(tx.error);
      });
    } catch (e) {
      console.error('Failed to dequeue sync', e);
    }
  }
};
