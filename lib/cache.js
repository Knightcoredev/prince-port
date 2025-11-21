const fs = require('fs').promises;
const path = require('path');

// In-memory cache for frequently accessed data
const memoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 100; // Maximum number of cached items

// File-based cache directory
const CACHE_DIR = path.join(process.cwd(), '.cache');

/**
 * Ensure cache directory exists
 */
async function ensureCacheDir() {
  try {
    await fs.access(CACHE_DIR);
  } catch {
    await fs.mkdir(CACHE_DIR, { recursive: true });
  }
}

/**
 * Generate cache key from parameters
 */
function generateCacheKey(prefix, params = {}) {
  const sortedParams = Object.keys(params)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});
  
  return `${prefix}_${Buffer.from(JSON.stringify(sortedParams)).toString('base64')}`;
}

/**
 * Memory cache operations
 */
class MemoryCache {
  static set(key, value, ttl = CACHE_TTL) {
    // Clean up expired entries if cache is getting full
    if (memoryCache.size >= MAX_CACHE_SIZE) {
      this.cleanup();
    }
    
    const expiresAt = Date.now() + ttl;
    memoryCache.set(key, {
      value,
      expiresAt,
      createdAt: Date.now()
    });
  }
  
  static get(key) {
    const cached = memoryCache.get(key);
    
    if (!cached) {
      return null;
    }
    
    // Check if expired
    if (Date.now() > cached.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    
    return cached.value;
  }
  
  static delete(key) {
    return memoryCache.delete(key);
  }
  
  static clear() {
    memoryCache.clear();
  }
  
  static cleanup() {
    const now = Date.now();
    for (const [key, cached] of memoryCache.entries()) {
      if (now > cached.expiresAt) {
        memoryCache.delete(key);
      }
    }
  }
  
  static getStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;
    
    for (const cached of memoryCache.values()) {
      if (now > cached.expiresAt) {
        expired++;
      } else {
        active++;
      }
    }
    
    return {
      total: memoryCache.size,
      active,
      expired,
      maxSize: MAX_CACHE_SIZE
    };
  }
}

/**
 * File cache operations
 */
class FileCache {
  static async set(key, value, ttl = CACHE_TTL) {
    try {
      await ensureCacheDir();
      
      const cacheData = {
        value,
        expiresAt: Date.now() + ttl,
        createdAt: Date.now()
      };
      
      const filePath = path.join(CACHE_DIR, `${key}.json`);
      await fs.writeFile(filePath, JSON.stringify(cacheData));
      
      return true;
    } catch (error) {
      console.error('File cache set error:', error);
      return false;
    }
  }
  
  static async get(key) {
    try {
      const filePath = path.join(CACHE_DIR, `${key}.json`);
      const data = await fs.readFile(filePath, 'utf8');
      const cached = JSON.parse(data);
      
      // Check if expired
      if (Date.now() > cached.expiresAt) {
        await this.delete(key);
        return null;
      }
      
      return cached.value;
    } catch (error) {
      // File doesn't exist or is corrupted
      return null;
    }
  }
  
  static async delete(key) {
    try {
      const filePath = path.join(CACHE_DIR, `${key}.json`);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  static async clear() {
    try {
      await ensureCacheDir();
      const files = await fs.readdir(CACHE_DIR);
      
      await Promise.all(
        files
          .filter(file => file.endsWith('.json'))
          .map(file => fs.unlink(path.join(CACHE_DIR, file)))
      );
      
      return true;
    } catch (error) {
      console.error('File cache clear error:', error);
      return false;
    }
  }
  
  static async cleanup() {
    try {
      await ensureCacheDir();
      const files = await fs.readdir(CACHE_DIR);
      const now = Date.now();
      
      for (const file of files) {
        if (!file.endsWith('.json')) continue;
        
        try {
          const filePath = path.join(CACHE_DIR, file);
          const data = await fs.readFile(filePath, 'utf8');
          const cached = JSON.parse(data);
          
          if (now > cached.expiresAt) {
            await fs.unlink(filePath);
          }
        } catch (error) {
          // Delete corrupted files
          await fs.unlink(path.join(CACHE_DIR, file));
        }
      }
      
      return true;
    } catch (error) {
      console.error('File cache cleanup error:', error);
      return false;
    }
  }
}

/**
 * Unified cache interface
 */
class Cache {
  /**
   * Get from cache (memory first, then file)
   */
  static async get(key) {
    // Try memory cache first
    const memoryResult = MemoryCache.get(key);
    if (memoryResult !== null) {
      return memoryResult;
    }
    
    // Try file cache
    const fileResult = await FileCache.get(key);
    if (fileResult !== null) {
      // Store in memory cache for faster access
      MemoryCache.set(key, fileResult);
      return fileResult;
    }
    
    return null;
  }
  
  /**
   * Set in both memory and file cache
   */
  static async set(key, value, ttl = CACHE_TTL) {
    MemoryCache.set(key, value, ttl);
    await FileCache.set(key, value, ttl);
  }
  
  /**
   * Delete from both caches
   */
  static async delete(key) {
    MemoryCache.delete(key);
    await FileCache.delete(key);
  }
  
  /**
   * Clear both caches
   */
  static async clear() {
    MemoryCache.clear();
    await FileCache.clear();
  }
  
  /**
   * Cleanup expired entries
   */
  static async cleanup() {
    MemoryCache.cleanup();
    await FileCache.cleanup();
  }
  
  /**
   * Get cache statistics
   */
  static getStats() {
    return {
      memory: MemoryCache.getStats(),
      ttl: CACHE_TTL,
      cacheDir: CACHE_DIR
    };
  }
}

/**
 * Cache wrapper for functions
 */
function withCache(fn, options = {}) {
  const {
    keyPrefix = 'fn',
    ttl = CACHE_TTL,
    useFileCache = true
  } = options;
  
  return async function(...args) {
    const cacheKey = generateCacheKey(keyPrefix, { args });
    
    // Try to get from cache
    const cached = useFileCache ? await Cache.get(cacheKey) : MemoryCache.get(cacheKey);
    if (cached !== null) {
      return cached;
    }
    
    // Execute function and cache result
    const result = await fn(...args);
    
    if (useFileCache) {
      await Cache.set(cacheKey, result, ttl);
    } else {
      MemoryCache.set(cacheKey, result, ttl);
    }
    
    return result;
  };
}

/**
 * Cache invalidation patterns
 */
class CacheInvalidation {
  static async invalidatePattern(pattern) {
    // Memory cache invalidation
    for (const key of memoryCache.keys()) {
      if (key.includes(pattern)) {
        memoryCache.delete(key);
      }
    }
    
    // File cache invalidation
    try {
      await ensureCacheDir();
      const files = await fs.readdir(CACHE_DIR);
      
      for (const file of files) {
        if (file.includes(pattern) && file.endsWith('.json')) {
          await fs.unlink(path.join(CACHE_DIR, file));
        }
      }
    } catch (error) {
      console.error('Cache invalidation error:', error);
    }
  }
  
  static async invalidateBlogCache() {
    await this.invalidatePattern('blog');
  }
  
  static async invalidateProjectCache() {
    await this.invalidatePattern('project');
  }
  
  static async invalidateContactCache() {
    await this.invalidatePattern('contact');
  }
}

// Periodic cleanup (every 10 minutes)
setInterval(() => {
  Cache.cleanup().catch(console.error);
}, 10 * 60 * 1000);

module.exports = {
  Cache,
  MemoryCache,
  FileCache,
  CacheInvalidation,
  withCache,
  generateCacheKey
};