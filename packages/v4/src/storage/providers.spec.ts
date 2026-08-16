import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DIAGNOSTICS, type ToolkitDiagnosticDetail } from '../diagnostic-contract.js';
import { EVENTS } from '../events.js';
import {
  createUrlSearchParamsInHashProvider,
  createUrlSearchParamsProvider,
  localStorageProvider,
  sessionStorageProvider,
  urlSearchParamsInHashProvider,
  urlSearchParamsProvider,
} from './providers.js';

/** Collect diagnostics dispatched while `during` runs, and silence the default sink. */
function captureDiagnostics(during: () => void): ToolkitDiagnosticDetail[] {
  const seen: ToolkitDiagnosticDetail[] = [];
  const listener = (event: Event) => {
    seen.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
    event.preventDefault();
  };
  document.addEventListener(EVENTS.diagnostic, listener);
  try {
    during();
  } finally {
    document.removeEventListener(EVENTS.diagnostic, listener);
  }
  return seen;
}

/**
 * Replace the area getter with one that throws, as a browser refusing storage
 * to this document does. The provider resolves `globalThis[name]` per call, so
 * a denied area is a failure of every method, not of construction.
 */
function denyStorageArea(name: 'localStorage' | 'sessionStorage'): () => void {
  const descriptor = Object.getOwnPropertyDescriptor(globalThis, name);
  Object.defineProperty(globalThis, name, {
    configurable: true,
    get() {
      throw new DOMException('Access to storage is denied for this document.', 'SecurityError');
    },
  });
  return () => {
    if (descriptor) {
      Object.defineProperty(globalThis, name, descriptor);
    } else {
      Reflect.deleteProperty(globalThis, name);
    }
  };
}

const webStorages = [
  { name: 'localStorage', provider: localStorageProvider },
  { name: 'sessionStorage', provider: sessionStorageProvider },
] as const;

describe.each(webStorages)('the $name provider', ({ name, provider }) => {
  afterEach(() => {
    vi.restoreAllMocks();
    globalThis[name].clear();
  });

  it('round-trips through the six methods against the real area', () => {
    expect(provider.keys()).toEqual([]);

    provider.set('theme', 'dark');
    expect(globalThis[name].getItem('theme')).toBe('dark');
    expect(provider.get('theme')).toBe('dark');
    expect(provider.has('theme')).toBe(true);

    provider.set('mode', 'compact');
    expect(provider.keys().toSorted()).toEqual(['mode', 'theme']);

    provider.remove('theme');
    expect(provider.get('theme')).toBeNull();
    expect(provider.has('theme')).toBe(false);

    provider.clear();
    expect(provider.keys()).toEqual([]);
  });

  it('names the event announcing a write from another tab', () => {
    expect(provider.syncEvents).toEqual(['storage']);
  });

  it('reports a rejected write instead of throwing, and writes nothing', () => {
    const quotaExceeded = new DOMException('The quota has been exceeded.', 'QuotaExceededError');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw quotaExceeded;
    });

    const diagnostics = captureDiagnostics(() => {
      expect(() => provider.set('theme', 'dark')).not.toThrow();
    });

    expect(diagnostics.map((detail) => detail.code)).toEqual([DIAGNOSTICS.storage.accessFailed]);
    expect(diagnostics[0].error).toBe(quotaExceeded);
    vi.restoreAllMocks();
    expect(provider.get('theme')).toBeNull();
  });

  it('falls back on every method when the area is denied', () => {
    const restore = denyStorageArea(name);
    const results: unknown[] = [];

    try {
      const diagnostics = captureDiagnostics(() => {
        expect(() => {
          results.push(provider.get('theme'));
          results.push(provider.has('theme'));
          results.push(provider.keys());
          provider.set('theme', 'dark');
          provider.remove('theme');
          provider.clear();
        }).not.toThrow();
      });

      // One report per operation: a silent write is data loss, so nothing is
      // deduplicated away.
      expect(diagnostics.map((detail) => detail.code)).toEqual(
        Array.from({ length: 6 }, () => DIAGNOSTICS.storage.accessFailed),
      );
    } finally {
      restore();
    }

    expect(results).toEqual([null, false, []]);
  });
});

