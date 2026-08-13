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

/**
 * One `data-on:<event>` binding, or the `on`/`target`/`effect` option triple.
 *
 * Port of @studiometa/ui 1.10's `ActionEvent` (143 code lines → 96 here plus
 * `expression.ts`, and `instances.ts` for the co-located instances alone —
 * the page-wide lookup is core's `getInstances()` since gap 20 closed).
 *
 * ## Does v4's delegation make this redundant? No — and that is the finding.
 *
 * v4 removes hand-written `addEventListener` from most components: a method
 * named `onBtnClick` is delegated from the root element, one listener per
 * event type, with the capture phase used automatically for the events that
 * do not bubble. Four of the five families already ported deleted listener
 * bookkeeping because of it.
 *
 * **`Action` deletes none of it.** `#bindHandlers()` resolves handlers from
 * *method names declared on the class*: `on<Child><Event>`, `on<Ref><Event>`,
 * `on<Event>`. `Action`'s bindings are strings read off attributes at mount
 * — `data-on:click.prevent.stop`, `data-option-on="mouseenter"` — and there
 * is no method to name, no ref to name, and the type is not known until the
 * attribute is read. A runtime-configured listener is exactly the case the
 * name-based mechanism cannot express, so the port calls `$on()` and keeps
 * the parsing.
 *
 * What *does* disappear is smaller and real:
 *
 * | v3 | v4 |
 * | --- | --- |
 * | `attachEvent()` + `detachEvent()`, called from `mounted()`/`destroyed()` | one `attach()` returning its own cleanup |
 * | the `EventListenerObject` trick (`addEventListener(event, this)`) | a closure; `$on` takes an `EventListener` |
 * | `Action.destroyed()` | gone — nothing left in it |
 *
 * Three methods and a lifecycle hook become one method. That is a tidy-up,
 * not a deletion of the mechanism, and the honest summary is that
 * **delegation buys `Action` less than it buys any other component in ui**,
 * because `Action` is the one component whose events are data.
 *
 * The one place the tidy-up paid off beyond tidiness: `attach()` returning
 * its own release is what lets `Action` rebind a single attribute when it
 * changes, without knowing anything about the others. Detaching by event type
 * — v3's `detachEvent()` — could not have done it, since two `data-on:*`
 * attributes may name the same type.
 *
 * The modifiers all survive: `capture`, `once` and `passive` are
 * `AddEventListenerOptions`, which `$on(type, listener, options)` forwards
 * verbatim, and `prevent`/`stop`/`debounce` are handler-body concerns. Note
 * that this is a capability the *delegated* path does not have: a delegated
 * handler's listener options are chosen by core (`capture` iff the type is in
 * `CAPTURED_EVENTS`), so `once` and `passive` are unreachable from a method
 * name. `$on` is the escape hatch and it is sufficient.
 */
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

  /**
   * The instances sharing the action's element, by name. Each becomes a named
   * parameter of the compiled effect, which is what makes
   * `data-component="Action Dialog" data-on:cancel="Dialog.close()"` work.
   *
   * Recomputed per event, so a component mounted on the same element *after*
   * the `Action` is still visible — the spec `sees an instance mounted on the
   * action element after it` covers exactly that, and it is v4's
   * order-independence showing up in a component that never asked for it.
   */
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
   * Resolve the target definition to a list of `{ Name: instance }` entries.
   *
   * With no definition the target is the action itself, which is what makes
   * `data-option-effect="target.$el.classList.toggle('x')"` a complete
   * component with no target at all.
   *
   * Ordering differs from v3 by design: v3 looped over the global instance
   * set and tested each part inside, so results came out in **instance
   * construction order** interleaved across names. This loops parts first, so
   * results are grouped by target name and in DOM order within a name. Both
   * satisfy ui's own `resolves multiple targets` assertion; the grouped one
   * is the order a reader of the attribute expects, and it no longer depends
   * on which component happened to be constructed first.
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
        // v3 failed the same way, silently: an unparseable part contributes
        // no targets rather than throwing inside an event handler.
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

    // One read of the element's instances for both the parameter names and
    // their values. v3 read `this.instances` twice — once in the `effect`
    // getter to build the signature, once in `executeEffect` to build the
    // arguments — so a component mounting between the two calls produced a
    // function whose parameter list and argument list disagreed.
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
   * Run the effect once per target.
   *
   * The argument list is v3's, unchanged, because it is documented API:
   * `ctx`, `event`, `target`, `action`, `self`, `$el`, then one argument per
   * co-located instance. `this` is the action's element.
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
        // v3 called `action.$warn(err)`; v4 has no `$warn` (REPORT.md gap 10).
        warn(error);
      }
    }
  }

  /**
   * Bind the event and return the release.
   *
   * `$on` is the whole of v3's `attachEvent`/`detachEvent` pair: the
   * modifiers map straight onto `AddEventListenerOptions`, and the returned
   * closure removes the listener with the same options. Clearing the debounce
   * timer joins it, so a destroy during the debounce window cannot fire an
   * effect against components that are on their way out.
   */
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
