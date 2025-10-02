/**
 * Simple in-memory cache for API responses to reduce rate limit issues
 */
class APICache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl: number = 30000; // 30 seconds default TTL

  /**
   * Get cached data if available and not expired
   */
  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Set cache data with timestamp
   */
  set(key: string, data: any, customTTL?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    // Auto-expire after TTL
    setTimeout(() => {
      this.cache.delete(key);
    }, customTTL || this.ttl);
  }

  /**
   * Clear specific key or all cache
   */
  clear(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Check if key exists and is valid
   */
  has(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) return false;

    const now = Date.now();
    if (now - cached.timestamp > this.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }
}

// Export singleton instance
export const apiCache = new APICache();

/**
 * Rate limit tracker to prevent excessive API calls
 */
class RateLimitTracker {
  private calls: Map<string, number[]> = new Map();
  private limits: Map<string, { count: number; window: number }> = new Map([
    ['view', { count: 100, window: 60000 }], // 100 calls per minute
    ['transaction', { count: 20, window: 60000 }], // 20 transactions per minute
  ]);

  /**
   * Check if we can make an API call
   */
  canMakeCall(type: string): boolean {
    const limit = this.limits.get(type) || { count: 100, window: 60000 };
    const now = Date.now();
    const callHistory = this.calls.get(type) || [];

    // Filter out old calls outside the window
    const recentCalls = callHistory.filter(
      timestamp => now - timestamp < limit.window
    );

    // Update the history
    this.calls.set(type, recentCalls);

    // Check if we're under the limit
    return recentCalls.length < limit.count;
  }

  /**
   * Track an API call
   */
  trackCall(type: string): void {
    const now = Date.now();
    const callHistory = this.calls.get(type) || [];
    callHistory.push(now);
    this.calls.set(type, callHistory);
  }

  /**
   * Get remaining calls for a type
   */
  getRemainingCalls(type: string): number {
    const limit = this.limits.get(type) || { count: 100, window: 60000 };
    const now = Date.now();
    const callHistory = this.calls.get(type) || [];

    const recentCalls = callHistory.filter(
      timestamp => now - timestamp < limit.window
    );

    return Math.max(0, limit.count - recentCalls.length);
  }
}

export const rateLimitTracker = new RateLimitTracker();

/**
 * Exponential backoff for retrying failed requests
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;

      // Don't retry on specific errors
      if (error.message?.includes('E_RATE_NOT_SET')) {
        throw error;
      }

      // If rate limited, wait longer
      if (error.message?.includes('rate limit') || error.message?.includes('429')) {
        const delay = baseDelay * Math.pow(2, i) * 2; // Double the delay for rate limits
        await new Promise(resolve => setTimeout(resolve, delay));
      } else if (i < maxRetries - 1) {
        // Regular exponential backoff for other errors
        const delay = baseDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}