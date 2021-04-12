/**
 * Cache Class
 */
export default class Cache {
  /**
   * Class constructor.
   * @param   {String} options.name The name of the cache.
   * @param   {number} options.ttl  The time to live of any cache item.
   * @return  {Cache}               A new Cache instance.
   */
  constructor({ name, ttl = 0 }) {
    this.name = name;
    this.store = {};
    this.expire = ttl === 0 ? false : ttl * 1000 * 60;
  }

  /**
   * Get an item by key.
   * @param  {String} key The key of the item.
   * @return {*}          The saved item or undefined if its TTL has expired.
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