describe('the query-string provider', () => {
  let initial: string;

  beforeEach(() => {
    initial = location.href;
    // The pathname is left alone: the page is served by the test runner.
    history.replaceState({}, '', `${location.pathname}?a=one#section`);
  });

  afterEach(() => {
    history.replaceState({}, '', initial);
  });

  it('round-trips through the six methods against `location.search`', () => {
    expect(urlSearchParamsProvider.get('a')).toBe('one');
    expect(urlSearchParamsProvider.keys()).toEqual(['a']);

    urlSearchParamsProvider.set('theme', 'dark');
    expect(location.search).toBe('?a=one&theme=dark');
    expect(urlSearchParamsProvider.get('theme')).toBe('dark');
    expect(urlSearchParamsProvider.has('theme')).toBe(true);
    expect(urlSearchParamsProvider.keys()).toEqual(['a', 'theme']);

    urlSearchParamsProvider.remove('theme');
    expect(urlSearchParamsProvider.get('theme')).toBeNull();
    expect(urlSearchParamsProvider.has('theme')).toBe(false);

    urlSearchParamsProvider.clear();
    expect(location.search).toBe('');
    expect(urlSearchParamsProvider.keys()).toEqual([]);
  });

  it('keeps the hash, which it does not own', () => {
    urlSearchParamsProvider.set('theme', 'dark');
    expect(location.hash).toBe('#section');

    urlSearchParamsProvider.remove('theme');
    expect(location.hash).toBe('#section');

    urlSearchParamsProvider.clear();
    expect(location.hash).toBe('#section');
  });

  it('names the events announcing a navigation', () => {
    expect(urlSearchParamsProvider.syncEvents).toEqual(['popstate']);
  });

  it('replaces the current history entry, and pushes one only when asked', () => {
    const replacing = history.length;
    urlSearchParamsProvider.set('theme', 'dark');
    expect(history.length).toBe(replacing);

    const pushing = history.length;
    createUrlSearchParamsProvider({ push: true }).set('mode', 'compact');
    expect(location.search).toBe('?a=one&theme=dark&mode=compact');
    expect(history.length).toBe(pushing + 1);
  });
});

describe('the hash provider', () => {
  let initial: string;

  beforeEach(() => {
    initial = location.href;
    history.replaceState({}, '', `${location.pathname}?a=one#b=two`);
  });

  afterEach(() => {
    history.replaceState({}, '', initial);
  });

  it('round-trips through the six methods against `location.hash`', () => {
    expect(urlSearchParamsInHashProvider.get('b')).toBe('two');
    expect(urlSearchParamsInHashProvider.keys()).toEqual(['b']);

    urlSearchParamsInHashProvider.set('theme', 'dark');
    expect(location.hash).toBe('#b=two&theme=dark');
    expect(urlSearchParamsInHashProvider.get('theme')).toBe('dark');
    expect(urlSearchParamsInHashProvider.has('theme')).toBe(true);
    expect(urlSearchParamsInHashProvider.keys()).toEqual(['b', 'theme']);

    urlSearchParamsInHashProvider.remove('theme');
    expect(urlSearchParamsInHashProvider.get('theme')).toBeNull();
    expect(urlSearchParamsInHashProvider.has('theme')).toBe(false);

    urlSearchParamsInHashProvider.clear();
    expect(location.hash).toBe('');
    expect(urlSearchParamsInHashProvider.keys()).toEqual([]);
  });

  it('keeps the query string, which it does not own', () => {
    urlSearchParamsInHashProvider.set('theme', 'dark');
    expect(location.search).toBe('?a=one');

    urlSearchParamsInHashProvider.remove('theme');
    expect(location.search).toBe('?a=one');

    urlSearchParamsInHashProvider.clear();
    expect(location.search).toBe('?a=one');
  });

  it('names both events a hash write can be announced by', () => {
    expect(urlSearchParamsInHashProvider.syncEvents).toEqual(['hashchange', 'popstate']);
  });

  it('replaces the current history entry, and pushes one only when asked', () => {
    const replacing = history.length;
    urlSearchParamsInHashProvider.set('theme', 'dark');
    expect(history.length).toBe(replacing);

    const pushing = history.length;
    createUrlSearchParamsInHashProvider({ push: true }).set('mode', 'compact');
    expect(location.hash).toBe('#b=two&theme=dark&mode=compact');
    expect(history.length).toBe(pushing + 1);
  });
});
