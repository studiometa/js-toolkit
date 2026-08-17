import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  Base,
  type BaseConfig,
  type BaseProps,
  type ChildrenCollection,
  type ComponentImporter,
  type DelegatedEvent,
  type GlobalEvent,
  type RefEvent,
  resolveConfig,
} from './Base.js';
import { isBaseConstructor } from './component-brand.js';
import { createContext, signal, type Signal } from './context.js';
import { children, component, inject, on, provide, read, write } from './decorators.js';
import { registerComponent, registerComponents } from './registry.js';
import { defaultScheduler } from './scheduler.js';
import { getInstance, resetDom, settle, TodoItem } from './test-utils.js';

const DecoContext = createContext<Signal<number>>('deco-context');

@component({ name: 'DecoChild' })
class DecoChild extends Base {
  @inject(DecoContext)
  accessor total: Signal<number> | undefined;

  ping(): void {
    this.$emit('ping', { answer: 42 });
  }
}

class DecoFamily extends Base {
  static config = { name: 'DecoFamily' };
}

class DecoFamilyAlpha extends DecoFamily {
  static config = { name: 'DecoFamilyAlpha' };
}

class DecoFamilyBeta extends DecoFamily {
  static config = { name: 'DecoFamilyBeta' };
}

class DecoFamilyUnrelated extends Base {
  static config = { name: 'DecoFamilyUnrelated' };
}

class DecoFamilyParent extends Base {
  static config = { name: 'DecoFamilyParent' };

  added: DecoFamily[] = [];

  removed: DecoFamily[] = [];

  @children(DecoFamily, {
    added(instance) {
      expectTypeOf(instance).toEqualTypeOf<DecoFamily>();
      this.added.push(instance);
    },
    removed(instance) {
      expectTypeOf(instance).toEqualTypeOf<DecoFamily>();
      this.removed.push(instance);
    },
  })
  accessor family!: ChildrenCollection<DecoFamily>;
}

@component({ name: 'DecoParent' })
class DecoParent extends Base {
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

@component({ name: 'DotList', refs: ['dots[]', 'title'] })
class DotList extends Base {
  clicked: number[] = [];

  titles: string[] = [];

  magic: number[] = [];

  @on('dots[]', 'click')
  trackDot({ index }: RefEvent): void {
    this.clicked.push(index);
  }

  @on('title', 'click')
  trackTitle({ target }: RefEvent): void {
    this.titles.push(target.tagName);
  }

  onDotsClick({ index }: RefEvent): void {
    this.magic.push(index);
  }
}

@component({ name: 'NsDots', refs: ['dots[]', 'title'] })
class NsDots extends Base {
  clicked: number[] = [];

  titles: string[] = [];

  @on('dots[]', 'click')
  trackDot({ index }: RefEvent): void {
    this.clicked.push(index);
  }

  onTitleClick({ target }: RefEvent): void {
    this.titles.push(target.tagName);
  }
}

@component({ name: 'DotMismatch', refs: ['dots[]'] })
class DotMismatch extends Base {
  clicked: number[] = [];

  @on('dots', 'click')
  trackDot({ index }: RefEvent): void {
    this.clicked.push(index);
  }
}

@component({ name: 'BaseKind' })
class BaseKind extends Base {}

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

@component({ name: 'PhasedChild' })
class PhasedChild extends Base {}

/**
 * Every handler here is named the way the magic scan spells the event its
 * `@on` declares, so both binding passes claim it, and each carries a `@read`
 * or a `@write` — above the `@on` on half of them, below it on the other half.
 * That order decides which function the registration records, and used to
 * decide whether the handler bound once or twice.
 */
@component({
  name: 'PhasedHandlers',
  refs: ['dot', 'tag'],
  components: { PhasedChild },
})
class PhasedHandlers extends Base {
  calls: Record<string, number> = {};

  count(name: string): void {
    this.calls[name] = (this.calls[name] ?? 0) + 1;
  }

