/**
 * The props type parameter, asserted at the type level.
 *
 * Everything this file is about is invisible at runtime: a component whose
 * `$options` reads as `Record<string, unknown>` instead of what it declared
 * still works, it is only unusable to write. So the assertions are compile-time
 * — `expectTypeOf`, and `@ts-expect-error` for what must _not_ compile — and
 * they are enforced by `npm run lint:types`, whose `tsc -p tsconfig.json`
 * includes `src/**\/*.ts`. A failed assertion is a failed build, not a failed
 * test run.
 *
 * The case they exist for is a component that takes a props parameter of its
 * own, which is how v3 lets one component be extended by another:
 *
 *     class Action<T extends BaseProps = BaseProps> extends Base<ActionProps & T> {}
 *
 * Inside that class body `T` is a naked type parameter. Every prop helper in
 * `Base.ts` therefore has to resolve without waiting for `T` to be known —
 * see the comment above `El` for how, and what it costs.
 */
import { describe, expect, expectTypeOf, it } from 'vitest';
import { Base, type BaseProps } from './Base.js';
import { registerComponent } from './registry.js';
import { getInstance, resetDom, settle } from './test-utils.js';

/**
 * Assignability, asserted where `expectTypeOf` cannot reach. `El<ActionProps & T>`
 * is an intersection whose first member is deferred, so it is *usable* as an
 * `HTMLFormElement` without being provably `extends HTMLFormElement` —
 * `toExtend` resolves that check to a deferred conditional and fails. A
 * parameter position asks the question the class body actually asks.
 */
function assignableTo<T>(_value: T): void {}

interface ActionProps extends BaseProps {
  $el: HTMLFormElement;
  $refs: { btn: HTMLElement; items: HTMLElement[] };
  $options: { target: string; count: number };
  $emits: { go: { at: number }; stop: void };
}

/* ------------------------------------------------------------------------ *
 * 1. A component declared with a props parameter, intersected with its own
 *    props — the shape that could not be written at all.
 * ------------------------------------------------------------------------ */

class Extensible<T extends BaseProps = BaseProps> extends Base<ActionProps & T> {
  static config = { name: 'Extensible', refs: ['btn', 'items[]'], options: { target: String } };

  assertions(): void {
    expectTypeOf(this.$options.target).toEqualTypeOf<string>();
    expectTypeOf(this.$options.count).toEqualTypeOf<number>();
    expectTypeOf(this.$refs.btn).toEqualTypeOf<HTMLElement>();
    expectTypeOf(this.$refs.items).toEqualTypeOf<HTMLElement[]>();
    assignableTo<HTMLFormElement>(this.$el);
    // Declared events, with their declared payloads, from inside a class whose
    // props type is still open.
    this.$emit('go', { at: 1 });
    this.$emit('stop');
  }
}

/** And a component that extends it by widening the props, which is the point. */
class ExtensibleChild extends Extensible<{ $options: { extra: boolean } }> {
  static config = { ...Extensible.config, name: 'ExtensibleChild' };

  childAssertions(): void {
    expectTypeOf(this.$options.target).toEqualTypeOf<string>();
    expectTypeOf(this.$options.extra).toEqualTypeOf<boolean>();
    assignableTo<HTMLFormElement>(this.$el);
  }
}

/* ------------------------------------------------------------------------ *
 * 2. A props parameter constrained to the component's own props, rather than
 *    intersected. `T extends ActionProps` used to fail identically.
 * ------------------------------------------------------------------------ */

class Constrained<T extends ActionProps = ActionProps> extends Base<T> {
  static config = { name: 'Constrained', refs: ['btn'] };

  assertions(): void {
    expectTypeOf(this.$options.target).toEqualTypeOf<string>();
    expectTypeOf(this.$refs.btn).toEqualTypeOf<HTMLElement>();
    assignableTo<HTMLFormElement>(this.$el);
    this.$emit('go', { at: 1 });
  }
}

/* ------------------------------------------------------------------------ *
 * 3. The common case — no parameter at all — must not regress.
 * ------------------------------------------------------------------------ */

class Concrete extends Base<ActionProps> {
  static config = { name: 'Concrete', refs: ['btn', 'items[]'], options: { target: String } };

  assertions(): void {
    expectTypeOf(this.$id).toEqualTypeOf<string>();
    expectTypeOf(this.$options.target).toEqualTypeOf<string>();
    expectTypeOf(this.$options.count).toEqualTypeOf<number>();
    expectTypeOf(this.$refs.btn).toEqualTypeOf<HTMLElement>();
    expectTypeOf(this.$refs.items).toEqualTypeOf<HTMLElement[]>();
    assignableTo<HTMLFormElement>(this.$el);
    // A concrete props type keeps the payload exact, not just the name.
    expectTypeOf(this.$emit('go', { at: 1 }).detail).toEqualTypeOf<{ at: number }>();
    expectTypeOf(this.$emit('stop').detail).toEqualTypeOf<null>();
  }

  negatives(): void {
    // @ts-expect-error `$id` is stable for the instance
    this.$id = 'replacement';
    // @ts-expect-error `nope` is not a declared event
    this.$emit('nope');
    // @ts-expect-error `go` carries a payload
    this.$emit('go');
    // @ts-expect-error `stop` carries none
    this.$emit('stop', { at: 1 });
    // @ts-expect-error the payload shape is checked
    this.$emit('go', { at: 'one' });
  }
}

/* ------------------------------------------------------------------------ *
 * 4. Props types that declare only some keys keep the defaults for the rest,
 *    and a component that declares nothing keeps all four.
 * ------------------------------------------------------------------------ */

