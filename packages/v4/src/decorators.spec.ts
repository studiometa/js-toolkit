import { afterEach, describe, expect, it } from 'vitest';
import { Base, type ChildrenCollection, type DelegatedEvent } from './Base.js';
import { Signal, createContext } from './context.js';
import { children, component, inject, on, provide, read, write } from './decorators.js';
import { registerComponents } from './registry.js';
import { defaultScheduler } from './scheduler.js';
import { getInstance, resetDom, settle } from './test-utils.js';

const DecoContext = createContext<Signal<number>>('deco-context');

@component({ name: 'DecoChild' })
class DecoChild extends Base {
  @inject(DecoContext)
  accessor total: Signal<number> | undefined;

  ping(): void {
    this.$emit('ping', 42);
  }
}

@component({ name: 'DecoParent' })
class DecoParent extends Base {
  // No `components` declaration: @on resolves the child name itself.
  @provide(DecoContext)
  total = new Signal(0);

  @children<DecoChild>('DecoChild', {
    added() {
      this.sync();
    },
    removed() {
      this.sync();
    },
  })
  accessor kids!: ChildrenCollection<DecoChild>;

  received: Array<DelegatedEvent> = [];

  stacked: string[] = [];

  clicks = 0;

  sync(): void {
    this.total.value = this.kids?.size ?? 0;
  }

  @on('DecoChild', 'ping')
  handlePing(payload: DelegatedEvent): void {
    this.received.push(payload);
  }

  @on('DecoChild', 'ping')
  @on('DecoChild', 'pong')
  trackAny({ event }: DelegatedEvent): void {
    this.stacked.push(event.type);
  }

  @on('click')
  handleClick(): void {
    this.clicks += 1;
  }
}

registerComponents(DecoParent, DecoChild);

function render(childCount = 1): HTMLElement {
  const root = document.createElement('div');
  root.setAttribute('data-component', 'DecoParent');
  root.innerHTML = `<div>${'<button data-component="DecoChild">child</button>'.repeat(childCount)}</div>`;
  document.body.append(root);
  return root;
}

afterEach(resetDom);

describe('@component', () => {
  it('sets the config and registers the class', async () => {
    expect(DecoParent.config.name).toBe('DecoParent');

    const root = render();
    await settle();
    // Mounted by the registry without an explicit registerComponent call.
    expect(getInstance(root, 'DecoParent').$isMounted).toBe(true);
  });
});

describe('@on', () => {
  it('delegates child events without a config.components declaration', async () => {
    const root = render();
    await settle();

    const parent = getInstance<DecoParent>(root, 'DecoParent');
    const child = getInstance<DecoChild>(
      root.querySelector('[data-component="DecoChild"]'),
      'DecoChild',
    );

    child.ping();
    expect(parent.received).toHaveLength(1);
    expect(parent.received[0].target).toBe(child);
    expect(parent.received[0].args).toEqual([42]);
  });

  it('stacks several @on declarations on one method', async () => {
    const root = render();
    await settle();

    const parent = getInstance<DecoParent>(root, 'DecoParent');
    const child = getInstance<DecoChild>(
      root.querySelector('[data-component="DecoChild"]'),
      'DecoChild',
    );

    child.ping();
    child.$emit('pong');
    expect(parent.stacked).toEqual(['ping', 'pong']);
    // The single-purpose handler only saw `ping`.
    expect(parent.received).toHaveLength(1);
  });

  it('binds own events on the root element with the one-argument form', async () => {
    const root = render();
    await settle();

    const parent = getInstance<DecoParent>(root, 'DecoParent');
    root.click();
    expect(parent.clicks).toBe(1);
  });

  it('unbinds on destroy and rebinds on remount', async () => {
    const root = render();
    await settle();

    const parent = getInstance<DecoParent>(root, 'DecoParent');
    root.remove();
    await settle();
    root.click();
    expect(parent.clicks).toBe(0);

    document.body.append(root);
    await settle();
    root.click();
    expect(parent.clicks).toBe(1);
  });
});

describe('@children', () => {
  it('exposes a live collection and runs instance-bound callbacks', async () => {
    const root = render(2);
    await settle();

    const parent = getInstance<DecoParent>(root, 'DecoParent');
    expect(parent.kids.size).toBe(2);

    root.querySelector('[data-component="DecoChild"]')?.remove();
    await settle();
    expect(parent.kids.size).toBe(1);
  });
});

describe('@read / @write', () => {
  it('defers the method body to its defaultScheduler phase', async () => {
    const order: string[] = [];

    class Phased extends Base {
      static config = { name: 'Phased' };

      @write
      paint(label: string): void {
        order.push(`write:${label}`);
      }

      @read
      measure(): void {
        order.push('read');
      }
    }

    const el = document.createElement('div');
    document.body.append(el);
    const instance = new Phased(el).$mount();

    instance.paint('a');
    instance.measure();
    // Both scheduled, neither has run yet.
    expect(order).toEqual([]);

    await defaultScheduler.whenIdle();
    // Reads run before writes, whatever the call order.
    expect(order).toEqual(['read', 'write:a']);
  });

  it('cancels a scheduled body when the instance is destroyed', async () => {
    let ran = false;

    class Late extends Base {
      static config = { name: 'Late' };

      @write
      paint(): void {
        ran = true;
      }
    }

    const el = document.createElement('div');
    document.body.append(el);
    const instance = new Late(el).$mount();

    instance.paint();
    instance.$destroy();
    await defaultScheduler.whenIdle();
    expect(ran).toBe(false);
  });
});

describe('@provide / @inject', () => {
  it('shares a signal down the subtree', async () => {
    const root = render(2);
    await settle();

    const parent = getInstance<DecoParent>(root, 'DecoParent');
    const child = getInstance<DecoChild>(
      root.querySelector('[data-component="DecoChild"]'),
      'DecoChild',
    );

    // The @children callbacks published the count through @provide.
    expect(parent.total.value).toBe(2);
    // The child resolved the same signal instance through @inject.
    expect(child.total).toBe(parent.total);
    expect(child.total?.value).toBe(2);

    parent.total.value = 7;
    expect(child.total?.value).toBe(7);
  });
});
