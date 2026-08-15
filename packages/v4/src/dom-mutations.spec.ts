import { afterEach, describe, expect, it, vi } from 'vitest';
import { Base, type BaseConfig, type OptionChange } from './Base.js';
import { DIAGNOSTICS, type ToolkitDiagnosticDetail } from './diagnostic-contract.js';
import { watchAttributes, whenDOMSettled, type AttributeChange } from './dom-mutations.js';
import { EVENTS } from './events.js';
import { registerComponent } from './registry.js';
import { SWAP_MODES, swap } from './swap.js';
import { getInstance, resetDom } from './test-utils.js';

let counter = 0;

function uniqueName(prefix: string): string {
  counter += 1;
  return `${prefix}${counter}`;
}

const watcherCleanups = new Set<() => void>();

function trackedWatcher(el: Element, callback: (change: AttributeChange) => void): () => void {
  const cleanup = watchAttributes(el, callback);
  watcherCleanups.add(cleanup);
  return cleanup;
}

afterEach(async () => {
  for (const cleanup of watcherCleanups) {
    cleanup();
  }
  watcherCleanups.clear();
  vi.restoreAllMocks();
  await resetDom();
});

describe('whenDOMSettled', () => {
  it('waits for an inserted eager component to mount', async () => {
    const name = uniqueName('SettledEager');
    class Eager extends Base {
      static config = { name };
    }
    registerComponent(Eager);

    const el = document.createElement('div');
    el.setAttribute('data-component', name);
    document.body.append(el);

    await whenDOMSettled();
    expect(el.__base__?.get(name)?.$isMounted).toBe(true);
  });

  it('follows mutations created by eager lifecycle work', async () => {
    const childName = uniqueName('SettledChild');
    const parentName = uniqueName('SettledParent');

    class Child extends Base {
      static config = { name: childName };
    }

    class Parent extends Base {
      static config: BaseConfig = { name: parentName, components: { Child } };

      mounted(): void {
        const child = document.createElement('span');
        child.setAttribute('data-component', childName);
        this.$el.append(child);
      }
    }

    registerComponent(Parent);
    const parent = document.createElement('div');
    parent.setAttribute('data-component', parentName);
    document.body.append(parent);

    await whenDOMSettled();
    const child = parent.firstElementChild;
    expect(child?.__base__?.get(childName)?.$isMounted).toBe(true);
  });

  it('does not wait for a conditional mount strategy', async () => {
    const name = uniqueName('SettledVisible');
    class Visible extends Base {
      static config = { name };
    }
    registerComponent(Visible);

    const el = document.createElement('div');
    el.setAttribute('data-component', name);
    el.setAttribute('data-mount', 'visible');
    el.setAttribute('style', 'position:absolute;top:300vh;width:10px;height:10px');
    document.body.append(el);

    await whenDOMSettled();
    expect(el.__base__?.get(name)).toBeUndefined();
  });

  it('waits for eager teardown caused by removal', async () => {
    const name = uniqueName('SettledRemoval');
    class Removed extends Base {
      static config = { name };
      destroys = 0;
      destroyed(): void {
        this.destroys += 1;
      }
    }
    registerComponent(Removed);

    const el = document.createElement('div');
    el.setAttribute('data-component', name);
    document.body.append(el);
    await whenDOMSettled();
    const instance = el.__base__?.get(name) as Removed;

    el.remove();
    await whenDOMSettled();
    expect(instance.$isMounted).toBe(false);
    expect(instance.destroys).toBe(1);
  });
});

const VIRTUAL_ATTRIBUTE = 'data-on:click';

