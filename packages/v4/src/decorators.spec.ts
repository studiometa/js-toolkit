import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';
import {
  Base,
  type ChildrenCollection,
  type ComponentImporter,
  type DelegatedEvent,
  type GlobalEvent,
  type RefEvent,
} from './Base.js';
import { createContext, signal, type Signal } from './context.js';
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
    this.$emit('ping', { answer: 42 });
  }
}

@component({ name: 'DecoParent' })
class DecoParent extends Base {
  // No `components` declaration: @on resolves the child name itself.
  @provide(DecoContext)
  total = signal(0);

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

  byClass: Array<DelegatedEvent<DecoChild, 'ping'>> = [];

  stacked: string[] = [];

  clicks = 0;

  windowLoads: Array<GlobalEvent> = [];

  documentClicks: Array<GlobalEvent<MouseEvent>> = [];

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

  // The class as the target: no string, and the payload is typed from it.
  @on(DecoChild, 'ping')
  handleClassPing(payload: DelegatedEvent<DecoChild, 'ping'>): void {
    this.byClass.push(payload);
  }

  @on('click')
  handleClick(): void {
    this.clicks += 1;
  }

  @on(window, 'load')
  handleWindowLoad(payload: GlobalEvent): void {
    this.windowLoads.push(payload);
  }

  @on(document, 'click')
  handleDocumentClick(payload: GlobalEvent<MouseEvent>): void {
    this.documentClicks.push(payload);
  }
}

/**
 * A component genuinely named `Window`, so the string form and the value form
 * of a global stand side by side in one component with nothing reserved.
 */
@component({ name: 'Window' })
class WindowChild extends Base {}

@component({ name: 'GlobalNames' })
class GlobalNames extends Base {
  childResizes: Array<DelegatedEvent<WindowChild>> = [];

  globalResizes: Array<GlobalEvent> = [];

  @on('Window', 'resize')
  trackChild(payload: DelegatedEvent<WindowChild>): void {
    this.childResizes.push(payload);
  }

  @on(window, 'resize')
  trackGlobal(payload: GlobalEvent): void {
    this.globalResizes.push(payload);
  }
}

/**
 * A list ref is declared and spelled `dots[]` in the markup, but every handler
 * form names it `dots` — the decorator included.
 */
@component({ name: 'DotList', refs: ['dots[]'] })
class DotList extends Base {
  clicked: number[] = [];

  @on('dots', 'click')
  trackDot({ index }: RefEvent): void {
    this.clicked.push(index);
  }
}

@component({ name: 'BaseKind' })
class BaseKind extends Base {}

/**
 * A subclass declaring its own `static config`. It mounts under its own name,
 * so `@on(SubKind, …)` must resolve to `SubKind` and not to what it extends —
 * the merged config is what says so.
 */
@component({ name: 'SubKind' })
class SubKind extends BaseKind {}

@component({ name: 'SubTargetParent' })
class SubTargetParent extends Base {
  seen: Array<DelegatedEvent<SubKind, 'ping'>> = [];

  base: Array<DelegatedEvent<BaseKind, 'ping'>> = [];

  @on(SubKind, 'ping')
  trackSub(payload: DelegatedEvent<SubKind, 'ping'>): void {
    this.seen.push(payload);
  }

  @on(BaseKind, 'ping')
  trackBase(payload: DelegatedEvent<BaseKind, 'ping'>): void {
    this.base.push(payload);
  }
}

registerComponents(
  DecoParent,
  DecoChild,
  GlobalNames,
  WindowChild,
  DotList,
  SubTargetParent,
  BaseKind,
  SubKind,
);

/* ------------------------------------------------------------------------ *
 * `@on`'s overloads, asserted at compile time. Nothing below runs — the
 * assertions are enforced by `npm run lint:types`, whose `tsc -p
 * tsconfig.json` includes `src/**\/*.ts`. They exist because an overload that
 * quietly widened to `any` would still pass every runtime test in this file.
 * ------------------------------------------------------------------------ */

@component({ name: 'TypedKid' })
class TypedKid extends Base<{ $emits: { open: { index: number } } }> {}

class OnOverloads extends Base {
  static config = { name: 'OnOverloads' };

  // A name the platform knows gives the platform's own event…
  @on(window, 'click')
  known(payload: GlobalEvent<MouseEvent>): void {
    expectTypeOf(payload.event).toEqualTypeOf<MouseEvent>();
    expectTypeOf(payload.target).toEqualTypeOf<Window | Document>();
  }

  // …and one it does not know falls back to `Event`, never to `any`.
  @on(window, 'app:ready')
  custom(payload: GlobalEvent): void {
    expectTypeOf(payload.event).toEqualTypeOf<Event>();
  }

  // The class *is* the type: `target` is the component and `payload` is read
  // from its `$emits`, with nothing to annotate.
  @on(TypedKid, 'open')
  byClass(payload: DelegatedEvent<TypedKid, 'open'>): void {
    expectTypeOf(payload.target).toEqualTypeOf<TypedKid>();
    expectTypeOf(payload.payload).toEqualTypeOf<{ index: number }>();
  }

  // @ts-expect-error a `resize` handler is handed a UIEvent, not a KeyboardEvent
  @on(window, 'resize')
  narrowed(payload: GlobalEvent<KeyboardEvent>): void {
    void payload;
  }

  negatives(): void {
    // @ts-expect-error an arbitrary EventTarget matches no overload
    on(document.body, 'click');
    // @ts-expect-error a target value must be followed by an event type
    on(window);
    // @ts-expect-error a lazy `config.components` thunk is not a class
    on(lazyChild, 'ping');
  }
}

