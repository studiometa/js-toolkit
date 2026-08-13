import { Base, type BaseConfig, type BaseProps, type MountedReturn } from '../../src/index.js';
import { ActionEvent } from './ActionEvent.js';

/**
 * The attribute prefix for the virtual `on:<event>[.<modifier>]` option.
 *
 * v3 tested `attribute.name.includes('on:')`, which also matches
 * `data-button-on:click` and `aria-on:x`. Anchored here, since the docs
 * specify `data-on:` and nothing else.
 */
const ON_ATTRIBUTE_PREFIX = 'data-on:';

export type ActionProps = BaseProps & {
  $options: {
    on: string;
    target: string;
    effect: string;
  };
};

/**
 * Action — a declarative bridge from DOM events to effects on other
 * components.
 *
 * Port of @studiometa/ui 1.10's `Action` (57 code lines → 40 here).
 *
 * Bindings come from `data-on:<event>` attributes and/or the `on`, `target`
 * and `effect` options; each is parsed into an `ActionEvent`, bound on mount
 * and released by the cleanup `mounted()` returns.
 *
 * | change | forced by |
 * | --- | --- |
 * | `mounted()` + `destroyed()` attaching and detaching → `mounted()` returning cleanups | the v4 idiom; setup and teardown in one closure, and `destroyed()` had nothing else in it |
 * | `interface ActionProps extends BaseProps` → a type alias | REPORT.md gap 14: an interface has no implicit index signature, so it fails `$options`'s `Record<string, unknown>` constraint |
 * | **`class Action<T extends BaseProps = BaseProps> extends Base<ActionProps & T>` → no type parameter** | REPORT.md gap 21 — see below |
 * | the `__actionEvents` memo → re-parsed each mount cycle | see below |
 * | `$options.selector` declared in the props but never in `config.options` | deleted — it was dead in v3, and v4's `$options` is built from the config so it would not have existed anyway |
 *
 * ## Why the props type parameter had to go
 *
 * v3 lets a consumer subclass with extra props: `class MyAction extends
 * Action<MyProps>`. In v4 that does not compile *inside the class*, and not
 * because of the intersection: `Options<T>` is
 * `T['$options'] extends Record<string, unknown> ? T['$options'] : …`, a
 * conditional over a naked type parameter, so TypeScript defers it and
 * `this.$options.effect` is `{}` however the parameter is written. Both
 * `Base<ActionProps & T>` and the tighter `T extends ActionProps` were tried;
 * both fail on the same line. The class body cannot read its own options
 * while the props type is generic.
 *
 * Nothing in ui subclasses `Action`, so dropping it costs nothing here — but
 * `Action` is not the only v3 class shaped this way, and the fix is core's:
 * `Options<T>` needs a non-deferring form.
 *
 * ## Why the memo had to go, and why that is a fix
 *
 * v3 cached the parsed bindings in `__actionEvents` for the instance's whole
 * life. In v4 an instance survives being moved: a DOM move is a destroy plus
 * a mount of the **same instance**, and re-insertion after a `swap()` can
 * bring different `data-on:*` attributes on the same element. Re-parsing per
 * mount cycle is the same per-cycle rule the rest of v4 follows, costs one
 * pass over `$el.attributes`, and makes `data-on:*` attributes editable at
 * runtime — which is what a `Data`-driven template would do to them. It also
 * removes a field.
 *
 * ## What has no framework support
 *
 * Target resolution. See `instances.ts`: `Action` is built on v3's global
 * instance registry, v4 has none, and neither `$query`, `$closest` nor
 * `$watchChildren` covers the page-wide case the component exists for. The
 * port re-derives it from the DOM, which works and is not slower — but it
 * hard-codes the registry's `data-component~=` attribute contract.
 */
export class Action extends Base<ActionProps> {
  static config: BaseConfig = {
    name: 'Action',
    options: {
      on: {
        type: String,
        default: 'click',
      },
      target: String,
      effect: String,
    },
  };

  /**
   * The bindings declared on this element: one per `data-on:<event>`
   * attribute, plus one for the `on`/`target`/`effect` option triple when an
   * `effect` is set.
   */
  get actionEvents(): ActionEvent[] {
    const actionEvents: ActionEvent[] = [];

    for (const { name, value } of Array.from(this.$el.attributes)) {
      if (name.startsWith(ON_ATTRIBUTE_PREFIX)) {
        actionEvents.push(new ActionEvent(this, name.slice(ON_ATTRIBUTE_PREFIX.length), value));
      }
    }

    const { on, target, effect } = this.$options;
    if (on && effect) {
      const definition = target ? `${target}${ActionEvent.effectSeparator}${effect}` : effect;
      actionEvents.push(new ActionEvent(this, on, definition));
    }

    return actionEvents;
  }

  mounted(): MountedReturn {
    return this.actionEvents.map((actionEvent) => actionEvent.attach());
  }
}
