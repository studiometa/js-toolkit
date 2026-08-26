import {
  Base,
  namespaceQualifier,
  watchAttributeNamespace,
  type BaseConfig,
  type BaseProps,
  type MountedReturn,
} from '../../src/index.js';
import { ActionEvent } from './ActionEvent.js';

/**
 * The namespace of the virtual `on:<event>[.<modifier>]` declarations. Its
 * qualifiers are any DOM event, so the set of names is open and the namespace
 * is watched per element rather than registered.
 */
const ON_NAMESPACE = 'data-on';

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

  /** The release of the binding built from the `on`/`target`/`effect` triple. */
  #releaseOptionBinding?: () => void;

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
    // The option triple is bound by the option hooks, which run before
    // `mounted()`; the namespace owns the attribute half.
    const stopWatchingNamespace = watchAttributeNamespace(
      this.$el,
      ON_NAMESPACE,
      ({ qualifier, value }) => new ActionEvent(this, qualifier, value).attach(),
    );

    return () => {
      stopWatchingNamespace();
      this.#releaseOptionBinding?.();
      this.#releaseOptionBinding = undefined;
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
    const qualifier = namespaceQualifier(ON_NAMESPACE, name);
    if (qualifier === null || value === null) {
      return null;
    }
    return new ActionEvent(this, qualifier, value);
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

  /**
   * The one binding the namespace cannot own: it is derived from three
   * independently reported options rather than from one attribute, so it needs
   * its own release and its own change test.
   */
  #bindOptions(): void {
    const { on, target, effect } = this.$options;
    const signature = JSON.stringify([on, target, effect]);
    if (signature === this.#optionSignature) {
      return;
    }
    this.#optionSignature = signature;
    this.#releaseOptionBinding?.();
    this.#releaseOptionBinding = this.#parseOptions()?.attach();
  }
}
