/**
 * v3 shipped `withExtraConfig(Class, config, deepmergeOptions)` because v3 read
 * a class's **own** static `config`: a subclass had to restate what its parent
 * declared, so a decorator did the merge and renamed the result. v4 resolves
 * `config` along the prototype chain (`resolveConfig()`), which makes the
 * decorator a plain `extends` plus a `static config`.
 *
 * These specs pin that equivalence against the three `@studiometa/ui`
 * `withExtraConfig` call sites — the mapbox controls — and against the two
 * v3 behaviours v4 deliberately dropped: the auto-rename on collision and the
 * deep merge of the config.
 */
import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';
import { Base, type BaseConfig, type BaseProps } from './Base.js';
import { component } from './decorators.js';
import { DIAGNOSTICS } from './diagnostic-contract.js';
import { registerComponent } from './registry.js';
import { getInstance, resetDom, settle, TodoItem } from './test-utils.js';

afterEach(resetDom);

interface ControlProps extends BaseProps {
  $options: { position: string };
}

/**
 * `AbstractMapboxControl`: the shared option, one ref and one family entry.
 * It is never registered, which is all "abstract" means to the registry.
 */
class AbstractControl<T extends BaseProps = BaseProps> extends Base<ControlProps & T> {
  static config: BaseConfig = {
    name: 'AbstractControl',
    refs: ['handle'],
    options: { position: { type: String, default: 'top-right' } },
    components: { TodoItem },
  };

  /** Mirrors the ui getter which spreads `$options` into the mapbox control. */
  controlOptions(): Record<string, unknown> {
    const { position: _position, ...options } = this.$options;
    return options;
  }
}

function render(name: string, attributes: Record<string, string> = {}): HTMLElement {
  const el = document.createElement('div');
  el.setAttribute('data-component', name);
  for (const [attribute, value] of Object.entries(attributes)) {
    el.setAttribute(attribute, value);
  }
  document.body.append(el);
  return el;
}