class Partial extends Base<{ $options: { a: string } }> {
  static config = { name: 'Partial' };

  assertions(): void {
    expectTypeOf(this.$options.a).toEqualTypeOf<string>();
    expectTypeOf(this.$el).toEqualTypeOf<HTMLElement>();
    expectTypeOf(this.$refs.whatever).toEqualTypeOf<HTMLElement | HTMLElement[]>();
    // No `$emits` declared, so any name and an optional payload.
    this.$emit('anything');
    this.$emit('anything', { some: 1 });
  }
}

class Undeclared extends Base {
  static config = { name: 'Undeclared' };

  assertions(): void {
    expectTypeOf(this.$options.whatever).toEqualTypeOf<unknown>();
    expectTypeOf(this.$el).toEqualTypeOf<HTMLElement>();
    expectTypeOf(this.$refs.whatever).toEqualTypeOf<HTMLElement | HTMLElement[]>();
    this.$emit('anything', { some: 1 });
  }
}

/* ------------------------------------------------------------------------ *
 * 4-bis. An option set named to be shared between two components — REPORT.md
 *    gap 14. An `interface` has no implicit index signature, so declaring one
 *    used to fail `$options`'s `Record<string, unknown>` constraint, with the
 *    error pointing at the props type rather than at the interface. It bit
 *    exactly when naming the set was worth doing.
 * ------------------------------------------------------------------------ */

interface NamedOptions {
  speed: number;
  label: string;
}

interface NamedRefs {
  handle: HTMLElement;
}

interface SharingProps extends BaseProps {
  $options: NamedOptions;
}

class SharesItsOptions extends Base<SharingProps> {
  static config = { name: 'SharesItsOptions', options: { speed: Number, label: String } };

  assertions(): void {
    expectTypeOf(this.$options.speed).toEqualTypeOf<number>();
    expectTypeOf(this.$options.label).toEqualTypeOf<string>();
    // The index signature is still intersected back in, so an option nobody
    // declared reads as `unknown` rather than erroring — v3's price, unchanged.
    expectTypeOf(this.$options.whatever).toEqualTypeOf<unknown>();
  }
}

/**
 * `$refs` and `$emits` keep the stricter constraint, because it rejects
 * something an interface should not be allowed to say. The intersection form
 * is what names them: it accepts an interface where `extends BaseProps`
 * cannot, and it is v3's own spelling.
 */
type IntersectedProps = BaseProps & {
  $options: NamedOptions;
  $refs: NamedRefs;
};

class NamesEveryProp extends Base<IntersectedProps> {
  static config = { name: 'NamesEveryProp', refs: ['handle'], options: { speed: Number } };

  assertions(): void {
    expectTypeOf(this.$options.speed).toEqualTypeOf<number>();
    expectTypeOf(this.$refs.handle).toEqualTypeOf<HTMLElement>();
  }
}

/* ------------------------------------------------------------------------ *
 * 5. A component that declared props is still a `Base`. Reading a prop through
 *    an intersection rather than a conditional is what keeps the class
 *    covariant in its parameter, and `$query`, `$closest` and
 *    `$watchChildren` all hand back a `Base`.
 * ------------------------------------------------------------------------ */

function acceptsAnyComponent(instance: Base): string {
  return instance.$config.name;
}

/** Every shape above, widened to the type every "some component" helper takes. */
function widened(
  generic: Extensible,
  child: ExtensibleChild,
  constrained: Constrained,
  concrete: Concrete,
  partial: Partial,
  undeclared: Undeclared,
  sharing: SharesItsOptions,
  named: NamesEveryProp,
): Base[] {
  return [generic, child, constrained, concrete, partial, undeclared, sharing, named];
}

/* ------------------------------------------------------------------------ *
 * The runtime half: the same generic component, mounted, reading the option it
 * declared and emitting the event it declared.
 * ------------------------------------------------------------------------ */

describe('a component declared with a props type parameter', () => {
  it('reads its declared options and refs at runtime', async () => {
    registerComponent(Extensible);
    document.body.innerHTML = `
      <form data-component="Extensible" data-option-target="here">
        <button data-ref="btn"></button>
        <span data-ref="items[]"></span>
        <span data-ref="items[]"></span>
      </form>`;
    await settle();

    const instance = getInstance<Extensible>(document.querySelector('form'), 'Extensible');
    expect(instance.$options.target).toBe('here');
    expect(instance.$refs.btn).toBeInstanceOf(HTMLButtonElement);
    expect(instance.$refs.items).toHaveLength(2);
    expect(instance.$el.tagName).toBe('FORM');

    await resetDom();
  });

  it('emits its declared events', async () => {
    registerComponent(Extensible);
    document.body.innerHTML = `<form data-component="Extensible"></form>`;
    await settle();

    const el = document.querySelector('form') as HTMLFormElement;
    const instance = getInstance<Extensible>(el, 'Extensible');
    const seen: unknown[] = [];
    el.addEventListener('go', (event) => seen.push((event as CustomEvent).detail));
    instance.$emit('go', { at: 3 });
    expect(seen).toEqual([{ at: 3 }]);

    await resetDom();
  });

  it('stays assignable to `Base`', () => {
    const el = document.createElement('form');
    const instance: Base = new Extensible(el);
    expect(acceptsAnyComponent(instance)).toBe('Extensible');
    expect(
      widened(
        new Extensible(el),
        new ExtensibleChild(el),
        new Constrained(el),
        new Concrete(el),
        new Partial(el),
        new Undeclared(el),
        new SharesItsOptions(el),
        new NamesEveryProp(el),
      ),
    ).toHaveLength(8);
  });
});
