import { afterEach, describe, expect, it, vi } from 'vitest';
import { Base } from './Base.js';
import { subscribeContext } from './context-subscription.js';
import { createContext, provideContext, provideRootContext, type ContextKey } from './context.js';
import { registerComponent } from './registry.js';
import { getInstance, resetDom, settle } from './test-utils.js';

afterEach(resetDom);

interface Registry {
  name: string;
}

function requiredCallbackTypeAssertion(key: ContextKey<string>): void {
  // @ts-expect-error The subscription callback is required.
  subscribeContext(document.documentElement, key);
}

void requiredCallbackTypeAssertion;

function render(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  return root;
}

function defineScope(name: string, key: ContextKey<Registry>, value?: Registry) {
  class Scope extends Base {
    static config = { name };

    registry = this.$provide(key, value ?? { name: this.$el.id });
  }
  registerComponent(Scope);
  return Scope;
}

describe('subscribeContext', () => {
  it('delivers an available first answer synchronously with its unsubscribe', () => {
    const key = createContext<Registry>('immediate-subscription');
    const root = render('<span></span>');
    const consumer = root.querySelector('span') as Element;
    const provided = { name: 'root' };
    provideContext(root, key, provided);

    const seen: Registry[] = [];
    let callbackUnsubscribe: (() => void) | undefined;
    const unsubscribe = subscribeContext(consumer, key, (value, stop) => {
      seen.push(value);
      callbackUnsubscribe = stop;
    });

    expect(seen).toEqual([provided]);
    expect(callbackUnsubscribe).toBe(unsubscribe);
    unsubscribe();
  });

  it('waits for a late first answer', () => {
    const key = createContext<Registry>('late-subscription');
    const root = render('<span></span>');
    const consumer = root.querySelector('span') as Element;
    const seen: Registry[] = [];
    const unsubscribe = subscribeContext(consumer, key, (value) => {
      seen.push(value);
    });

    expect(seen).toEqual([]);
    const provided = { name: 'late' };
    provideContext(root, key, provided);
    expect(seen).toEqual([provided]);
    unsubscribe();
  });

  it('delivers nothing after unsubscribe before the first answer', () => {
    const key = createContext<Registry>('cancelled-subscription');
    const root = render('<span></span>');
    const consumer = root.querySelector('span') as Element;
    const seen: Registry[] = [];
    const unsubscribe = subscribeContext(consumer, key, (value) => {
      seen.push(value);
    });

    unsubscribe();
    provideContext(root, key, { name: 'late' });
    expect(seen).toEqual([]);
  });

  it('uses the nearest provider and supports the root fallback', () => {
    const key = createContext<Registry>('subscription-scope');
    const root = render('<div id="scope"><span></span></div>');
    const scope = root.querySelector('#scope') as Element;
    const consumer = root.querySelector('span') as Element;
    provideRootContext(key, () => ({ name: 'page' }));
    provideContext(scope, key, { name: 'scope' });

    const seen: string[] = [];
    const unsubscribe = subscribeContext(consumer, key, (value) => {
      seen.push(value.name);
    });

    expect(seen).toEqual(['scope']);
    unsubscribe();
  });

  it('lets a nearer mounted provider reclaim a resolved consumer', async () => {
    const key = createContext<Registry>('reanswer');
    defineScope('ReanswerScope', key);

    class Member extends Base {
      static config = { name: 'ReanswerMember' };

      seen: string[] = [];

      mounted() {
        return subscribeContext(this.$el, key, (registry) => {
          this.seen.push(registry.name);
        });
      }
    }
    registerComponent(Member);
    provideRootContext(key, () => ({ name: 'page' }));

    const root = render(`
      <div id="scope">
        <span data-component="ReanswerMember"></span>
      </div>
    `);
    await settle();

    const member = getInstance<Member>(root.querySelector('span'), 'ReanswerMember');
    expect(member.seen).toEqual(['page']);

    root.querySelector('#scope')?.setAttribute('data-component', 'ReanswerScope');
    await settle();
    expect(member.seen).toEqual(['page', 'scope']);
  });

  it('ignores mounted providers that cannot be nearer', async () => {
    const key = createContext<Registry>('provider-distance');
    defineScope('DistanceScope', key);

    class Member extends Base {
      static config = { name: 'DistanceMember' };

      seen: string[] = [];

      mounted() {
        return subscribeContext(this.$el, key, (registry) => {
          this.seen.push(registry.name);
        });
      }
    }
    registerComponent(Member);

    const root = render(`
      <div id="outer">
        <div id="inner" data-component="DistanceScope">
          <span data-component="DistanceMember"></span>
        </div>
      </div>
      <div id="elsewhere"></div>
    `);
    await settle();

    const member = getInstance<Member>(root.querySelector('span'), 'DistanceMember');
    expect(member.seen).toEqual(['inner']);

    root.querySelector('#outer')?.setAttribute('data-component', 'DistanceScope');
    root.querySelector('#elsewhere')?.setAttribute('data-component', 'DistanceScope');
    await settle();
    expect(member.seen).toEqual(['inner']);
  });

  it('runs teardown before a changed answer and on unsubscribe', async () => {
    const key = createContext<Registry>('teardown');
    defineScope('TeardownScope', key);
    provideRootContext(key, () => ({ name: 'page' }));

    const root = render('<div id="scope"><span></span></div>');
    const consumer = root.querySelector('span') as Element;
    const log: string[] = [];
    const unsubscribe = subscribeContext(consumer, key, (registry) => {
      log.push(`join:${registry.name}`);
      return () => log.push(`leave:${registry.name}`);
    });
    expect(log).toEqual(['join:page']);

    root.querySelector('#scope')?.setAttribute('data-component', 'TeardownScope');
    await settle();
    expect(log).toEqual(['join:page', 'leave:page', 'join:scope']);

    unsubscribe();
    expect(log).toEqual(['join:page', 'leave:page', 'join:scope', 'leave:scope']);
  });

  it('does not restart teardown when provider ownership changes to the same value', async () => {
    const key = createContext<Registry>('same-value');
    const shared = { name: 'shared' };
    defineScope('SameValueScope', key, shared);
    provideRootContext(key, () => shared);

    const root = render('<div id="scope"><span></span></div>');
    const consumer = root.querySelector('span') as Element;
    const log: string[] = [];
    const unsubscribe = subscribeContext(consumer, key, (registry) => {
      log.push(`join:${registry.name}`);
      return () => log.push(`leave:${registry.name}`);
    });

    root.querySelector('#scope')?.setAttribute('data-component', 'SameValueScope');
    await settle();
    expect(log).toEqual(['join:shared']);

    unsubscribe();
    expect(log).toEqual(['join:shared', 'leave:shared']);
  });

  it('runs a returned teardown when the callback unsubscribes itself', () => {
    const key = createContext<Registry>('self-unsubscribe');
    const root = render('<span></span>');
    const consumer = root.querySelector('span') as Element;
    provideContext(root, key, { name: 'root' });
    const log: string[] = [];

    subscribeContext(consumer, key, (registry, unsubscribe) => {
      log.push(`join:${registry.name}`);
      unsubscribe();
      return () => log.push(`leave:${registry.name}`);
    });

    expect(log).toEqual(['join:root', 'leave:root']);
  });

  it('isolates callback and teardown failures', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const key = createContext<Registry>('failure-isolation');
    const root = render('<span></span>');
    const consumer = root.querySelector('span') as Element;
    provideContext(root, key, { name: 'root' });

    const failed = subscribeContext(consumer, key, () => {
      throw new Error('callback');
    });
    const seen: string[] = [];
    const teardownFailed = subscribeContext(consumer, key, (registry) => {
      seen.push(registry.name);
      return () => {
        throw new Error('teardown');
      };
    });

    failed();
    teardownFailed();
    expect(seen).toEqual(['root']);
    expect(error).toHaveBeenCalledTimes(2);
    error.mockRestore();
  });

  it('does not keep a discarded consumer alive after it was answered', async () => {
    const key = createContext<Registry>('weak-owner');
    const host = render('<div id="host"></div>').querySelector('#host') as Element;
    provideContext(host, key, { name: 'host' });

    const ref = ((): WeakRef<Element> => {
      const el = document.createElement('span');
      host.append(el);
      subscribeContext(el, key, () => {});
      el.remove();
      return new WeakRef(el);
    })();

    const { cdp } = await import('@vitest/browser/context');
    await cdp().send('HeapProfiler.collectGarbage');
    await new Promise((resolve) => setTimeout(resolve, 0));

    // The public requirement is weak ownership. The test does not prescribe
    // how the optional module indexes live subscriptions.
    expect(ref.deref()).toBeUndefined();
  });
});