  @write
  @on(window, 'resize')
  onWindowResize(): void {
    this.count('onWindowResize');
  }

  @on(window, 'scroll')
  @write
  onWindowScroll(): void {
    this.count('onWindowScroll');
  }

  @write
  @on('PhasedChild', 'ping')
  onPhasedChildPing(): void {
    this.count('onPhasedChildPing');
  }

  @on('PhasedChild', 'pong')
  @write
  onPhasedChildPong(): void {
    this.count('onPhasedChildPong');
  }

  @read
  @on('dot', 'click')
  onDotClick(): void {
    this.count('onDotClick');
  }

  @on('tag', 'click')
  @read
  onTagClick(): void {
    this.count('onTagClick');
  }
}

/** The two families on their own, on names the magic scan also claims. */
@component({ name: 'SinglyDecorated' })
class SinglyDecorated extends Base {
  resizes = 0;

  scrolls = 0;

  @on(window, 'resize')
  onWindowResize(): void {
    this.resizes += 1;
  }

  @write
  onWindowScroll(): void {
    this.scrolls += 1;
  }
}

registerComponents(
  DecoParent,
  DecoChild,
  GlobalNames,
  WindowChild,
  DotList,
  DotMismatch,
  SubTargetParent,
  BaseKind,
  SubKind,
  PhasedChild,
  PhasedHandlers,
  SinglyDecorated,
);

// Compile-time assertions prevent the overloads from silently widening to `any`.

@component({ name: 'TypedKid' })
class TypedKid extends Base<{ $emits: { open: { index: number } } }> {}

class OnOverloads extends Base {
  static config = { name: 'OnOverloads' };

  @on(window, 'click')
  known(payload: GlobalEvent<MouseEvent>): void {
    expectTypeOf(payload.event).toEqualTypeOf<MouseEvent>();
    expectTypeOf(payload.target).toEqualTypeOf<Window | Document>();
  }

