import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useLocalStorage,
  useSessionStorage,
  useUrlSearchParams,
  useUrlSearchParamsInHash,
  createStorage,
  createUrlSearchParamsProvider,
  createUrlSearchParamsInHashProvider,
  localStorageProvider,
  sessionStorageProvider,
  urlSearchParamsProvider,
  urlSearchParamsInHashProvider,
} from '@studiometa/js-toolkit/utils';

describe('Storage utilities', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.history.replaceState({}, '', '/');
    window.location.hash = '';
  });

  describe('useLocalStorage', () => {
    it('should handle multiple keys in same instance', () => {
      type Storage = {
        theme: string;
        user: { name: string };
      };

      const storage = useLocalStorage<Storage>();

      storage.set('theme', 'dark');
      storage.set('user', { name: 'John' });

      expect(storage.get('theme')).toBe('dark');
      expect(storage.get('user')).toEqual({ name: 'John' });
      expect(localStorage.getItem('theme')).toBe(JSON.stringify('dark'));
      expect(localStorage.getItem('user')).toBe(JSON.stringify({ name: 'John' }));
    });

    it('should return null for non-existent keys', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>();
      expect(storage.get('theme')).toBeNull();
    });

    it('should return default value for non-existent keys', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>();
      expect(storage.get('theme', 'light')).toBe('light');
    });

    it('should return stored value over default value', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>();
      storage.set('theme', 'dark');
      expect(storage.get('theme', 'light')).toBe('dark');
    });

    it('should remove key when set to null', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>();

      storage.set('theme', 'dark');
      expect(storage.get('theme')).toBe('dark');

      storage.set('theme', null);
      expect(storage.get('theme')).toBeNull();
      expect(localStorage.getItem('theme')).toBeNull();
    });

    it('should trigger subscribers for specific keys', () => {
      type Storage = {
        theme: string;
        lang: string;
      };

      const storage = useLocalStorage<Storage>();
      const themeCallback = vi.fn();
      const langCallback = vi.fn();

      storage.subscribe('theme', themeCallback);
      storage.subscribe('lang', langCallback);

      storage.set('theme', 'dark');
      expect(themeCallback).toHaveBeenCalledWith('dark');
      expect(langCallback).not.toHaveBeenCalled();

      storage.set('lang', 'fr');
      expect(langCallback).toHaveBeenCalledWith('fr');
      expect(themeCallback).toHaveBeenCalledTimes(1);
    });

    it('should unsubscribe correctly', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>();
      const callback = vi.fn();

      const unsubscribe = storage.subscribe('theme', callback);
      storage.set('theme', 'dark');
      expect(callback).toHaveBeenCalledWith('dark');

      unsubscribe();
      storage.set('theme', 'light');
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should use custom serializer', () => {
      type Storage = { count: string };
      const serializer = {
        serialize: (value: any) => `custom:${value}`,
        deserialize: (value: string) => value.replace('custom:', ''),
      };

      const storage = useLocalStorage<Storage>({ serializer });
      storage.set('count', '5');
      expect(localStorage.getItem('count')).toBe('custom:5');
      expect(storage.get('count')).toBe('5');
    });

    it('should clean up event listeners on destroy', () => {
      const storage = useLocalStorage();
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      storage.destroy();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('useSessionStorage', () => {
    it('should handle multiple keys in same instance', () => {
      type Storage = {
        token: string;
        expires: number;
      };

      const storage = useSessionStorage<Storage>();

      storage.set('token', 'abc123');
      storage.set('expires', 3600);

      expect(storage.get('token')).toBe('abc123');
      expect(storage.get('expires')).toBe(3600);
    });

    it('should return default value for non-existent keys', () => {
      type Storage = { token: string };
      const storage = useSessionStorage<Storage>();
      expect(storage.get('token', 'none')).toBe('none');
    });

    it('should trigger subscribers for specific keys', () => {
      type Storage = {
        token: string;
        expires: number;
      };

      const storage = useSessionStorage<Storage>();
      const tokenCallback = vi.fn();

      storage.subscribe('token', tokenCallback);
      storage.set('token', 'abc123');
      expect(tokenCallback).toHaveBeenCalledWith('abc123');
    });
  });

  describe('useUrlSearchParams', () => {
    it('should handle multiple keys in same instance', () => {
      type Storage = {
        page: number;
        sort: string;
      };

      const storage = useUrlSearchParams<Storage>();
      const provider = urlSearchParamsProvider;
      const setSpy = vi.spyOn(provider, 'set');

      storage.set('page', 1);
      storage.set('sort', 'name');

      expect(setSpy).toHaveBeenCalledWith('page', JSON.stringify(1));
      expect(setSpy).toHaveBeenCalledWith('sort', JSON.stringify('name'));

      setSpy.mockRestore();
    });

    it('should trigger subscribers for specific keys', () => {
      type Storage = {
        page: number;
        sort: string;
      };

      const storage = useUrlSearchParams<Storage>();
      const pageCallback = vi.fn();

      storage.subscribe('page', pageCallback);
      storage.set('page', 2);
      expect(pageCallback).toHaveBeenCalledWith(2);
    });

    it('should listen to popstate events', () => {
      const addEventListener = vi.spyOn(window, 'addEventListener');
      const storage = useUrlSearchParams();
      expect(addEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
      addEventListener.mockRestore();
      storage.destroy();
    });

    it('should use replaceState by default', () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
      const storage = useUrlSearchParams();
      storage.set('page' as any, 1);
      expect(replaceStateSpy).toHaveBeenCalled();
      replaceStateSpy.mockRestore();
      storage.destroy();
    });

    it('should use pushState when push option is true', () => {
      const pushStateSpy = vi.spyOn(window.history, 'pushState');
      const storage = useUrlSearchParams({ push: true });
      storage.set('page' as any, 1);
      expect(pushStateSpy).toHaveBeenCalled();
      pushStateSpy.mockRestore();
      storage.destroy();
    });
  });

  describe('useUrlSearchParamsInHash', () => {
    it('should handle multiple keys in same instance', () => {
      type Storage = {
        tab: string;
        view: string;
      };

      const storage = useUrlSearchParamsInHash<Storage>();

      storage.set('tab', 'settings');
      storage.set('view', 'grid');

      expect(storage.get('tab')).toBe('settings');
      expect(storage.get('view')).toBe('grid');
    });

    it('should trigger subscribers for specific keys', () => {
      type Storage = {
        tab: string;
        view: string;
      };

      const storage = useUrlSearchParamsInHash<Storage>();
      const tabCallback = vi.fn();

      storage.subscribe('tab', tabCallback);
      storage.set('tab', 'profile');
      expect(tabCallback).toHaveBeenCalledWith('profile');
    });

    it('should listen to hashchange events', () => {
      const addEventListener = vi.spyOn(window, 'addEventListener');
      const storage = useUrlSearchParamsInHash();
      expect(addEventListener).toHaveBeenCalledWith('hashchange', expect.any(Function));
      addEventListener.mockRestore();
      storage.destroy();
    });

    it('should use replaceState by default', () => {
      const replaceStateSpy = vi.spyOn(window.history, 'replaceState');
      const storage = useUrlSearchParamsInHash();
      storage.set('tab' as any, 'settings');
      expect(replaceStateSpy).toHaveBeenCalled();
      replaceStateSpy.mockRestore();
      storage.destroy();
    });
  });

  describe('Prefix / namespacing', () => {
    it('should prefix keys in localStorage', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>({ prefix: 'myapp:' });

      storage.set('theme', 'dark');
      expect(localStorage.getItem('myapp:theme')).toBe(JSON.stringify('dark'));
      expect(localStorage.getItem('theme')).toBeNull();
      expect(storage.get('theme')).toBe('dark');
    });

    it('should isolate instances with different prefixes', () => {
      type Storage = { theme: string };
      const storageA = useLocalStorage<Storage>({ prefix: 'a:' });
      const storageB = useLocalStorage<Storage>({ prefix: 'b:' });

      storageA.set('theme', 'dark');
      storageB.set('theme', 'light');

      expect(storageA.get('theme')).toBe('dark');
      expect(storageB.get('theme')).toBe('light');
    });

    it('should prefix keys in sessionStorage', () => {
      type Storage = { token: string };
      const storage = useSessionStorage<Storage>({ prefix: 'sess:' });

      storage.set('token', 'abc');
      expect(sessionStorage.getItem('sess:token')).toBe(JSON.stringify('abc'));
      expect(storage.get('token')).toBe('abc');
    });

    it('should work with prefix on remove', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>({ prefix: 'myapp:' });

      storage.set('theme', 'dark');
      expect(localStorage.getItem('myapp:theme')).toBe(JSON.stringify('dark'));

      storage.set('theme', null);
      expect(localStorage.getItem('myapp:theme')).toBeNull();
    });
  });

  describe('has / keys / clear', () => {
    it('should check if a key exists with has()', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>();

      expect(storage.has('theme')).toBe(false);
      storage.set('theme', 'dark');
      expect(storage.has('theme')).toBe(true);
      storage.set('theme', null);
      expect(storage.has('theme')).toBe(false);
    });

    it('should check has() with prefix', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>({ prefix: 'myapp:' });

      storage.set('theme', 'dark');
      expect(storage.has('theme')).toBe(true);
      // The raw key has prefix
      expect(localStorage.getItem('myapp:theme')).not.toBeNull();
    });

    it('should list keys without prefix', () => {
      const storage = useLocalStorage();

      storage.set('a' as any, 1);
      storage.set('b' as any, 2);

      const keys = storage.keys();
      expect(keys).toContain('a');
      expect(keys).toContain('b');
    });

    it('should list keys filtering by prefix', () => {
      // Set some keys directly without prefix
      localStorage.setItem('other', 'value');

      type Storage = { theme: string; lang: string };
      const storage = useLocalStorage<Storage>({ prefix: 'myapp:' });

      storage.set('theme', 'dark');
      storage.set('lang', 'fr');

      const keys = storage.keys();
      expect(keys).toEqual(expect.arrayContaining(['theme', 'lang']));
      expect(keys).not.toContain('other');
      expect(keys).not.toContain('myapp:theme');
    });

    it('should clear all keys without prefix', () => {
      const storage = useLocalStorage();
      storage.set('a' as any, 1);
      storage.set('b' as any, 2);

      storage.clear();
      expect(storage.get('a' as any)).toBeNull();
      expect(storage.get('b' as any)).toBeNull();
      expect(storage.keys()).toEqual([]);
    });

    it('should clear only prefixed keys', () => {
      localStorage.setItem('other', 'keep');

      type Storage = { theme: string; lang: string };
      const storage = useLocalStorage<Storage>({ prefix: 'myapp:' });

      storage.set('theme', 'dark');
      storage.set('lang', 'fr');

      storage.clear();
      expect(storage.get('theme')).toBeNull();
      expect(storage.get('lang')).toBeNull();
      // Non-prefixed key should remain
      expect(localStorage.getItem('other')).toBe('keep');
    });

    it('should notify subscribers on clear', () => {
      type Storage = { theme: string; lang: string };
      const storage = useLocalStorage<Storage>();
      const themeCallback = vi.fn();
      const langCallback = vi.fn();

      storage.subscribe('theme', themeCallback);
      storage.subscribe('lang', langCallback);

      storage.set('theme', 'dark');
      storage.set('lang', 'fr');

      storage.clear();
      expect(themeCallback).toHaveBeenLastCalledWith(null);
      expect(langCallback).toHaveBeenLastCalledWith(null);
    });

    it('should work with sessionStorage', () => {
      type Storage = { token: string };
      const storage = useSessionStorage<Storage>();

      storage.set('token', 'abc');
      expect(storage.has('token')).toBe(true);
      expect(storage.keys()).toContain('token');

      storage.clear();
      expect(storage.has('token')).toBe(false);
      expect(storage.keys()).toEqual([]);
    });

    it('should work with URL search params', () => {
      type Storage = { page: string; sort: string };
      const storage = useUrlSearchParams<Storage>();

      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      storage.set('page', '1');
      storage.set('sort', 'name');

      // Verify set calls replaceState
      expect(replaceSpy).toHaveBeenCalledTimes(2);

      // Clear should call replaceState with no query params
      storage.clear();
      const lastUrl = replaceSpy.mock.calls.at(-1)?.[2] as string;
      expect(lastUrl).not.toContain('page');
      expect(lastUrl).not.toContain('sort');
      replaceSpy.mockRestore();
    });

    it('should work with URL hash params', () => {
      type Storage = { tab: string; view: string };
      const storage = useUrlSearchParamsInHash<Storage>();

      storage.set('tab', 'settings');
      storage.set('view', 'grid');

      expect(storage.has('tab')).toBe(true);
      expect(storage.keys().length).toBeGreaterThanOrEqual(2);

      storage.clear();
      expect(storage.has('tab')).toBe(false);
    });
  });

  describe('Storage providers', () => {
    it('should handle localStorage provider correctly', () => {
      expect(localStorageProvider.get('non-existent')).toBeNull();
      localStorageProvider.set('test', 'value');
      expect(localStorageProvider.get('test')).toBe('value');
      expect(localStorageProvider.has('test')).toBe(true);
      localStorageProvider.remove('test');
      expect(localStorageProvider.has('test')).toBe(false);
    });

    it('should have syncEvent on localStorage provider', () => {
      expect(localStorageProvider.syncEvent).toBe('storage');
    });

    it('should handle sessionStorage provider correctly', () => {
      expect(sessionStorageProvider.get('non-existent')).toBeNull();
      sessionStorageProvider.set('test', 'value');
      expect(sessionStorageProvider.get('test')).toBe('value');
      expect(sessionStorageProvider.has('test')).toBe(true);
      sessionStorageProvider.remove('test');
      expect(sessionStorageProvider.has('test')).toBe(false);
    });

    it('should not have syncEvent on sessionStorage provider (no cross-tab sync)', () => {
      expect(sessionStorageProvider.syncEvent).toBeUndefined();
    });

    it('should handle urlSearchParams provider correctly', () => {
      window.history.replaceState({}, '', '/');
      expect(urlSearchParamsProvider.get('non-existent')).toBeNull();
      const setSpy = vi.spyOn(window.history, 'replaceState');
      urlSearchParamsProvider.set('test', 'value');
      expect(setSpy).toHaveBeenCalled();
      setSpy.mockRestore();
    });

    it('should have syncEvent on urlSearchParams provider', () => {
      expect(urlSearchParamsProvider.syncEvent).toBe('popstate');
    });

    it('should handle urlSearchParamsInHash provider correctly', () => {
      window.location.hash = '';
      expect(urlSearchParamsInHashProvider.get('non-existent')).toBeNull();
      urlSearchParamsInHashProvider.set('test', 'value');
      expect(urlSearchParamsInHashProvider.get('test')).toBe('value');
      expect(urlSearchParamsInHashProvider.has('test')).toBe(true);
      urlSearchParamsInHashProvider.remove('test');
      expect(urlSearchParamsInHashProvider.has('test')).toBe(false);
    });

    it('should have syncEvent on urlSearchParamsInHash provider', () => {
      expect(urlSearchParamsInHashProvider.syncEvent).toBe('hashchange');
    });
  });

  describe('createUrlSearchParamsProvider', () => {
    it('should use replaceState by default', () => {
      const provider = createUrlSearchParamsProvider();
      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      provider.set('key', 'value');
      expect(replaceSpy).toHaveBeenCalled();
      replaceSpy.mockRestore();
    });

    it('should use pushState when push is true', () => {
      const provider = createUrlSearchParamsProvider({ push: true });
      const pushSpy = vi.spyOn(window.history, 'pushState');
      provider.set('key', 'value');
      expect(pushSpy).toHaveBeenCalled();
      pushSpy.mockRestore();
    });

    it('should remove key and clean up URL', () => {
      const provider = createUrlSearchParamsProvider();
      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      provider.set('key', 'value');
      provider.remove('key');
      expect(replaceSpy).toHaveBeenCalledTimes(2);
      replaceSpy.mockRestore();
    });

    it('should preserve hash when setting URL params', () => {
      window.location.hash = 'section';
      const provider = createUrlSearchParamsProvider();
      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      provider.set('key', 'value');
      const url = replaceSpy.mock.calls[0][2] as string;
      expect(url).toContain('#section');
      replaceSpy.mockRestore();
    });
  });

  describe('createUrlSearchParamsInHashProvider', () => {
    it('should use replaceState by default', () => {
      const provider = createUrlSearchParamsInHashProvider();
      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      provider.set('key', 'value');
      expect(replaceSpy).toHaveBeenCalled();
      expect(provider.get('key')).toBe('value');
      replaceSpy.mockRestore();
    });

    it('should use location.hash when push is true', () => {
      const provider = createUrlSearchParamsInHashProvider({ push: true });
      provider.set('key', 'value');
      expect(provider.get('key')).toBe('value');
    });

    it('should remove key with replaceState by default', () => {
      const provider = createUrlSearchParamsInHashProvider();
      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      provider.set('key', 'value');
      provider.remove('key');
      expect(replaceSpy).toHaveBeenCalledTimes(2);
      replaceSpy.mockRestore();
    });
  });

  describe('Event synchronization', () => {
    it('should sync localStorage changes from storage events', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>();
      const callback = vi.fn();
      storage.subscribe('theme', callback);

      // Simulate storage event from another tab
      const event = new StorageEvent('storage', {
        key: 'theme',
        newValue: JSON.stringify('dark'),
        storageArea: localStorage,
      });
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith('dark');
      storage.destroy();
    });

    it('should sync prefixed localStorage changes from storage events', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>({ prefix: 'myapp:' });
      const callback = vi.fn();
      storage.subscribe('theme', callback);

      // Simulate storage event with prefixed key
      const event = new StorageEvent('storage', {
        key: 'myapp:theme',
        newValue: JSON.stringify('dark'),
        storageArea: localStorage,
      });
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith('dark');
      storage.destroy();
    });

    it('should not react to storage events for non-matching prefixed keys', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>({ prefix: 'myapp:' });
      const callback = vi.fn();
      storage.subscribe('theme', callback);

      // Simulate storage event without prefix
      const event = new StorageEvent('storage', {
        key: 'theme',
        newValue: JSON.stringify('dark'),
        storageArea: localStorage,
      });
      window.dispatchEvent(event);

      expect(callback).not.toHaveBeenCalled();
      storage.destroy();
    });

    it('should not sync sessionStorage via storage events (sessionStorage has no cross-tab sync)', () => {
      type Storage = { token: string };
      const storage = useSessionStorage<Storage>();
      const addEventSpy = vi.spyOn(window, 'addEventListener');

      // sessionStorage provider should not register a storage event listener
      const storageListenerCalls = addEventSpy.mock.calls.filter(
        ([event]) => event === 'storage',
      );
      // Only localStorage instances should register storage listeners, not sessionStorage
      const callback = vi.fn();
      storage.subscribe('token', callback);

      const event = new StorageEvent('storage', {
        key: 'token',
        newValue: JSON.stringify('new-token'),
        storageArea: sessionStorage,
      });
      window.dispatchEvent(event);

      // Should NOT be called since sessionStorage has no syncEvent
      expect(callback).not.toHaveBeenCalled();
      addEventSpy.mockRestore();
      storage.destroy();
    });

    it('should not react to sessionStorage events on a localStorage instance', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>();
      const callback = vi.fn();
      storage.subscribe('theme', callback);

      // Simulate a storage event from sessionStorage — should be ignored
      const event = new StorageEvent('storage', {
        key: 'theme',
        newValue: JSON.stringify('dark'),
        storageArea: sessionStorage,
      });
      window.dispatchEvent(event);

      expect(callback).not.toHaveBeenCalled();
      storage.destroy();
    });

    it('should handle storage event with null newValue (key removed)', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>();
      const callback = vi.fn();
      storage.subscribe('theme', callback);

      const event = new StorageEvent('storage', {
        key: 'theme',
        newValue: null,
        storageArea: localStorage,
      });
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith(null);
      storage.destroy();
    });
  });

  describe('JSON deserialize resilience', () => {
    it('should return null for malformed JSON in storage', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>();

      // Manually set invalid JSON
      localStorage.setItem('theme', '{broken json');
      expect(storage.get('theme')).toBeNull();
    });

    it('should return default value when stored JSON is malformed', () => {
      type Storage = { theme: string };
      const storage = useLocalStorage<Storage>();

      localStorage.setItem('theme', '{broken json');
      expect(storage.get('theme', 'light')).toBe('light');
    });
  });

  describe('Custom provider with syncEvent', () => {
    it('should listen to custom syncEvent', () => {
      const addEventSpy = vi.spyOn(window, 'addEventListener');
      const customProvider = {
        syncEvent: 'customevent',
        get: () => null,
        set: () => {},
        remove: () => {},
        has: () => false,
        keys: () => [],
        clear: () => {},
      };

      const storage = createStorage({ provider: customProvider });
      expect(addEventSpy).toHaveBeenCalledWith('customevent', expect.any(Function));
      addEventSpy.mockRestore();
      storage.destroy();
    });

    it('should not add event listener if no syncEvent', () => {
      const addEventSpy = vi.spyOn(window, 'addEventListener');
      const callsBefore = addEventSpy.mock.calls.length;
      const customProvider = {
        get: () => null,
        set: () => {},
        remove: () => {},
        has: () => false,
        keys: () => [],
        clear: () => {},
      };

      const storage = createStorage({ provider: customProvider });
      expect(addEventSpy.mock.calls.length).toBe(callsBefore);
      addEventSpy.mockRestore();
      storage.destroy();
    });
  });
});
