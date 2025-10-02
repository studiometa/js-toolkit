import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  useLocalStorage,
  useSessionStorage,
  useUrlSearchParams,
  useUrlSearchParamsInHash,
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
      const setSpy = vi.spyOn(urlSearchParamsProvider, 'set');

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

    it('should handle sessionStorage provider correctly', () => {
      expect(sessionStorageProvider.get('non-existent')).toBeNull();
      sessionStorageProvider.set('test', 'value');
      expect(sessionStorageProvider.get('test')).toBe('value');
      expect(sessionStorageProvider.has('test')).toBe(true);
      sessionStorageProvider.remove('test');
      expect(sessionStorageProvider.has('test')).toBe(false);
    });

    it('should handle urlSearchParams provider correctly', () => {
      window.history.replaceState({}, '', '/');
      expect(urlSearchParamsProvider.get('non-existent')).toBeNull();
      const setSpy = vi.spyOn(window.history, 'pushState');
      urlSearchParamsProvider.set('test', 'value');
      expect(setSpy).toHaveBeenCalled();
      setSpy.mockRestore();
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
    });

    it('should sync sessionStorage changes from storage events', () => {
      type Storage = { token: string };
      const storage = useSessionStorage<Storage>();
      const callback = vi.fn();
      storage.subscribe('token', callback);

      // Simulate storage event from another tab
      const event = new StorageEvent('storage', {
        key: 'token',
        newValue: JSON.stringify('new-token'),
        storageArea: sessionStorage,
      });
      window.dispatchEvent(event);

      expect(callback).toHaveBeenCalledWith('new-token');
    });
  });
});
