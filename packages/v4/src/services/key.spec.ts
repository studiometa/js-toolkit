import { afterEach, describe, expect, expectTypeOf, it } from 'vitest';
import { Base } from '../Base.js';
import {
  KEYS,
  useKey,
  withKey,
  type Key,
  type KeyFlags,
  type KeyHook,
  type KeyMixinOptions,
  type KeyName,
  type KeyProps,
} from './key.js';
import type { Service } from './service.js';
import type { Toggle } from './toggle.js';

const NAMES = Object.keys(KEYS) as KeyName[];

/** The named flags only, so a test states the whole set it expects. */
function flagsOf(props: KeyProps): Record<string, boolean> {
  return Object.fromEntries(NAMES.map((name) => [name, props[name]]));
}

function flagsFor(pressed: KeyName | null): Record<string, boolean> {
  return Object.fromEntries(NAMES.map((name) => [name, name === pressed]));
}

function press(key: string, target: EventTarget = document): KeyboardEvent {
  const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

function release(key: string, target: EventTarget = document): KeyboardEvent {
  const event = new KeyboardEvent('keyup', { key, bubbles: true, cancelable: true });
  target.dispatchEvent(event);
  return event;
}

function readonlyAssertions(props: KeyProps): void {
  // @ts-expect-error service props belong to the service
  props.ESC = true;
  // @ts-expect-error the source event is readonly too
  props.event = null;
  // @ts-expect-error the repeat count is an observation
  props.triggered = 0;
}
void readonlyAssertions;

class TypedTrap extends withKey(Base, { manual: true }) {
  keyed(_props: KeyProps): void {}
}

function typeAssertions(instance: TypedTrap): void {
  expectTypeOf(useKey()).toEqualTypeOf<Service<KeyProps>>();
  expectTypeOf(useKey(document.body)).toEqualTypeOf<Service<KeyProps>>();
  expectTypeOf<KeyName>().toEqualTypeOf<
    'ENTER' | 'SPACE' | 'TAB' | 'ESC' | 'LEFT' | 'UP' | 'RIGHT' | 'DOWN'
  >();
  expectTypeOf<Key>().toEqualTypeOf<(typeof KEYS)[KeyName]>();
  expectTypeOf<KeyProps>().toMatchTypeOf<KeyFlags>();
  expectTypeOf<KeyHook>().toMatchTypeOf<{ keyed?: (props: KeyProps) => void }>();
  expectTypeOf(instance.keyed).toEqualTypeOf<(props: KeyProps) => void>();
  expectTypeOf(instance.$services.keyed).toEqualTypeOf<Toggle>();
  // @ts-expect-error only the mixin's fixed hook gets a service handle
  instance.$services.scrolled.start();
}
void typeAssertions;

const mixinOptionsTypeAssertions: KeyMixinOptions = {
  target: (instance) => instance.$el,
  manual: true,
  immediate: false,
};
void mixinOptionsTypeAssertions;

afterEach(() => {
  document.body.innerHTML = '';
});

describe('useKey', () => {
  it('shares one service per target and keeps targets apart', () => {
    const region = document.createElement('section');
    expect(useKey()).toBe(useKey(document));
    expect(useKey(region)).toBe(useKey(region));
    expect(useKey(region)).not.toBe(useKey());
    expect(useKey(region)).not.toBe(useKey(document.createElement('section')));
  });

  it('names the key of the event and nothing else', () => {
    const seen: KeyProps[] = [];
    const unsubscribe = useKey().subscribe((props) => seen.push({ ...props }));

    for (const name of NAMES) {
      press(KEYS[name]);
    }

    expect(seen).toHaveLength(NAMES.length);
    expect(seen.map(flagsOf)).toEqual(NAMES.map(flagsFor));
    unsubscribe();
  });

  it('reports no named key for an unnamed one', () => {
    const seen: KeyProps[] = [];
    const unsubscribe = useKey().subscribe((props) => seen.push({ ...props }));

    press('a');
    expect(seen.map(flagsOf)).toEqual([flagsFor(null)]);
    unsubscribe();
  });

  it('follows the event type with isDown and isUp', () => {
    const seen: KeyProps[] = [];
    const unsubscribe = useKey().subscribe((props) => seen.push({ ...props }));

    press(KEYS.ESC);
    release(KEYS.ESC);

    expect(seen.map(({ isDown, isUp, event }) => [event?.type, isDown, isUp])).toEqual([
      ['keydown', true, false],
      ['keyup', false, true],
    ]);
    unsubscribe();
  });

  it('counts repeats of one key, and restarts on another key or on a release', () => {
    const counts: number[] = [];
    const unsubscribe = useKey().subscribe(({ triggered }) => counts.push(triggered));

    press(KEYS.DOWN);
    press(KEYS.DOWN);
    press(KEYS.DOWN);
    // A held key followed by another one is not a repeat: v3 reported `4` here.
    press(KEYS.UP);
    press(KEYS.UP);
    // Any release restarts the count, held key or not.
    release(KEYS.UP);
    press(KEYS.UP);

    expect(counts).toEqual([1, 2, 3, 1, 2, 1, 1]);
    unsubscribe();
  });

  it('has no observed value before its first event', () => {
    const region = document.createElement('section');
    document.body.append(region);
    const service = useKey(region);

    expect(service.props().event).toBeNull();
    expect(service.props().triggered).toBe(0);

    const seen: KeyProps[] = [];
    const unsubscribe = service.subscribe((props) => seen.push({ ...props }), {
      immediate: true,
    });
    expect(seen).toEqual([]);

    press(KEYS.ENTER, region);
    expect(seen).toHaveLength(1);

    const later: KeyProps[] = [];
    const unsubscribeLater = service.subscribe((props) => later.push({ ...props }), {
      immediate: true,
    });
    expect(later).toHaveLength(1);
    expect(later[0]?.ENTER).toBe(true);

    unsubscribe();
    unsubscribeLater();
  });

  it('lets a subscriber prevent the default action', () => {
    const unsubscribe = useKey().subscribe(({ event }) => event?.preventDefault());

    // A passive listener could not have set this.
    expect(press(KEYS.TAB).defaultPrevented).toBe(true);
    unsubscribe();
  });

  it('scopes an element service to its own subtree, while the document still sees the bubble', () => {
    const region = document.createElement('section');
    const inside = document.createElement('button');
    const outside = document.createElement('button');
    region.append(inside);
    document.body.append(region, outside);

    const scoped: string[] = [];
    const page: string[] = [];
    const unsubscribeScoped = useKey(region).subscribe(({ event }) =>
      scoped.push(event?.key ?? ''),
    );
    const unsubscribePage = useKey().subscribe(({ event }) => page.push(event?.key ?? ''));

    press(KEYS.ESC, inside);
    expect(scoped).toEqual([KEYS.ESC]);
    expect(page).toEqual([KEYS.ESC]);

    press(KEYS.ENTER, outside);
    expect(scoped).toEqual([KEYS.ESC]);
    expect(page).toEqual([KEYS.ESC, KEYS.ENTER]);

    unsubscribeScoped();
    unsubscribePage();
  });

  it('releases its listeners and its props with the last subscriber', () => {
    const region = document.createElement('section');
    document.body.append(region);
    const service = useKey(region);

    const first: KeyProps[] = [];
    const second: KeyProps[] = [];
    const unsubscribeFirst = service.subscribe((props) => first.push({ ...props }));
    const unsubscribeSecond = service.subscribe((props) => second.push({ ...props }));

    press(KEYS.LEFT, region);
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(1);

    unsubscribeFirst();
    press(KEYS.LEFT, region);
    expect(first).toHaveLength(1);
    expect(second).toHaveLength(2);

    unsubscribeSecond();
    press(KEYS.LEFT, region);
    expect(second).toHaveLength(2);

    // A stopped service holds no event target and reports no key as held.
    expect(service.props().event).toBeNull();
    expect(service.props().triggered).toBe(0);
    expect(service.props().isDown).toBe(false);
    expect(flagsOf(service.props())).toEqual(flagsFor(null));
  });
});

describe('withKey', () => {
  it('supports the no-build mixin form and defaults to the document', () => {
    const seen: KeyProps[] = [];

    class Trap extends withKey(Base) {
      keyed(props: KeyProps): void {
        seen.push({ ...props });
      }
    }

    const el = document.createElement('article');
    document.body.append(el);
    const instance = new Trap(el).$mount();

    press(KEYS.ESC);
    expect(seen).toHaveLength(1);
    expect(seen[0]?.ESC).toBe(true);
    expect(seen[0]?.isDown).toBe(true);

    instance.$terminate();
  });

  it('supports the stage-3 decorator form', () => {
    const seen: KeyProps[] = [];

    @withKey()
    class Trap extends Base {
      keyed(props: KeyProps): void {
        seen.push({ ...props });
      }
    }

    const el = document.createElement('article');
    document.body.append(el);
    const instance = new Trap(el).$mount();

    press(KEYS.SPACE);
    expect(seen.map(flagsOf)).toEqual([flagsFor('SPACE')]);

    instance.$terminate();
  });

  it('leaves a manual hook stopped on mount and drives it through $services', () => {
    const seen: KeyProps[] = [];

    class Trap extends withKey(Base, { manual: true }) {
      keyed(props: KeyProps): void {
        seen.push({ ...props });
      }
    }

    const el = document.createElement('article');
    document.body.append(el);
    const instance = new Trap(el).$mount();

    expect(instance.$services.keyed.isActive).toBe(false);
    press(KEYS.TAB);
    expect(seen).toEqual([]);

    instance.$services.keyed.start();
    expect(instance.$services.keyed.isActive).toBe(true);
    press(KEYS.TAB);
    expect(seen).toHaveLength(1);

    instance.$services.keyed.stop();
    press(KEYS.TAB);
    expect(seen).toHaveLength(1);

    instance.$terminate();
  });

  it('resolves a custom target, so only its subtree reaches the hook', () => {
    const seen: KeyProps[] = [];

    class Trap extends withKey(Base, {
      target: (instance) => instance.$refs.wrapper as HTMLElement,
    }) {
      static config = { name: 'Trap', refs: ['wrapper'] };

      keyed(props: KeyProps): void {
        seen.push({ ...props });
      }
    }

    const el = document.createElement('article');
    el.innerHTML = '<div data-ref="wrapper"><button></button></div>';
    document.body.append(el);
    const instance = new Trap(el).$mount();
    const wrapper = el.querySelector('[data-ref="wrapper"]') as HTMLElement;

    press(KEYS.RIGHT, wrapper.firstElementChild as HTMLElement);
    expect(seen.map(flagsOf)).toEqual([flagsFor('RIGHT')]);

    press(KEYS.LEFT, el);
    expect(seen).toHaveLength(1);

    instance.$terminate();
  });

  it('releases the subscription on destroy and on terminate', () => {
    const seen: KeyProps[] = [];

    class Trap extends withKey(Base) {
      keyed(props: KeyProps): void {
        seen.push({ ...props });
      }
    }

    const el = document.createElement('article');
    document.body.append(el);
    const instance = new Trap(el).$mount();

    press(KEYS.UP);
    expect(seen).toHaveLength(1);

    instance.$destroy();
    press(KEYS.UP);
    expect(seen).toHaveLength(1);

    instance.$mount();
    press(KEYS.UP);
    expect(seen).toHaveLength(2);

    instance.$terminate();
    press(KEYS.UP);
    expect(seen).toHaveLength(2);
  });
});