describe('watchAttributes', () => {
  it('reports additions and removals for every attribute on the element', async () => {
    const el = document.createElement('div');
    document.body.append(el);
    const changes: AttributeChange[] = [];
    trackedWatcher(el, (change) => changes.push(change));

    el.className = 'active';
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'open()');
    await whenDOMSettled();
    expect(changes).toEqual([
      { name: 'class', value: 'active', previousValue: null },
      { name: VIRTUAL_ATTRIBUTE, value: 'open()', previousValue: null },
    ]);

    el.removeAttribute(VIRTUAL_ATTRIBUTE);
    await whenDOMSettled();
    expect(changes.at(-1)).toEqual({
      name: VIRTUAL_ATTRIBUTE,
      value: null,
      previousValue: 'open()',
    });
  });

  it('observes the element only, not descendants or siblings', async () => {
    const el = document.createElement('div');
    const child = el.appendChild(document.createElement('span'));
    const sibling = document.createElement('div');
    document.body.append(el, sibling);
    const changes: AttributeChange[] = [];
    trackedWatcher(el, (change) => changes.push(change));

    child.setAttribute(VIRTUAL_ATTRIBUTE, 'child');
    sibling.setAttribute(VIRTUAL_ATTRIBUTE, 'sibling');
    await whenDOMSettled();
    expect(changes).toEqual([]);

    el.setAttribute(VIRTUAL_ATTRIBUTE, 'own');
    await whenDOMSettled();
    expect(changes).toEqual([{ name: VIRTUAL_ATTRIBUTE, value: 'own', previousValue: null }]);
  });

  it('coalesces same-batch writes against the final value and skips net-zero changes', async () => {
    const el = document.createElement('div');
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'a');
    document.body.append(el);
    const changes: AttributeChange[] = [];
    trackedWatcher(el, (change) => changes.push(change));

    el.setAttribute(VIRTUAL_ATTRIBUTE, 'b');
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'c');
    await whenDOMSettled();
    expect(changes).toEqual([{ name: VIRTUAL_ATTRIBUTE, value: 'c', previousValue: 'a' }]);

    el.setAttribute(VIRTUAL_ATTRIBUTE, 'd');
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'c');
    await whenDOMSettled();
    expect(changes).toHaveLength(1);
  });

  it('returns one idempotent cleanup that discards pending and future changes', async () => {
    const el = document.createElement('div');
    document.body.append(el);
    const changes: AttributeChange[] = [];
    const cleanup = trackedWatcher(el, (change) => changes.push(change));

    el.setAttribute(VIRTUAL_ATTRIBUTE, 'pending');
    cleanup();
    cleanup();
    await whenDOMSettled();

    el.setAttribute(VIRTUAL_ATTRIBUTE, 'future');
    await whenDOMSettled();
    expect(changes).toEqual([]);
  });

  it('supports several independent watchers on one element', async () => {
    const el = document.createElement('div');
    document.body.append(el);
    const first: AttributeChange[] = [];
    const second: AttributeChange[] = [];
    const stopFirst = trackedWatcher(el, (change) => first.push(change));
    trackedWatcher(el, (change) => second.push(change));

    el.setAttribute(VIRTUAL_ATTRIBUTE, 'one');
    await whenDOMSettled();
    stopFirst();
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'two');
    await whenDOMSettled();

    expect(first).toEqual([{ name: VIRTUAL_ATTRIBUTE, value: 'one', previousValue: null }]);
    expect(second).toEqual([
      { name: VIRTUAL_ATTRIBUTE, value: 'one', previousValue: null },
      { name: VIRTUAL_ATTRIBUTE, value: 'two', previousValue: 'one' },
    ]);
  });

  it('isolates callback failures, reports them, and continues other watchers', async () => {
    const el = document.createElement('div');
    document.body.append(el);
    const failure = new Error('watcher failure');
    const diagnostics: ToolkitDiagnosticDetail[] = [];
    el.addEventListener(EVENTS.diagnostic, (event) => {
      event.preventDefault();
      diagnostics.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
    });
    const changes: AttributeChange[] = [];
    trackedWatcher(el, () => {
      throw failure;
    });
    trackedWatcher(el, (change) => changes.push(change));

    el.setAttribute(VIRTUAL_ATTRIBUTE, 'open()');
    await whenDOMSettled();

    expect(diagnostics).toEqual([
      {
        severity: 'error',
        code: DIAGNOSTICS.callback.attributeWatcherFailed,
        message: `The attribute watcher callback for "${VIRTUAL_ATTRIBUTE}" failed.`,
        error: failure,
      },
    ]);
    expect(changes).toEqual([{ name: VIRTUAL_ATTRIBUTE, value: 'open()', previousValue: null }]);
  });

  it('delivers after declared options in the same mutation batch', async () => {
    const name = uniqueName('OrderedAttribute');
    const calls: string[] = [];
    class OrderedAttribute extends Base {
      static config: BaseConfig = { name, options: { label: String } };

      mounted(): () => void {
        return watchAttributes(this.$el, ({ name }) => {
          if (name === VIRTUAL_ATTRIBUTE) {
            calls.push('attribute');
          }
        });
      }

      optionLabelChanged(change: OptionChange): void {
        if (!change.initial) {
          calls.push('option');
        }
      }
    }
    registerComponent(OrderedAttribute);

    const el = document.createElement('div');
    el.setAttribute('data-component', name);
    el.setAttribute('data-option-label', 'before');
    document.body.append(el);
    await whenDOMSettled();

    el.setAttribute(VIRTUAL_ATTRIBUTE, 'open()');
    el.setAttribute('data-option-label', 'after');
    await whenDOMSettled();
    expect(calls).toEqual(['option', 'attribute']);
  });

  it('lets mounted cleanup stop delivery before same-batch termination completes', async () => {
    const name = uniqueName('TerminatedAttribute');
    const calls: string[] = [];
    class TerminatedAttribute extends Base {
      static config = { name };

      mounted(): () => void {
        const stop = watchAttributes(this.$el, () => calls.push('attribute'));
        return () => {
          calls.push('cleanup');
          stop();
        };
      }
    }
    registerComponent(TerminatedAttribute);

    const el = document.createElement('div');
    el.setAttribute('data-component', name);
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'open()');
    document.body.append(el);
    await whenDOMSettled();
    const instance = getInstance<TerminatedAttribute>(el, name);

    el.setAttribute('data-component', '');
    el.setAttribute(VIRTUAL_ATTRIBUTE, 'close()');
    await whenDOMSettled();

    expect(instance.$isTerminated).toBe(true);
    expect(calls).toEqual(['cleanup']);
  });

  it('makes whenDOMSettled follow callback-created attribute changes', async () => {
    const el = document.createElement('div');
    document.body.append(el);
    const names: string[] = [];
    trackedWatcher(el, ({ name }) => {
      names.push(name);
      if (name === 'data-first') {
        el.setAttribute('data-second', 'two');
      }
    });

    el.setAttribute('data-first', 'one');
    await whenDOMSettled();
    expect(names).toEqual(['data-first', 'data-second']);
  });

  it('makes swap wait for an in-place watched attribute rewrite', async () => {
    const container = document.createElement('div');
    container.innerHTML = `<p ${VIRTUAL_ATTRIBUTE}="open()">hello</p>`;
    document.body.append(container);
    const el = container.firstElementChild as HTMLElement;
    const changes: AttributeChange[] = [];
    trackedWatcher(el, (change) => changes.push(change));

    await swap(container, `<p ${VIRTUAL_ATTRIBUTE}="close()">hello</p>`, {
      mode: SWAP_MODES.MORPH,
    });

    expect(container.firstElementChild).toBe(el);
    expect(changes).toEqual([
      { name: VIRTUAL_ATTRIBUTE, value: 'close()', previousValue: 'open()' },
    ]);
  });
});
