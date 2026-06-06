/**
 * Safe localStorage wrapper with error handling
 */
export class SafeStorage {
  private storage: Storage;

  constructor(storageType: 'localStorage' | 'sessionStorage' = 'localStorage') {
    this.storage = typeof window !== 'undefined' 
      ? window[storageType] 
      : {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
          clear: () => {},
          length: 0,
          key: () => null
        } as Storage;
  }

  /**
   * Get an item from storage
   */
  get<T>(key: string): T | null {
    try {
      const item = this.storage.getItem(key);
      if (item === null) return null;
      return JSON.parse(item);
    } catch {
      return null;
    }
  }

  /**
   * Set an item in storage
   */
  set<T>(key: string, value: T): boolean {
    try {
      this.storage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Remove an item from storage
   */
  remove(key: string): boolean {
    try {
      this.storage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Clear all items from storage
   */
  clear(): boolean {
    try {
      this.storage.clear();
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if storage is available
   */
  isAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      this.storage.setItem(testKey, 'test');
      this.storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all keys in storage
   */
  keys(): string[] {
    try {
      return Object.keys(this.storage);
    } catch {
      return [];
    }
  }

  /**
   * Get storage size in bytes (approximate)
   */
  getSize(): number {
    try {
      let size = 0;
      for (const key in this.storage) {
        if (this.storage.hasOwnProperty(key)) {
          size += this.storage[key].length + key.length;
        }
      }
      return size;
    } catch {
      return 0;
    }
  }
}

// Default instances
export const localStorage = new SafeStorage('localStorage');
export const sessionStorage = new SafeStorage('sessionStorage');

/**
 * Storage utilities for common patterns
 */
export const storageUtils = {
  /**
   * Store data with expiration
   */
  setWithExpiry<T>(key: string, value: T, ttlMs: number): boolean {
    const expiryTime = Date.now() + ttlMs;
    const item = { value, expiry: expiryTime };
    return localStorage.set(key, item);
  },

  /**
   * Get data with expiration check
   */
  getWithExpiry<T>(key: string): T | null {
    const item = localStorage.get<{ value: T; expiry: number }>(key);
    
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      localStorage.remove(key);
      return null;
    }
    
    return item.value;
  },

  /**
   * Store user preferences
   */
  setUserPreference<T>(userId: string, key: string, value: T): boolean {
    const prefKey = `user_${userId}_${key}`;
    return localStorage.set(prefKey, value);
  },

  /**
   * Get user preferences
   */
  getUserPreference<T>(userId: string, key: string): T | null {
    const prefKey = `user_${userId}_${key}`;
    return localStorage.get<T>(prefKey);
  },

  /**
   * Clear user preferences
   */
  clearUserPreferences(userId: string): void {
    const prefix = `user_${userId}_`;
    const keys = localStorage.keys();
    
    keys.forEach(key => {
      if (key.startsWith(prefix)) {
        localStorage.remove(key);
      }
    });
  },

  /**
   * Store auth tokens
   */
  setAuthTokens(accessToken: string, refreshToken: string): boolean {
    const tokens = { accessToken, refreshToken };
    return localStorage.set('auth_tokens', tokens);
  },

  /**
   * Get auth tokens
   */
  getAuthTokens(): { accessToken: string; refreshToken: string } | null {
    return localStorage.get<{ accessToken: string; refreshToken: string }>('auth_tokens');
  },

  /**
   * Clear auth tokens
   */
  clearAuthTokens(): boolean {
    return localStorage.remove('auth_tokens');
  }
};