describe('extending a component with extra config', () => {
  it('adds options to the base and keeps everything the base declared', async () => {
    interface NavProps extends ControlProps {
      $options: ControlProps['$options'] & { showCompass: boolean; showZoom: boolean };
    }

    class NavControl extends AbstractControl<NavProps> {
      static config: BaseConfig = {
        name: 'NavControl',
        options: { showCompass: Boolean, showZoom: Boolean },
      };
    }

    registerComponent(NavControl);
    const el = render('NavControl', { 'data-option-show-compass': '' });
    await settle();

    const instance = getInstance<NavControl>(el, 'NavControl');
    expect(instance.$config.name).toBe('NavControl');
    expect(Object.keys(instance.$config.options ?? {})).toEqual([
      'position',
      'showCompass',
      'showZoom',
    ]);
    // The inherited option keeps its default, the added ones read the DOM.
    expect(instance.$options.position).toBe('top-right');
    expect(instance.controlOptions()).toEqual({ showCompass: true, showZoom: false });
    expectTypeOf(instance.$options.showCompass).toEqualTypeOf<boolean>();
    expectTypeOf(instance.$options.position).toEqualTypeOf<string>();

    // Refs and the child family come along; the base is left untouched.
    expect(instance.$config.refs).toEqual(['handle']);
    expect(Object.keys(instance.$config.components ?? {})).toEqual(['TodoItem']);
    expect(Object.keys(AbstractControl.config.options ?? {})).toEqual(['position']);
  });

  it('renames the base without declaring anything else', async () => {
    class FullscreenControl extends AbstractControl {
      static config: BaseConfig = { name: 'FullscreenControl' };
    }

    registerComponent(FullscreenControl);
    const el = render('FullscreenControl', { 'data-option-position': 'bottom-left' });
    el.innerHTML = '<button data-ref="handle"></button>';
    await settle();

    const instance = getInstance<FullscreenControl>(el, 'FullscreenControl');
    expect(instance.$config.name).toBe('FullscreenControl');
    expect(instance.$options.position).toBe('bottom-left');
    expect(instance.$refs.handle).toBe(el.firstElementChild);
  });

  it('mounts two extensions of one base side by side, each under its own name', async () => {
    class LeftControl extends AbstractControl {
      static config: BaseConfig = {
        name: 'LeftControl',
        options: { position: { type: String, default: 'top-left' } },
      };
    }

    class RightControl extends AbstractControl {
      static config: BaseConfig = { name: 'RightControl' };
    }

    registerComponent(LeftControl);
    registerComponent(RightControl);
    const left = render('LeftControl');
    const right = render('RightControl');
    await settle();

    // A restated option replaces the parent definition whole; it does not
    // merge into it, so the derived default wins with nothing left behind.
    expect(getInstance(left, 'LeftControl').$options.position).toBe('top-left');
    expect(getInstance(right, 'RightControl').$options.position).toBe('top-right');
  });

  it('extends a class it cannot edit, in expression position', async () => {
    class Vendor extends Base {
      static config: BaseConfig = { name: 'Vendor', options: { size: { type: String } } };
    }

    registerComponent(Vendor);
    registerComponent(
      class extends Vendor {
        static config: BaseConfig = { name: 'CompactVendor', options: { compact: Boolean } };
      },
    );
    const el = render('CompactVendor', { 'data-option-compact': '' });
    await settle();

    const instance = getInstance(el, 'CompactVendor');
    expect(instance).toBeInstanceOf(Vendor);
    expect(instance.$options.compact).toBe(true);
    expect(Object.keys(instance.$config.options ?? {})).toEqual(['size', 'compact']);
  });

  it('declares and registers the extension in one step with `@component`', async () => {
    @component({ name: 'DecoratedControl', options: { showZoom: Boolean } })
    class DecoratedControl extends AbstractControl {}

    const el = render('DecoratedControl');
    await settle();

    const instance = getInstance<DecoratedControl>(el, 'DecoratedControl');
    expect(instance).toBeInstanceOf(AbstractControl);
    expect(instance.$config.name).toBe('DecoratedControl');
    expect(Object.keys(instance.$config.options ?? {})).toEqual(['position', 'showZoom']);
    expect(instance.$options.position).toBe('top-right');
  });
});

describe('what v3 did and v4 does not', () => {
  it('requires the rename instead of inventing one, and warns on the collision', async () => {
    class Widget extends Base {
      static config: BaseConfig = { name: 'Widget' };
    }

    class UnnamedWidget extends Widget {
      // v3 renamed the collision to `WidgetWithExtraConfig`. v4 makes `name`
      // required and the registry first-wins, so the rename is the author's.
      // @ts-expect-error `name` is missing.
      static config: BaseConfig = { options: { loud: Boolean } };
    }

    registerComponent(Widget);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    registerComponent(UnnamedWidget);
    const el = render('Widget');
    await settle();

    expect(warn).toHaveBeenCalledWith(
      `[js-toolkit:${DIAGNOSTICS.registry.conflict}] "Widget" is already registered; the incoming declaration was ignored.`,
    );
    expect(getInstance(el, 'Widget')).not.toBeInstanceOf(UnnamedWidget);
    warn.mockRestore();
  });

  it('does not deep merge an option definition it restates', () => {
    class Themed extends Base {
      static config: BaseConfig = {
        name: 'Themed',
        options: { theme: { type: String, default: 'light' } },
      };
    }

    class Retyped extends Themed {
      // Only the type is restated: v3's deep merge kept the parent default,
      // v4 replaces the definition, so the option falls back to the empty
      // string. Restate the default when the derived class wants one.
      static config: BaseConfig = { name: 'Retyped', options: { theme: String } };
    }

    const instance = new Retyped(document.createElement('div'));
    expect(instance.$config.options?.theme).toBe(String);
    expect(instance.$options.theme).toBe('');
  });
});
