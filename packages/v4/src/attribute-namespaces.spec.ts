import { afterEach, describe, expect, it, vi } from 'vitest';
import { watchAttributeNamespace } from './attribute-namespaces.js';
import { EVENTS } from './events.js';
import { resetDom, settle } from './test-utils.js';
import type { ToolkitDiagnosticDetail } from './diagnostic-contract.js';

const cleanups = new Set<() => void>();

/** One element in the document, so the watcher has something to observe. */
function element(html: string): HTMLElement {
  const host = document.createElement('div');
  host.innerHTML = html;
  const el = host.firstElementChild as HTMLElement;
  document.body.append(host);
  return el;
}

/** A binder recording what it was handed, and what was released. */
function recorder() {
  const bound: string[] = [];
  const released: string[] = [];
  return {
    bound,
    released,
    bind: ({
      qualifier,
      value,
      attribute,
    }: {
      qualifier: string;
      value: string;
      attribute: string;
    }) => {
      bound.push(`${attribute}|${qualifier}|${value}`);
      return () => released.push(attribute);
    },
  };
}

function watched(
  el: Element,
  namespace: string,
  bind: Parameters<typeof watchAttributeNamespace>[2],
  options?: Parameters<typeof watchAttributeNamespace>[3],
): () => void {
  const cleanup = watchAttributeNamespace(el, namespace, bind, options);
  cleanups.add(cleanup);
  return cleanup;
}

afterEach(async () => {
  for (const cleanup of cleanups) {
    cleanup();
  }
  cleanups.clear();
  vi.restoreAllMocks();
  await resetDom();
});

