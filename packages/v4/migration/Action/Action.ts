import {
  Base,
  watchAttributes,
  type BaseConfig,
  type BaseProps,
  type MountedReturn,
} from '../../src/index.js';
import { ActionEvent } from './ActionEvent.js';

/** The required prefix for virtual `on:<event>[.<modifier>]` options. */
const ON_ATTRIBUTE_PREFIX = 'data-on:';

/** Binding key that cannot collide with hyphenated attribute names. */
const OPTION_BINDING_KEY = 'options';

export type ActionProps = BaseProps & {
  $options: {
    on: string;
    target: string;
    effect: string;
  };
};

/**
 * Maps DOM events to component effects through `data-on:*` attributes or options.
 * Bindings update independently when their source changes.
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
    // Initial option hooks bind the option triple before `mounted()`.
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
    // Three independently reported options produce one binding.
    const signature = JSON.stringify([on, target, effect]);
    if (signature === this.#optionSignature) {
      return;
    }
    this.#optionSignature = signature;
    this.#bind(OPTION_BINDING_KEY, this.#parseOptions());
  }

  /** Replace one keyed binding, releasing the previous listener first. */
  #bind(key: string, actionEvent: ActionEvent | null): void {
    this.#bindings.get(key)?.();
    this.#bindings.delete(key);
    if (actionEvent) {
      this.#bindings.set(key, actionEvent.attach());
    }
  }
}
