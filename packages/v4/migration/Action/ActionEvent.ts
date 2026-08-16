import { getInstances, type Base } from '../../src/index.js';
import { getEffect, type EffectFunction } from './expression.js';
import { getInstancesOn } from './instances.js';

/**
 * Extract a component name and an optional additional selector from one
 * target part: `Dialog`, `Dialog(#modal)`, `Dialog([data-can-be-closed])`.
 */
const TARGET_REGEX = /([a-zA-Z]+)(\((.*)\))?/;

export type Modifier = 'prevent' | 'stop' | 'once' | 'passive' | 'capture' | 'debounce';

/** A resolved target: one entry, keyed by the component's name. */
export type ActionTarget = Record<string, Base>;

function warn(...args: unknown[]): void {
  console.warn('[action]', ...args);
}

/** One runtime event binding from an attribute or the option triple. */
export class ActionEvent {
  static modifierSeparator = '.';
  static targetSeparator = ' ';
  static effectSeparator = '->';

  /** The `Action` this binding belongs to. */
  action: Base;

  /** The event type to listen to. */
  event: string;

  modifiers: Modifier[];

  debounceDelay = 100;

  /** `Target Target(.selector)` — empty means "the action itself". */
  targetDefinition: string;

  /** The expression source. */
  effectDefinition: string;

  #debounceTimer?: number;

  /**
   * @param action           The parent `Action` instance.
   * @param eventDefinition  Event plus modifiers: `click.prevent.stop`.
   * @param effectDefinition Targets and effect: `Target(.selector)->target.$destroy()`.
   */
  constructor(action: Base, eventDefinition: string, effectDefinition: string) {
    this.action = action;
    const [event, ...modifiers] = eventDefinition.split(ActionEvent.modifierSeparator);
    this.event = event;

    const processedModifiers: Modifier[] = [];
    for (const modifier of modifiers) {
      if (modifier.startsWith('debounce')) {
        processedModifiers.push('debounce');
        this.debounceDelay = Number.parseInt(modifier.replace('debounce', '') || '100', 10);
      } else {
        processedModifiers.push(modifier as Modifier);
      }
    }
    this.modifiers = processedModifiers;

    let effect = effectDefinition;
    let targetDefinition = '';
    if (effect.includes(ActionEvent.effectSeparator)) {
      [targetDefinition, effect] = effect.split(ActionEvent.effectSeparator);
    }

    this.targetDefinition = targetDefinition.trim();
    this.effectDefinition = effect.trim();
  }

  /** Co-located mounted instances, recomputed for each event. */
  get instances(): Map<string, Base> {
    return getInstancesOn(this.action.$el);
  }

  /**
   * The compiled effect for the current instance list.
   */
  get effect(): EffectFunction {
    return getEffect(this.effectDefinition, [...this.instances.keys()]);
  }

  /**
   * Resolve targets in definition-part order and DOM order. With no definition,
   * target the action itself.
   */
  get targets(): ActionTarget[] {
    const { targetDefinition } = this;

    if (!targetDefinition) {
      return [{ Action: this.action }];
    }

    const parts = targetDefinition
      .split(ActionEvent.targetSeparator)
      .filter(Boolean)
      .map((part) => {
        const [, name, , selector] = part.match(TARGET_REGEX) ?? [];
        return [name, selector] as const;
      });

    const targets: ActionTarget[] = [];
    for (const [name, selector] of parts) {
      if (!name) {
        // Ignore unparseable target parts.
        continue;
      }
      for (const instance of getInstances(name)) {
        if (!selector || instance.$el.matches(selector)) {
          targets.push({ [name]: instance });
        }
      }
    }

    return targets;
  }

  /**
   * Apply the modifiers that live in the handler body, then run the effect.
   */
  handleEvent(event: Event): void {
    const { modifiers } = this;

    if (modifiers.includes('prevent')) {
      event.preventDefault();
    }
    if (modifiers.includes('stop')) {
      event.stopPropagation();
    }

    // Use one instance snapshot for both parameter names and values.
    const instances = this.instances;
    const effect = getEffect(this.effectDefinition, [...instances.keys()]);
    const { targets } = this;

    if (modifiers.includes('debounce')) {
      clearTimeout(this.#debounceTimer);
      this.#debounceTimer = window.setTimeout(() => {
        this.executeEffect(targets, effect, event, instances);
      }, this.debounceDelay);
    } else {
      this.executeEffect(targets, effect, event, instances);
    }
  }

  /**
   * Run once per target. Arguments are `ctx`, `event`, `target`, `action`,
   * `self`, `$el`, then each co-located instance. `this` is the action element.
   */
  executeEffect(
    targets: ActionTarget[],
    effect: EffectFunction,
    event: Event,
    instances: Map<string, Base> = this.instances,
  ): void {
    const { action } = this;

    for (const target of targets) {
      try {
        const [currentTarget] = Object.values(target);
        const args = [
          target,
          event,
          currentTarget,
          action,
          action,
          currentTarget.$el,
          ...instances.values(),
        ];
        const value = effect.apply(action.$el, args);
        if (typeof value === 'function') {
          (value as EffectFunction).apply(action.$el, args);
        }
      } catch (error) {
        warn(error);
      }
    }
  }

  /** Bind the event and return a release that also cancels pending debounce. */
  attach(): () => void {
    const { modifiers } = this;
    const off = this.action.$on(this.event, (event) => this.handleEvent(event), {
      capture: modifiers.includes('capture'),
      once: modifiers.includes('once'),
      passive: modifiers.includes('passive'),
    });

    return () => {
      clearTimeout(this.#debounceTimer);
      off();
    };
  }
}