describe('watchAttributeNamespace', () => {
  it('binds the declarations present on subscription, in document order', () => {
    const el = element('<div data-on:click="a" data-other="x" data-on:input.debounce="b"></div>');
    const record = recorder();
    watched(el, 'data-on', record.bind);

    // `data-other` is on the element and outside the namespace, so it is not a
    // declaration however the unfiltered observer reports it.
    expect(record.bound).toEqual([
      'data-on:click|click|a',
      'data-on:input.debounce|input.debounce|b',
    ]);
  });

  it('ignores the bare namespace, which declares nothing', () => {
    const el = element('<div data-on="click" data-once:click="a"></div>');
    const record = recorder();
    watched(el, 'data-on', record.bind);

    expect(record.bound).toEqual([]);
  });

  it('releases then rebinds one attribute rewritten in place', async () => {
    const el = element('<div data-on:click="first"></div>');
    const record = recorder();
    watched(el, 'data-on', record.bind);

    el.setAttribute('data-on:click', 'second');
    await settle();

    expect(record.bound).toEqual(['data-on:click|click|first', 'data-on:click|click|second']);
    expect(record.released).toEqual(['data-on:click']);
  });

  it('releases an attribute that is removed, and binds one that is added', async () => {
    const el = element('<div data-on:click="a"></div>');
    const record = recorder();
    watched(el, 'data-on', record.bind);

    el.removeAttribute('data-on:click');
    await settle();
    expect(record.released).toEqual(['data-on:click']);

    el.setAttribute('data-on:input', 'b');
    await settle();
    expect(record.bound).toEqual(['data-on:click|click|a', 'data-on:input|input|b']);
  });

  it('leaves the declaration order alone when one of them is rewritten', async () => {
    const el = element('<div data-on:click="a" data-on:input="b"></div>');
    const order: string[] = [];
    watched(el, 'data-on', ({ attribute }) => {
      order.push(attribute);
      return undefined;
    });

    // Rewriting the first must not move it behind the second: a `Map` keyed by
    // attribute keeps the position a key already had, and consumers which apply
    // their bindings in order depend on it.
    el.setAttribute('data-on:click', 'c');
    await settle();

    expect(order).toEqual(['data-on:click', 'data-on:input', 'data-on:click']);
  });

  it('releases every binding and stops watching on cleanup', async () => {
    const el = element('<div data-on:click="a" data-on:input="b"></div>');
    const record = recorder();
    const cleanup = watched(el, 'data-on', record.bind);

    cleanup();
    expect(record.released).toEqual(['data-on:click', 'data-on:input']);

    el.setAttribute('data-on:click', 'c');
    await settle();
    expect(record.bound).toHaveLength(2);

    // The cleanup is idempotent, as `watchAttributes()`' is.
    cleanup();
    expect(record.released).toEqual(['data-on:click', 'data-on:input']);
  });

  it('holds nothing for a declaration the binder refused', async () => {
    const el = element('<div data-on:click="bad"></div>');
    const released: string[] = [];
    watched(el, 'data-on', ({ value, attribute }) =>
      value === 'bad' ? undefined : () => released.push(attribute),
    );

    el.setAttribute('data-on:click', 'good');
    await settle();
    el.setAttribute('data-on:click', 'bad');
    await settle();

    // Only the one binding that was built is released.
    expect(released).toEqual(['data-on:click']);
  });

  describe('a declared vocabulary', () => {
    it('binds a known head and warns once for an unknown one', async () => {
      const el = element('<div data-bind:text="a" data-bind:prpo.value="b"></div>');
      const details: ToolkitDiagnosticDetail[] = [];
      document.addEventListener(EVENTS.diagnostic, (event) => {
        details.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
        event.preventDefault();
      });
      const record = recorder();
      watched(el, 'data-bind', record.bind, {
        qualifiers: ['text', 'if', 'prop'],
        component: 'DataBind',
      });

      expect(record.bound).toEqual(['data-bind:text|text|a']);
      expect(details).toHaveLength(1);
      expect(details[0].code).toBe('attribute.unknown-qualifier');
      expect(details[0].severity).toBe('warning');
      expect(details[0].component).toBe('DataBind');
      expect(details[0].message).toContain('prpo');

      // Once per element and per name, whatever the value is rewritten to.
      el.setAttribute('data-bind:prpo.value', 'c');
      await settle();
      expect(details).toHaveLength(1);
    });

    it('validates the head only, so the name after the dot stays open', () => {
      const el = element(
        '<div data-bind:class.is-open="a" data-bind:style.--custom="b" data-bind:prop.value="c"></div>',
      );
      const record = recorder();
      watched(el, 'data-bind', record.bind, { qualifiers: ['class', 'style', 'prop'] });

      // A finite head does not make the whole name enumerable, which is why
      // this namespace is watched rather than registered with the one observer.
      expect(record.bound).toHaveLength(3);
    });

    it('binds anything when no vocabulary is declared', () => {
      const el = element('<div data-on:pointerrawupdate="a" data-on:my-custom-event="b"></div>');
      const record = recorder();
      watched(el, 'data-on', record.bind);

      expect(record.bound).toHaveLength(2);
    });
  });

  it('rejects a second colon instead of binding it as part of the qualifier', async () => {
    // `namespaceQualifier()` returns everything after the first colon
    // unexamined, so an open namespace with no declared vocabulary must reject
    // the second separator itself — nothing else stands between this and
    // `Action` binding a literal `click:s` DOM event.
    const el = element('<div data-on:click:s="a"></div>');
    const details: ToolkitDiagnosticDetail[] = [];
    document.addEventListener(EVENTS.diagnostic, (event) => {
      details.push((event as CustomEvent<ToolkitDiagnosticDetail>).detail);
      event.preventDefault();
    });
    const record = recorder();
    watched(el, 'data-on', record.bind);

    expect(record.bound).toEqual([]);
    expect(details).toHaveLength(1);
    expect(details[0].code).toBe('attribute.unknown-qualifier');

    // Once per element and per name, not re-triggered by a rewrite of the value.
    el.setAttribute('data-on:click:s', 'b');
    await settle();
    expect(record.bound).toEqual([]);
    expect(details).toHaveLength(1);
  });
});
