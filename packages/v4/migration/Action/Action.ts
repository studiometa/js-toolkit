import {
  Base,
  watchAttributes,
  type BaseConfig,
  type BaseProps,
  type MountedReturn,
} from '../../src/index.js';
import { ActionEvent } from './ActionEvent.js';

/**
 * The attribute prefix for the virtual `on:<event>[.<modifier>]` option.
 *
 * v3 tested `attribute.name.includes('on:')`, which also matches
 * `data-button-on:click` and `aria-on:x`. Anchored here, since the docs
 * specify `data-on:` and nothing else.
 */
const ON_ATTRIBUTE_PREFIX = 'data-on:';

/**
 * The binding key for the `on`/`target`/`effect` triple.
 *
 * Every other key is the attribute name that produced the binding, and an
 * attribute name always contains a `-`, so this cannot collide with one.
 */
const OPTION_BINDING_KEY = 'options';

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
 * Port of @studiometa/ui 1.10's `Action` (57 code lines → 71 here, all of the
 * growth being live rebinding v3 never had).
 *
 * Bindings come from `data-on:<event>` attributes and/or the `on`, `target`
 * and `effect` options. Each is parsed into an `ActionEvent`, attached, and
 * held in `#bindings` under the key that produced it — so one binding can be
 * replaced without disturbing the others.
 *
 * | change | forced by |
 * | --- | --- |
 * | `mounted()` + `destroyed()` attaching and detaching → keyed bindings released by the `mounted()` cleanup | the v4 idiom; setup and teardown in one closure, and `destroyed()` had nothing else in it |
 * | `interface ActionProps extends BaseProps` → a type alias | REPORT.md gap 14: an interface has no implicit index signature, so it fails `$options`'s `Record<string, unknown>` constraint |
 * | **`class Action<T extends BaseProps = BaseProps> extends Base<ActionProps & T>` → no type parameter** | REPORT.md gap 22 — see below |
 * | the `__actionEvents` memo → re-parsed per mount cycle, and per attribute change | see below |
 * | `$options.selector` declared in the props but never in `config.options` | deleted — it was dead in v3, and v4's `$options` is built from the config so it would not have existed anyway |
 *
 * ## Live rebinding — the whole surface, through two mechanisms
 *
 * Both halves of the binding surface are live, and each uses the mechanism
 * that fits what names it:
 *
 * - **`data-on:<event>`** is named by the component, not by the framework, so
 *   no `attributeFilter` can enumerate it. `watchAttributes()` (REPORT.md
 *   gap 21) is the element-scoped observer that reports it, and the callback
 *   filters on the prefix.
 * - **`on` / `target` / `effect`** are declared options, so the framework
 *   already observes them and reports each through `option<Name>Changed()`.
 *   Watching them with `watchAttributes()` too would work and would be wrong:
 *   it would re-derive the `data-option-<kebab>` spelling by hand, which is
 *   the contract-copying mistake gap 20 was about.
 *
 * The two meet at `#bind()`, so "removed, changed, added" has one
 * implementation: release whatever the key held, then attach whatever the key
 * now describes. A removal is a release with nothing to attach.
 *
 * ## Two coalescing rules, and only one of them is the framework's
 *
 * `watchAttributes()` coalesces **per attribute per batch** and reports against
 * the final DOM value, so a rewrite that nets out (`a` → `b` → `a`, exactly
 * what a morph produces) reports nothing at all. Neither rule needed working
 * around, and that is not luck: a binding here is a *pure function of the
 * attribute's current value*, so "tell me the final value, once" is precisely
 * the contract it wants. A binding that accumulated state across edits would
 * have been broken by both rules.
 *
 * The triple is the case the framework cannot coalesce for us, because it is
 * **one binding derived from three attributes** and `option<Name>Changed()`
 * is per option name. A morph touching `target` and `effect` in one batch
 * calls back twice for one binding. `#bindOptions()` therefore keeps its own
 * signature of the three values and returns early when it is unchanged —
 * three lines, and they also absorb the three initial calls at mount.
 *
 * ## Why the memo had to go, and why that is a fix
 *
 * v3 cached the parsed bindings in `__actionEvents` for the instance's whole
 * life. In v4 an instance survives being moved: a DOM move is a destroy plus
 * a mount of the **same instance**, and re-insertion after a `swap()` can
 * bring different `data-on:*` attributes on the same element. Re-parsing per
 * mount cycle is the same per-cycle rule the rest of v4 follows, and with the
 * watcher above it is now per change as well.
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

  /** Live bindings by the key that produced them, each holding its release. */
  #bindings = new Map<string, () => void>();

  /** The `on`/`target`/`effect` values the option binding was built from. */
  #optionSignature: string | null = null;

  /**
   * The bindings currently attached, for introspection. Parsed fresh, so this
   * describes the element as it is now rather than as it was at mount.
   */
  get actionEvents(): ActionEvent[] {
    const actionEvents: ActionEvent[] = [];

    for (const { name, value } of Array.from(this.$el.attributes)) {
      const actionEvent = this.#parseAttribute(name, value);
      if (actionEvent) {
        actionEvents.push(actionEvent);
      }
    }

    const fromOptions = this.#parseOptions();
    if (fromOptions) {
      actionEvents.push(fromOptions);
    }

    return actionEvents;
  }

  mounted(): MountedReturn {
    // The option triple is already bound: `option<Name>Changed()` runs with
    // `initial: true` before `mounted()`, which is why nothing here touches it.
    for (const { name, value } of Array.from(this.$el.attributes)) {
      this.#bind(name, this.#parseAttribute(name, value));
    }

    const stopWatchingAttributes = watchAttributes(this.$el, ({ name, value }) => {
      if (name.startsWith(ON_ATTRIBUTE_PREFIX)) {
        this.#bind(name, this.#parseAttribute(name, value));
      }
    });

    return () => {
      stopWatchingAttributes();
      for (const release of this.#bindings.values()) {
        release();
      }
      this.#bindings.clear();
      this.#optionSignature = null;
    };
  }

  optionOnChanged(): void {
    this.#bindOptions();
  }

  optionTargetChanged(): void {
    this.#bindOptions();
  }

  optionEffectChanged(): void {
    this.#bindOptions();
  }

  /** One `data-on:<event>` attribute, or `null` for anything else. */
  #parseAttribute(name: string, value: string | null): ActionEvent | null {
    if (!name.startsWith(ON_ATTRIBUTE_PREFIX) || value === null) {
      return null;
    }
    return new ActionEvent(this, name.slice(ON_ATTRIBUTE_PREFIX.length), value);
  }

  /** The `on`/`target`/`effect` triple, or `null` when no effect is set. */
  #parseOptions(): ActionEvent | null {
    const { on, target, effect } = this.$options;
    if (!on || !effect) {
      return null;
    }
    const definition = target ? `${target}${ActionEvent.effectSeparator}${effect}` : effect;
    return new ActionEvent(this, on, definition);
  }

  #bindOptions(): void {
    const { on, target, effect } = this.$options;
    // Three attributes, one binding: dedupe here, because the framework
    // reports each option separately and cannot know they are one thing.
    const signature = JSON.stringify([on, target, effect]);
    if (signature === this.#optionSignature) {
      return;
    }
    this.#optionSignature = signature;
    this.#bind(OPTION_BINDING_KEY, this.#parseOptions());
  }

  /**
   * Make `key` hold exactly `actionEvent` — the one place "removed, changed,
   * added" is decided. Releasing before attaching is what stops a rewrite
   * leaking the listener it replaces.
   */
  #bind(key: string, actionEvent: ActionEvent | null): void {
    this.#bindings.get(key)?.();
    this.#bindings.delete(key);
    if (actionEvent) {
      this.#bindings.set(key, actionEvent.attach());
    }
  }
}
