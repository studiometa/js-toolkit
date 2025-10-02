import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
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
    it('should initialize with stored value', () => {
      localStorage.setItem('test-key', JSON.stringify('stored-value'));
      const storage = useLocalStorage('test-key', 'default');
      expect(storage.value).toBe('stored-value');
    });

    it('should initialize with default value when no stored value exists', () => {
      const storage = useLocalStorage('test-key', 'default');
      expect(storage.value).toBe('default');
    });

    it('should update storage when value changes', () => {
      const storage = useLocalStorage('test-key', 'initial');
      storage.value = 'updated';
      expect(localStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
    });

    it('should remove storage when value is set to null', () => {
      const storage = useLocalStorage('test-key', 'initial');
      storage.value = null;
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('should work with complex objects', () => {
      const storage = useLocalStorage<{ name: string; age: number }>('user', {
        name: 'John',
        age: 30,
      });
      expect(storage.value).toEqual({ name: 'John', age: 30 });
      storage.value = { name: 'Jane', age: 25 };
      expect(JSON.parse(localStorage.getItem('user')!)).toEqual({ name: 'Jane', age: 25 });
    });

    it('should trigger onChange callback when value changes', () => {
      const onChange = vi.fn();
      const storage = useLocalStorage('test-key', 'initial', { onChange });
      storage.value = 'updated';
      expect(onChange).toHaveBeenCalledWith('updated');
    });

    it('should support subscribe method', () => {
      const storage = useLocalStorage('test-key', 'initial');
      const callback = vi.fn();
      const unsubscribe = storage.subscribe(callback);

      storage.value = 'updated';
      expect(callback).toHaveBeenCalledWith('updated');

      unsubscribe();
      storage.value = 'another';
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should clean up event listeners on destroy', () => {
      const storage = useLocalStorage('test-key', 'initial');
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      storage.destroy();
      expect(removeEventListenerSpy).toHaveBeenCalledWith('storage', expect.any(Function));
      removeEventListenerSpy.mockRestore();
    });

    it('should use custom serializer', () => {
      const serializer = {
        serialize: (value: string) => `custom:${value}`,
        deserialize: (value: string) => value.replace('custom:', ''),
      };
      const storage = useLocalStorage('test-key', 'initial', { serializer });
      storage.value = 'test';
      expect(localStorage.getItem('test-key')).toBe('custom:test');
    });
  });

  describe('useSessionStorage', () => {
    it('should initialize with stored value', () => {
      sessionStorage.setItem('test-key', JSON.stringify('stored-value'));
      const storage = useSessionStorage('test-key', 'default');
      expect(storage.value).toBe('stored-value');
    });

    it('should initialize with default value when no stored value exists', () => {
      const storage = useSessionStorage('test-key', 'default');
      expect(storage.value).toBe('default');
    });

    it('should update storage when value changes', () => {
      const storage = useSessionStorage('test-key', 'initial');
      storage.value = 'updated';
      expect(sessionStorage.getItem('test-key')).toBe(JSON.stringify('updated'));
    });

    it('should remove storage when value is set to null', () => {
      const storage = useSessionStorage('test-key', 'initial');
      storage.value = null;
      expect(sessionStorage.getItem('test-key')).toBeNull();
    });

    it('should trigger onChange callback when value changes', () => {
      const onChange = vi.fn();
      const storage = useSessionStorage('test-key', 'initial', { onChange });
      storage.value = 'updated';
      expect(onChange).toHaveBeenCalledWith('updated');
    });
  });

  describe('useUrlSearchParams', () => {
    it('should initialize with default value when no URL param exists', () => {
      const storage = useUrlSearchParams('test-key', 'default');
      expect(storage.value).toBe('default');
    });

    it('should trigger onChange callback when value changes', () => {
      const onChange = vi.fn();
      const storage = useUrlSearchParams('test-key', 'initial', { onChange });
      storage.value = 'updated';
      expect(onChange).toHaveBeenCalledWith('updated');
    });

    it('should call provider set method when value changes', () => {
      const setSpy = vi.spyOn(urlSearchParamsProvider, 'set');
      const storage = useUrlSearchParams('test-key', 'initial');
      storage.value = 'updated';
      expect(setSpy).toHaveBeenCalledWith('test-key', JSON.stringify('updated'));
      setSpy.mockRestore();
    });

    it('should call provider remove method when value is null', () => {
      const removeSpy = vi.spyOn(urlSearchParamsProvider, 'remove');
      const storage = useUrlSearchParams('test-key', 'initial');
      storage.value = null;
      expect(removeSpy).toHaveBeenCalledWith('test-key');
      removeSpy.mockRestore();
    });
  });

  describe('useUrlSearchParamsInHash', () => {
    it('should initialize with hash param value', () => {
      window.location.hash = '#test-key=%22hash-value%22';
      const storage = useUrlSearchParamsInHash('test-key', 'default');
      expect(storage.value).toBe('hash-value');
    });

    it('should initialize with default value when no hash param exists', () => {
      const storage = useUrlSearchParamsInHash('test-key', 'default');
      expect(storage.value).toBe('default');
    });

    it('should update hash when value changes', () => {
      const storage = useUrlSearchParamsInHash('test-key', 'initial');
      storage.value = 'updated';
      const params = new URLSearchParams(window.location.hash.slice(1));
      expect(params.get('test-key')).toBe(JSON.stringify('updated'));
    });

    it('should remove param from hash when value is set to null', () => {
      const storage = useUrlSearchParamsInHash('test-key', 'value');
      storage.value = null;
      const params = new URLSearchParams(window.location.hash.slice(1));
      expect(params.has('test-key')).toBe(false);
    });

    it('should call provider set method when value changes', () => {
      const setSpy = vi.spyOn(urlSearchParamsInHashProvider, 'set');
      const storage = useUrlSearchParamsInHash('test-key', 'initial');
      storage.value = 'updated';
      expect(setSpy).toHaveBeenCalledWith('test-key', JSON.stringify('updated'));
      setSpy.mockRestore();
    });

    it('should trigger onChange callback when value changes', () => {
      const onChange = vi.fn();
      const storage = useUrlSearchParamsInHash('test-key', 'initial', { onChange });
      storage.value = 'updated';
      expect(onChange).toHaveBeenCalledWith('updated');
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
      const storage = useLocalStorage('test-key', 'initial');
      const callback = vi.fn();
      storage.subscribe(callback);

      // Simulate storage event from another tab
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: JSON.stringify('from-another-tab'),
        storageArea: localStorage,
      });
      window.dispatchEvent(event);

      expect(storage.value).toBe('from-another-tab');
      expect(callback).toHaveBeenCalledWith('from-another-tab');
    });

    it('should sync sessionStorage changes from storage events', () => {
      const storage = useSessionStorage('test-key', 'initial');
      const callback = vi.fn();
      storage.subscribe(callback);

      // Simulate storage event from another tab
      const event = new StorageEvent('storage', {
        key: 'test-key',
        newValue: JSON.stringify('from-another-tab'),
        storageArea: sessionStorage,
      });
      window.dispatchEvent(event);

      expect(storage.value).toBe('from-another-tab');
      expect(callback).toHaveBeenCalledWith('from-another-tab');
    });

    it('should listen to popstate events', () => {
      const addEventListener = vi.spyOn(window, 'addEventListener');
      const storage = useUrlSearchParams('test-key', 'initial');
      expect(addEventListener).toHaveBeenCalledWith('popstate', expect.any(Function));
      addEventListener.mockRestore();
    });

    it('should sync hash params on hashchange event', () => {
      const storage = useUrlSearchParamsInHash('test-key', 'initial');
      const callback = vi.fn();
      storage.subscribe(callback);

      window.location.hash = '#test-key=%22hash-value%22';
      window.dispatchEvent(new HashChangeEvent('hashchange'));

      expect(storage.value).toBe('hash-value');
      expect(callback).toHaveBeenCalledWith('hash-value');
    });
  });
});
