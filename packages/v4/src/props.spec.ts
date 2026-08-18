import { describe, expect, expectTypeOf, it } from 'vitest';
import { Base, type BaseProps } from './Base.js';
import { registerComponent } from './registry.js';
import { getInstance, resetDom, settle } from './test-utils.js';

/**
 * Assert assignability when a deferred type prevents `expectTypeOf().toExtend()`.
 * `$el` needs it for the intersection, `$options` for the `Readonly<>` mapped
 * over it: inside a class generic in its props, both read as a usable value
 * rather than as a type identical to the declared one.
 */
function assignableTo<T>(_value: T): void {}

interface ActionProps extends BaseProps {
  $el: HTMLFormElement;
  $refs: { btn: HTMLElement; items: HTMLElement[] };
  $options: { target: string; count: number };
  $emits: { go: { at: number }; stop: void };
}

class Extensible<T extends BaseProps = BaseProps> extends Base<ActionProps & T> {
  static config = { name: 'Extensible', refs: ['btn', 'items[]'], options: { target: String } };

  assertions(): void {
    assignableTo<string>(this.$options.target);
    assignableTo<number>(this.$options.count);
    expectTypeOf(this.$refs.btn).toEqualTypeOf<HTMLElement>();
    expectTypeOf(this.$refs.items).toEqualTypeOf<HTMLElement[]>();
    assignableTo<HTMLFormElement>(this.$el);
    this.$emit('go', { at: 1 });
    this.$emit('stop');
  }
}

class ExtensibleChild extends Extensible<{ $options: { extra: boolean } }> {
  static config = { ...Extensible.config, name: 'ExtensibleChild' };

  childAssertions(): void {
    expectTypeOf(this.$options.target).toEqualTypeOf<string>();
    expectTypeOf(this.$options.extra).toEqualTypeOf<boolean>();
    assignableTo<HTMLFormElement>(this.$el);
  }
}

class Constrained<T extends ActionProps = ActionProps> extends Base<T> {
  static config = { name: 'Constrained', refs: ['btn'] };

  assertions(): void {
    assignableTo<string>(this.$options.target);
    expectTypeOf(this.$refs.btn).toEqualTypeOf<HTMLElement>();
    assignableTo<HTMLFormElement>(this.$el);
    this.$emit('go', { at: 1 });
  }
}

class Concrete extends Base<ActionProps> {
  static config = { name: 'Concrete', refs: ['btn', 'items[]'], options: { target: String } };

  assertions(): void {
    expectTypeOf(this.$id).toEqualTypeOf<string>();
    expectTypeOf(this.$options.target).toEqualTypeOf<string>();
    expectTypeOf(this.$options.count).toEqualTypeOf<number>();
    expectTypeOf(this.$refs.btn).toEqualTypeOf<HTMLElement>();
    expectTypeOf(this.$refs.items).toEqualTypeOf<HTMLElement[]>();
    assignableTo<HTMLFormElement>(this.$el);
    expectTypeOf(this.$emit('go', { at: 1 }).detail).toEqualTypeOf<{ at: number }>();
    expectTypeOf(this.$emit('stop').detail).toEqualTypeOf<null>();
  }

  negatives(): void {
    // @ts-expect-error `$id` is stable for the instance
    this.$id = 'replacement';
    // @ts-expect-error a declared option is an input, never a store
    this.$options.target = 'elsewhere';
    // @ts-expect-error an undeclared one is read through the same view
    this.$options.whatever = 1;
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

class Partial extends Base<{ $options: { a: string } }> {
  static config = { name: 'Partial' };

  assertions(): void {
    expectTypeOf(this.$options.a).toEqualTypeOf<string>();
    expectTypeOf(this.$el).toEqualTypeOf<HTMLElement>();
    expectTypeOf(this.$refs.whatever).toEqualTypeOf<HTMLElement | HTMLElement[]>();
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
    expectTypeOf(this.$options.whatever).toEqualTypeOf<unknown>();
  }
}

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

function acceptsAnyComponent(instance: Base): string {
  return instance.$config.name;
}

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