/**
 * A lazy `config.components` value. `@on` takes the class, so an author who
 * declared a child as a thunk still imports the class to decorate with it —
 * and the thunk itself is not a target.
 */
const lazyChild: ComponentImporter = () => import('./decorators.js');

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
    expect(parent.received[0].payload).toEqual({ answer: 42 });
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

  it('resolves a component class to the same child its name resolves to', async () => {
    const root = render();
    await settle();

    const parent = getInstance<DecoParent>(root, 'DecoParent');
    const child = getInstance<DecoChild>(
      root.querySelector('[data-component="DecoChild"]'),
      'DecoChild',
    );

    child.ping();
    expect(parent.byClass).toHaveLength(1);
    expect(parent.byClass[0].target).toBe(child);
    expect(parent.byClass[0].payload).toEqual({ answer: 42 });
    // Same event, same delegation: the class form and the string form landed
    // on the very same entry.
    expect(parent.received[0].event).toBe(parent.byClass[0].event);
  });

  it('binds a global target through the same listener as onWindow/onDocument', async () => {
    const root = render();
    await settle();

    const parent = getInstance<DecoParent>(root, 'DecoParent');

    window.dispatchEvent(new Event('load'));
    expect(parent.windowLoads).toHaveLength(1);
    expect(parent.windowLoads[0].target).toBe(window);

    document.body.click();
    expect(parent.documentClicks).toHaveLength(1);
    expect(parent.documentClicks[0].target).toBe(document);
    // A click outside the component's subtree: exactly what the root element
    // listener structurally cannot see.
    expect(parent.clicks).toBe(0);
  });

  it('unbinds a global target on destroy and rebinds it on remount', async () => {
    const root = render();
    await settle();

    const parent = getInstance<DecoParent>(root, 'DecoParent');
    root.remove();
    await settle();
    window.dispatchEvent(new Event('load'));
    expect(parent.windowLoads).toHaveLength(0);

    document.body.append(root);
    await settle();
    window.dispatchEvent(new Event('load'));
    expect(parent.windowLoads).toHaveLength(1);
  });

  it('keeps a component named like a global reachable through the string form', async () => {
    const root = document.createElement('div');
    root.setAttribute('data-component', 'GlobalNames');
    root.innerHTML = '<div data-component="Window"></div>';
    document.body.append(root);
    await settle();

    const parent = getInstance<GlobalNames>(root, 'GlobalNames');
    const childEl = root.querySelector('[data-component="Window"]') as HTMLElement;
    const child = getInstance<WindowChild>(childEl, 'Window');

    // The global target, named by value: the `'Window'` string did not take it.
    window.dispatchEvent(new Event('resize'));
    expect(parent.globalResizes).toHaveLength(1);
    expect(parent.globalResizes[0].target).toBe(window);
    expect(parent.childResizes).toHaveLength(0);

    // The child, named by string: `window` did not take it either. The global
    // handler hears this one too, because a bubbling event dispatched in the
    // document reaches `window` — plain DOM, exactly what
    // `window.addEventListener('resize', …)` would hear.
    childEl.dispatchEvent(new Event('resize', { bubbles: true }));
    expect(parent.childResizes).toHaveLength(1);
    expect(parent.childResizes[0].target).toBe(child);
  });

  it('names a list ref without its [] suffix, like every other handler form', async () => {
    const root = document.createElement('div');
    root.setAttribute('data-component', 'DotList');
    // The attribute carries the suffix; the decorator does not.
    root.innerHTML = '<i data-ref="dots[]"></i><i data-ref="dots[]"></i>';
    document.body.append(root);
    await settle();

    const instance = getInstance<DotList>(root, 'DotList');
    (root.querySelectorAll('i')[1] as HTMLElement).click();
    expect(instance.clicked).toEqual([1]);
  });

  it('resolves a subclass to the name it mounts under, not to its parent', async () => {
    const root = document.createElement('div');
    root.setAttribute('data-component', 'SubTargetParent');
    root.innerHTML = '<div data-component="SubKind"></div><div data-component="BaseKind"></div>';
    document.body.append(root);
    await settle();

    const parent = getInstance<SubTargetParent>(root, 'SubTargetParent');
    const sub = getInstance<SubKind>(root.querySelector('[data-component="SubKind"]'), 'SubKind');
    const base = getInstance<BaseKind>(
      root.querySelector('[data-component="BaseKind"]'),
      'BaseKind',
    );

    sub.$emit('ping');
    expect(parent.seen).toHaveLength(1);
    expect(parent.seen[0].target).toBe(sub);
    // The parent class resolves to its own name, so the subclass's event is
    // not also delivered there.
    expect(parent.base).toHaveLength(0);

    base.$emit('ping');
    expect(parent.base).toHaveLength(1);
    expect(parent.base[0].target).toBe(base);
    expect(parent.seen).toHaveLength(1);
  });

  it('rejects an EventTarget that is neither a global nor a component class', () => {
    const el = document.createElement('div');
    // Refused by the overloads above; refused here too, for the untyped path.
    expect(() => on(el as never, 'click')).toThrow(TypeError);
    // A lazy `config.components` thunk is a function without a `config`, so it
    // is refused by the same guard rather than resolving to a wrong name.
    expect(() => on(lazyChild as never, 'ping')).toThrow(TypeError);
    // The overloads are asserted in `OnOverloads`, which only compiles.
    expect(OnOverloads.config.name).toBe('OnOverloads');
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
