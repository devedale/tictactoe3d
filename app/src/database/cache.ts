import Redis from 'ioredis';

/** Singleton class for managing a Redis client. */
class RedisClient {
  private static instance: RedisClient;
  private client: Redis;

  /** Private constructor to initialize the Redis client. */
  private constructor() {
    const redisURL = process.env.REDIS_URL || 'localhost';
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

    this.client = new Redis({
      host: redisURL,
      port: redisPort,
    });

    this.client.on('error', (err) => {
      console.error('Redis error:', err);
    });

    // Binding methods to ensure correct `this` context
    this.setInCache = this.setInCache.bind(this);
    this.getFromCache = this.getFromCache.bind(this);
    this.deleteFromCache = this.deleteFromCache.bind(this);

    // Configure eviction policy on instantiation
    this.configureEvictionPolicy();
  }

  /**
   * Gets the singleton instance of the RedisClient.
   *
   * @returns {RedisClient} The RedisClient instance.
   */
  public static getInstance(): RedisClient {
    if (!RedisClient.instance) {
      RedisClient.instance = new RedisClient();
    }
    return RedisClient.instance;
  }

  /**
   * Sets a value in the Redis cache.
   *
   * @param {string} key - The key under which the value is stored.
   * @param {string} value - The value to store in the cache.
   */
  public setInCache(key: string, value: string): void {
    this.client.set(key, value);
  }

  /**
   * Retrieves a value from the Redis cache.
   *
   * @param {string} key - The key associated with the value to retrieve.
   * @returns {Promise<string | null>} The cached value, or null if not found or an error occurs.
   */
  public async getFromCache(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      console.error('Error getting value from cache:', error);
      return null; // Return null or handle it as appropriate
    }
  }

  /**
   * Deletes a value from the Redis cache.
   *
   * @param {string} key - The key of the value to delete.
   */
  public deleteFromCache(key: string): void {
    this.client.del(key);
  }

  /**
   * Configures the eviction policy for Redis. Sets maximum memory to 512mb and eviction policy to 'allkeys-lru'.
   *
   * @returns {Promise<void>} A promise that resolves when configuration is complete.
   */
  private async configureEvictionPolicy(): Promise<void> {
    try {
      await this.client.config('SET', 'maxmemory', '512mb');
      await this.client.config('SET', 'maxmemory-policy', 'allkeys-lru');
      console.log('Redis eviction policy configured to allkeys-lru with maxmemory 512mb');
    } catch (err) {
      console.error('Failed to configure Redis eviction policy:', err);
    }
  }
}

// Instantiate and export the singleton RedisClient instance
const redisClient = RedisClient.getInstance();
export default redisClient;
