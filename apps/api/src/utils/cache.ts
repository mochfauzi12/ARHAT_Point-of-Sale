// Simple in-memory cache for API optimization
// In a real production environment, replace this with Redis

interface CacheItem {
  value: any;
  expiry: number;
}

class Cache {
  private store: Map<string, CacheItem> = new Map();

  /**
   * Set a value in the cache
   * @param key Cache key
   * @param value Value to cache
   * @param ttl Time to live in seconds (default: 60)
   */
  set(key: string, value: any, ttl: number = 60) {
    const expiry = Date.now() + ttl * 1000;
    this.store.set(key, { value, expiry });
  }

  /**
   * Get a value from the cache
   * @param key Cache key
   * @returns The cached value, or null if not found/expired
   */
  get(key: string): any | null {
    const item = this.store.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.store.delete(key);
      return null;
    }

    return item.value;
  }

  /**
   * Delete a value from the cache
   */
  del(key: string) {
    this.store.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.store.clear();
  }
}

export const memoryCache = new Cache();
