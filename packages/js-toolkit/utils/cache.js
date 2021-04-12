/**
 * @typedef {Object} CacheItem
 * @property {number | boolean} expire
 * @property {unknown} data
 */

/**
 * Cache Class
 */
export default class Cache {
  /**
   * The name of the cache.
   * @type {string}
   */
  name;

  /**
   * The cache store.
   * @type {{ [cacheKey:string]: CacheItem }}
   */
  store = {};

  /**
   * The TTL for any cache item, false for infinity.
   * @type {number|boolean}
   */
  expire;

  /**
   * Class constructor.
   * @param  {Object} options
   * @param  {string} options.name The name of the cache.
   * @param  {number} options.ttl
   * The time to live in minutes of any cache item.
   */
  constructor({ name, ttl = 0 }) {
    this.name = name;
    this.expire = ttl === 0 ? false : ttl * 1000 * 60;
  }

  /**
   * Get an item by key.
   * @param  {string}  key The key of the item.
   * @return {unknown}     The saved item or undefined if its TTL has expired.
   */
  get(key) {
    const now = Date.now();
    const value = this.store[key];
    if (value === undefined || (value.expire !== false && value.expire < now)) {
      return undefined;
    }
    return value.data;
  }

  /**
   * Set an item.
   * @param {String} key   The key of the item.
   * @param {*}      value The value of the item.
   */
  set(key, value) {
    const now = Date.now();
    this.store[key] = {
      // @ts-ignore
      expire: this.expire === false ? false : now + this.expire,
      data: value,
    };
  }

  /**
   * Remove an item by its key.
   * @param  {String} key The key of the item.
   */
  remove(key) {
    delete this.store[key];
  }

  /**
   * Clear the cache.
   */
  clear() {
    this.store = {};
  }
}
