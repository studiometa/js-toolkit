import { afterEach, vi } from 'vitest';

class MatchMedia {
  mediaQueries = {};
  mediaQueryList = {};
  currentMediaQuery = '';
  constructor() {
    this.mediaQueries = {};
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: (query) => {
        this.mediaQueryList = {
          matches: query === this.currentMediaQuery,
          media: query,
          onchange: null,
          addListener: (listener) => {
            this.addListener(query, listener);
          },
          removeListener: (listener) => {
            this.removeListener(query, listener);
          },
          addEventListener: (type, listener) => {
            if (type !== 'change') return;
            this.addListener(query, listener);
          },
          removeEventListener: (type, listener) => {
            if (type !== 'change') return;
            this.removeListener(query, listener);
          },
          dispatchEvent: vi.fn(),
        };
        return this.mediaQueryList;
      },
    });
  }
  /**
   * Adds a new listener function for the specified media query
   * @private
   */
  addListener(mediaQuery, listener) {
    if (!this.mediaQueries[mediaQuery]) {
      this.mediaQueries[mediaQuery] = [];
    }
    const query = this.mediaQueries[mediaQuery];
    const listenerIndex = query.indexOf(listener);
    if (listenerIndex !== -1) return;
    query.push(listener);
  }
  /**
   * Removes a previously added listener function for the specified media query
   * @private
   */
  removeListener(mediaQuery, listener) {
    if (!this.mediaQueries[mediaQuery]) return;
    const query = this.mediaQueries[mediaQuery];
    const listenerIndex = query.indexOf(listener);
    if (listenerIndex === -1) return;
    query.splice(listenerIndex, 1);
  }
  /**
   * Updates the currently used media query,
   * and calls previously added listener functions registered for this media query
   * @public
   */
  useMediaQuery(mediaQuery) {
    if (typeof mediaQuery !== 'string') throw new Error('Media Query must be a string');
    this.currentMediaQuery = mediaQuery;
    if (!this.mediaQueries[mediaQuery]) return;
    const mqListEvent = {
      matches: true,
      media: mediaQuery,
    };
    this.mediaQueries[mediaQuery].forEach((listener) => {
      listener.call(this.mediaQueryList, mqListEvent);
    });
  }
  /**
   * Returns an array listing the media queries for which the matchMedia has registered listeners
   * @public
   */
  getMediaQueries() {
    return Object.keys(this.mediaQueries);
  }
  /**
   * Returns a copy of the array of listeners for the specified media query
   * @public
   */
  getListeners(mediaQuery) {
    if (!this.mediaQueries[mediaQuery]) return [];
    return this.mediaQueries[mediaQuery].slice();
  }
  /**
   * Clears all registered media queries and their listeners
   * @public
   */
  clear() {
    this.mediaQueries = {};
  }
  /**
   * Clears all registered media queries and their listeners,
   * and destroys the implementation of `window.matchMedia`
   * @public
   */
  destroy() {
    this.clear();
    delete window.matchMedia;
  }
}

const defaultMediaQuery = '(min-width: 80rem)';
// @ts-ignore
const matchMedia = new MatchMedia();

export function useMatchMedia(mediaQuery = defaultMediaQuery) {
  matchMedia.useMediaQuery(mediaQuery);

  return matchMedia;
}

export function resetMatchMedia() {
  matchMedia.useMediaQuery(defaultMediaQuery);
}

afterEach(() => {
  resetMatchMedia();
});