  @on(window, 'app:ready')
  custom(payload: GlobalEvent): void {
    expectTypeOf(payload.event).toEqualTypeOf<Event>();
  }

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
    expect(getInstance(root, 'DecoParent').$isMounted).toBe(true);
  });

  /**
   * The decorator writes `{ ...value.config, ...config }`, so a class with no
   * own `config` copies its parent's keys down before adding its own. None of
   * those copied keys reach the merged config on their own: `resolveConfig()`
   * walks the chain and merges the same values from the parent's own config.
   */
  it('copies no value into the merged config that resolveConfig does not merge', () => {
    class CopyParent extends Base {
      static config: BaseConfig = {
        name: 'CopyParent',
        refs: ['handle'],
        options: { one: String },
        components: { TodoItem },
        mountStrategy: 'visible',
      };
    }

    const added: BaseConfig = { name: 'CopyChild', refs: ['extra'], options: { two: String } };

    /** The own config the decorator writes today. */
    class WithCopy extends CopyParent {
      static config: BaseConfig = { ...CopyParent.config, ...added };
    }

    /** The own config it would write without the copy. */
    class WithoutCopy extends CopyParent {
      static config: BaseConfig = added;
    }

    expect(resolveConfig(WithCopy)).toEqual(resolveConfig(WithoutCopy));
    expect(resolveConfig(WithCopy)).toMatchObject({
      name: 'CopyChild',
      refs: ['handle', 'extra'],
      mountStrategy: 'visible',
    });
  });

  /**
   * What the copy is for. `isBaseConstructor()` reads `config.name` straight
   * off the class — it cannot call `resolveConfig()`, which lives in `Base` and
   * imports the brand. A class with no own `config` passes because it reads its
   * parent's; a decorated one only passes because the decorator carried the
   * inherited name into the config it wrote. Untyped sources reach this by
   * extending a component and adding config without renaming, the case #823
   * made register under the inherited name.
   */
  it('keeps a class whose config omits a name recognisable as a component', () => {
    @component({ name: 'BrandParent' })
    class BrandParent extends Base {}

    // Registering under the inherited name collides with the parent, which is
    // the loud first-wins path and not what this spec is about.
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // @ts-expect-error `name` is missing, as it is in untyped sources.
    @component({ options: { extra: Boolean } })
    class BrandChild extends BrandParent {}
    warn.mockRestore();

    expect(BrandChild.config.name).toBe('BrandParent');
    // Consumed by `config.components` entries, `@on(Class, type)` and the lazy
    // import resolution: all three reject a class the brand check refuses.
    expect(isBaseConstructor(BrandChild)).toBe(true);
    expect(() => on(BrandChild, 'ping')).not.toThrow();
  });

  /**
   * The same, through the merge: a static config field replaces the object the
   * decorator wrote, so the merged one has to carry the inherited name back.
   */
  it('keeps the inherited name when a nameless static config replaces the written one', () => {
    @component({ name: 'BrandFieldParent' })
    class BrandFieldParent extends Base {}

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    // @ts-expect-error `name` is missing on both sides, as it is in untyped sources.
    @component({ refs: ['handle'] })
    class BrandFieldChild extends BrandFieldParent {
      // @ts-expect-error `name` is missing.
      static config: BaseConfig = { options: { extra: Boolean } };
    }
    warn.mockRestore();

    expect(BrandFieldChild.config.name).toBe('BrandFieldParent');
    expect(BrandFieldChild.config.refs).toEqual(['handle']);
    expect(BrandFieldChild.config.options).toEqual({ extra: Boolean });
    expect(isBaseConstructor(BrandFieldChild)).toBe(true);
  });

  it('writes an own config and leaves the parent object untouched', () => {
    @component({ name: 'OwnParent', refs: ['a'] })
    class OwnParent extends Base {}
    const parentConfig = OwnParent.config;

    @component({ name: 'OwnChild', refs: ['b'] })
    class OwnChild extends OwnParent {}

    expect(Object.hasOwn(OwnChild, 'config')).toBe(true);
    expect(OwnChild.config).not.toBe(parentConfig);
    expect(parentConfig).toEqual({ name: 'OwnParent', refs: ['a'] });

    // An undecorated subclass reads the parent object by identity. Nothing
    // mutates a `config` in place, so the sharing is safe.
    class OwnGrandChild extends OwnChild {}
    expect(OwnGrandChild.config).toBe(OwnChild.config);
    expect(resolveConfig(OwnGrandChild).name).toBe('OwnChild');
  });

  /**
   * Two declarations of one config on one class. Static field initializers run
   * after class decorators, so the field's object replaces the one the
   * decorator wrote: the decorator used to lose everything the field did not
   * repeat, silently. Class initializers run after those fields, which is
   * where the two are merged back together — by the rules `resolveConfig()`
   * already applies to a chain, with the decorator last.
   */
  it('merges a static config field on the same class instead of dropping one', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    @component({ name: 'BothSides', refs: ['btn'] })
    class BothSides extends Base {
      static config: BaseConfig = { name: 'BothSides', options: { open: Boolean } };
    }
    warn.mockRestore();

    expect(BothSides.config).toEqual({
      name: 'BothSides',
      refs: ['btn'],
      options: { open: Boolean },
    });
    expect(resolveConfig(BothSides)).toMatchObject({
      name: 'BothSides',
      refs: ['btn'],
      options: { open: Boolean },
    });
    // Declaring the same name on both sides is not a conflict, and disjoint
    // keys need no precedence rule, so nothing is reported.
    expect(warn).not.toHaveBeenCalled();
  });

  /**
   * The precedence rule is only observable when the two give one key different
   * values, and that is the case a warning has to name: it is an authoring
   * mistake, not a declaration the merge can honour.
   */
  it('keeps the decorator value and reports a key declared differently on both sides', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    @component({
      name: 'ConflictingConfig',
      mountStrategy: 'visible',
      options: { open: Boolean, extra: String },
    })
    class ConflictingConfig extends Base {
      static config: BaseConfig = {
        name: 'ShadowedName',
        mountStrategy: 'idle',
        options: { open: String },
      };
    }

    expect(ConflictingConfig.config).toEqual({
      name: 'ConflictingConfig',
      mountStrategy: 'visible',
      options: { open: Boolean, extra: String },
    });
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('[js-toolkit:component.config-conflict]');
    expect(warn.mock.calls[0][0]).toContain('name, mountStrategy, options.open');
    warn.mockRestore();
  });

  /** Refs union, so declaring one on both sides loses nothing to report. */
  it('unions refs declared on both sides', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    @component({ name: 'RefUnion', refs: ['handle'] })
    class RefUnion extends Base {
      static config: BaseConfig = { name: 'RefUnion', refs: ['label', 'handle'] };
    }
    warn.mockRestore();

    // The field's refs come first because the decorator merges onto them; refs
    // are looked up by name, so the order carries nothing.
    expect(RefUnion.config.refs).toEqual(['label', 'handle']);
    expect(warn).not.toHaveBeenCalled();
  });

  /**
   * The merge happens in a class initializer, which still runs while the class
   * definition evaluates. `registerComponent()` on the next line — how it is
   * called at module scope — must therefore see the merged config, name
   * included, and not a half-written one cached by `resolveConfig()`.
   */
  it('has the merged config ready for a registerComponent() call on the next line', async () => {
    const el = document.createElement('div');
    el.setAttribute('data-component', 'ImmediateRegistration');
    el.setAttribute('data-option-tone', 'loud');
    el.innerHTML = '<span data-ref="label"></span>';
    document.body.append(el);

    @component({ name: 'ImmediateRegistration', refs: ['label'] })
    class ImmediateRegistration extends Base {
      static config: BaseConfig = {
        name: 'ImmediateRegistration',
        options: { tone: String },
      };
    }
    registerComponent(ImmediateRegistration);

    expect(resolveConfig(ImmediateRegistration)).toMatchObject({
      name: 'ImmediateRegistration',
      refs: ['label'],
      options: { tone: String },
    });

    await settle();
    const instance = getInstance<ImmediateRegistration>(el, 'ImmediateRegistration');
    expect(instance.$isMounted).toBe(true);
    expect(instance.$options.tone).toBe('loud');
    expect(instance.$refs.label).toBe(el.querySelector('span'));
  });

  /** Each class merges its own two declarations; the chain merges the rest. */
  it('merges both declarations on a decorated subclass of a decorated class', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    @component({ name: 'MixParent', refs: ['handle'] })
    class MixParent extends Base {
      static config: BaseConfig = { name: 'MixParent', options: { open: Boolean } };
    }

    @component({ name: 'MixChild', refs: ['extra'] })
    class MixChild extends MixParent {
      static config: BaseConfig = { name: 'MixChild', options: { size: Number } };
    }

    /** An undecorated subclass keeps declaring config the plain way. */
    class MixGrandChild extends MixChild {
      static config: BaseConfig = { name: 'MixGrandChild', refs: ['last'] };
    }
    warn.mockRestore();

    expect(MixParent.config).toEqual({
      name: 'MixParent',
      refs: ['handle'],
      options: { open: Boolean },
    });
    expect(resolveConfig(MixChild)).toMatchObject({
      name: 'MixChild',
      refs: ['handle', 'extra'],
      options: { open: Boolean, size: Number },
    });
    expect(resolveConfig(MixGrandChild)).toMatchObject({
      name: 'MixGrandChild',
      refs: ['handle', 'extra', 'last'],
      options: { open: Boolean, size: Number },
    });
    expect(warn).not.toHaveBeenCalled();
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
    expect(parent.received).toHaveLength(1);
  });

  it('binds own events on the root element with the one-argument form', async () => {
    const root = render();
    await settle();

    const parent = getInstance<DecoParent>(root, 'DecoParent');
    root.click();
    expect(parent.clicks).toBe(1);
  });

  it('types an own handler from the platform map, and from the handler for a component event', async () => {
    const name = 'DecoOwnTypes';
    const seen: string[] = [];

    @component({ name })
    class OwnTypes extends Base<BaseProps & { $emits: { picked: { id: string } } }> {
      @on('click')
      onPlatformEvent(event: MouseEvent): void {
        expectTypeOf(event).toEqualTypeOf<MouseEvent>();
        seen.push(`click:${event.type}`);
      }

      // The name is not in `HTMLElementEventMap`, so the detail is the
      // emitter's business and the handler declares what it expects.
      @on('picked')
      onComponentEvent(event: CustomEvent<{ id: string }>): void {
        expectTypeOf(event.detail).toEqualTypeOf<{ id: string }>();
        seen.push(`picked:${event.detail.id}`);
      }
    }

    const root = document.createElement('div');
    root.setAttribute('data-component', name);
    document.body.append(root);
    await settle();

    const instance = getInstance<OwnTypes>(root, name);
    root.click();
    instance.$emit('picked', { id: 'a' });

    expect(seen).toEqual(['click:click', 'picked:a']);
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

    window.dispatchEvent(new Event('resize'));
    expect(parent.globalResizes).toHaveLength(1);
    expect(parent.globalResizes[0].target).toBe(window);
    expect(parent.childResizes).toHaveLength(0);

    childEl.dispatchEvent(new Event('resize', { bubbles: true }));
    expect(parent.childResizes).toHaveLength(1);
    expect(parent.childResizes[0].target).toBe(child);
  });

  it('names a ref the way config.refs declares it, [] included', async () => {
    const root = document.createElement('div');
    root.setAttribute('data-component', 'DotList');
    root.innerHTML = '<i data-ref="dots[]"></i><i data-ref="dots[]"></i><h2 data-ref="title"></h2>';
    document.body.append(root);
    await settle();

    const instance = getInstance<DotList>(root, 'DotList');
    (root.querySelectorAll('i')[1] as HTMLElement).click();
    expect(instance.clicked).toEqual([1]);
    expect(instance.magic).toEqual([1]);

    (root.querySelector('h2') as HTMLElement).click();
    expect(instance.titles).toEqual(['H2']);
  });

  it('binds a namespaced ref through its plain declared name, and warns nothing', async () => {
    const root = document.createElement('div');
    root.setAttribute('data-component', 'NsDots');
    root.innerHTML = `
      <div data-component="NsShell">
        <i data-ref="NsDots.dots[]"></i>
        <i data-ref="NsDots.dots[]"></i>
        <h2 data-ref="NsDots.title"></h2>
      </div>
    `;
    document.body.append(root);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await settle();

    const instance = getInstance<NsDots>(root, 'NsDots');
    (root.querySelectorAll('i')[1] as HTMLElement).click();
    expect(instance.clicked).toEqual([1]);

    (root.querySelector('h2') as HTMLElement).click();
    expect(instance.titles).toEqual(['H2']);

    expect(warn).not.toHaveBeenCalled();
    warn.mockRestore();
  });

  it('warns instead of binding silently when @on drops a list ref suffix', async () => {
    const root = document.createElement('div');
    root.setAttribute('data-component', 'DotMismatch');
    root.innerHTML = '<i data-ref="dots[]"></i><i data-ref="dots[]"></i>';
    document.body.append(root);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    await settle();

    const instance = getInstance<DotMismatch>(root, 'DotMismatch');
    (root.querySelectorAll('i')[1] as HTMLElement).click();
    expect(instance.clicked).toEqual([]);

    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('DotMismatch');
    expect(warn.mock.calls[0][0]).toContain("@on('dots[]', …)");
    warn.mockRestore();
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
    expect(parent.base).toHaveLength(0);

    base.$emit('ping');
    expect(parent.base).toHaveLength(1);
    expect(parent.base[0].target).toBe(base);
    expect(parent.seen).toHaveLength(1);
  });

  it('rejects values that are neither globals nor branded component classes', () => {
    const el = document.createElement('div');
    class WrongWithConfig {
      static config = { name: 'WrongWithConfig' };
    }

    expect(() => on(el as never, 'click')).toThrow(TypeError);
    expect(() => on(WrongWithConfig as never, 'ping')).toThrow(TypeError);
    expect(() => on(lazyChild as never, 'ping')).toThrow(TypeError);
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

  it('accepts a constructor and infers its subclass collection', async () => {
    const root = document.createElement('div');
    const alphaEl = root.appendChild(document.createElement('div'));
    const unrelatedEl = root.appendChild(document.createElement('div'));
    document.body.append(root);
    const alpha = new DecoFamilyAlpha(alphaEl).$mount();
    new DecoFamilyUnrelated(unrelatedEl).$mount();
    const parent = new DecoFamilyParent(root).$mount();
    await settle();

    expectTypeOf(parent.family).toEqualTypeOf<ChildrenCollection<DecoFamily>>();
    expect(parent.family.items).toEqual([alpha]);
    expect(parent.added).toEqual([alpha]);

    const beta = new DecoFamilyBeta(root.appendChild(document.createElement('div'))).$mount();
    expect(parent.family.items).toEqual([alpha, beta]);
    expect(parent.added).toEqual([alpha, beta]);

    alpha.$destroy();
    expect(parent.family.items).toEqual([beta]);
    expect(parent.removed).toEqual([alpha]);
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
    expect(order).toEqual([]);

    await defaultScheduler.whenIdle();
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

describe('@on stacked with @read / @write', () => {
  function renderPhased(): HTMLElement {
    const root = document.createElement('div');
    root.setAttribute('data-component', 'PhasedHandlers');
    root.innerHTML =
      '<div data-component="PhasedChild"></div><button data-ref="dot"></button><button data-ref="tag"></button>';
    document.body.append(root);
    return root;
  }

  it('binds a handler once whichever order the two decorators are stacked in', async () => {
    const root = renderPhased();
    await settle();

    const instance = getInstance<PhasedHandlers>(root, 'PhasedHandlers');
    const child = getInstance<PhasedChild>(
      root.querySelector('[data-component="PhasedChild"]'),
      'PhasedChild',
    );

    window.dispatchEvent(new Event('resize'));
    window.dispatchEvent(new Event('scroll'));
    child.$emit('ping');
    child.$emit('pong');
    (root.querySelector('[data-ref="dot"]') as HTMLElement).click();
    (root.querySelector('[data-ref="tag"]') as HTMLElement).click();

    // Whichever function the registration recorded, the body may run in a
    // scheduler phase; drain it before counting.
    await defaultScheduler.whenIdle();

    expect(instance.calls).toEqual({
      onWindowResize: 1,
      onWindowScroll: 1,
      onPhasedChildPing: 1,
      onPhasedChildPong: 1,
      onDotClick: 1,
      onTagClick: 1,
    });
  });

  it('binds a magic name carrying only @on once', async () => {
    const root = document.createElement('div');
    root.setAttribute('data-component', 'SinglyDecorated');
    document.body.append(root);
    await settle();

    const instance = getInstance<SinglyDecorated>(root, 'SinglyDecorated');
    window.dispatchEvent(new Event('resize'));
    expect(instance.resizes).toBe(1);
  });

  it('binds a magic name carrying only @write once, through the scheduled wrapper', async () => {
    const root = document.createElement('div');
    root.setAttribute('data-component', 'SinglyDecorated');
    document.body.append(root);
    await settle();

    const instance = getInstance<SinglyDecorated>(root, 'SinglyDecorated');
    window.dispatchEvent(new Event('scroll'));
    expect(instance.scrolls).toBe(0);

    await defaultScheduler.whenIdle();
    expect(instance.scrolls).toBe(1);
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

    expect(parent.total.value).toBe(2);
    expect(child.total).toBe(parent.total);
    expect(child.total?.value).toBe(2);

    parent.total.value = 7;
    expect(child.total?.value).toBe(7);
  });
});
