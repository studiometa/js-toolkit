import { Base, defaultScheduler, type BaseConfig, type BaseProps } from '../../src/index.js';
import { emitDomUpdate, runWrapped, warn } from './dom-update.js';
import { getCallback } from './expression.js';
import {
  isCheckbox,
  isInput,
  readControlValue,
  resolvePropertyName,
  setProperty,
  valuesEqual,
  writeControlValue,
  type DataControlContext,
} from './formControl.js';
import {
  RESCOPE,
  resolveDataRegistry,
  type DataRegistry,
  type DataScopeMember,
  type DataUpdate,
  type DataValue,
  type Rescopable,
} from './registry.js';

// A type alias, not an interface: an interface has no implicit index
// signature, so `$options: SomeInterface` fails `BaseProps`'s
// `Record<string, unknown>` constraint (REPORT.md gap 14). It bites here
// because the option set is named to be shared with three subclasses, which
// is exactly when naming it is worth doing.
export type DataBindOptions = {
  prop: string;
  immediate: boolean;
  key: string;
  group: string;
};

export type DataBindProps = BaseProps & {
  $options: DataBindOptions;
};

type VirtualBinding =
  | { type: 'text' | 'if'; expression: string }
  | { type: 'prop' | 'attr' | 'class' | 'style'; name: string; expression: string };

/**
 * DataBind — a two-way binding between an element and a named group.
 *
 * Port of `@studiometa/ui` 1.10's `DataBind` (522 lines → 380 here).
 *
 * ## Ported unchanged
 *
 * Everything about the element: `prop` resolution (`valueAsNumber`,
 * `valueAsDate`, `textContent`), the virtual `data-bind:prop|attr|class|
 * style|text|if` bindings and their nullish semantics, `toggle()`,
 * `increment()`, `cycle()`, the `data-bind:if` template protocol. That is
 * roughly 60 % of the file and it moved by copy-paste.
 *
 * ## What was forced to change
 *
 * | change | forced by |
 * | --- | --- |
 * | `extends withGroup(Base, DATA_GROUP_NAMESPACE, {…})` → `extends Base` | **v4 exports no group primitive.** `src/index.ts` has no `withGroup`, by design (DESIGN.md §5). |
 * | `getDataScope(this.$el)` DOM walk → `resolveDataRegistry(this.$el)` | the context protocol resolves through the DOM event path. Same nearest-first answer, no `__base__` spelunking. |
 * | `this.$group` (a `Set` from the decorator) → `registry.members(group)` | the peers and the value cell are now one object, which is what let `DataChannel` disappear. |
 * | `this.dataScope?.getChannel(group)` **or** `getDataChannel(this.$group)` | → one call. The scoped and page-wide halves were two code paths in every method that published; now the registry is the same class either way. |
 * | `DataChannel` (87 lines, alien-signals) → core `Signal` | the only alien-signals user in all of ui. See `registry.ts`. |
 * | the resolved scope memoized **for the instance's life** → memoized **per mount cycle** | v4 lifecycle. A DOM move is a destroy + mount, so wrapping existing content in a `DataScope` re-resolves for free — a case v3's permanent memoization got permanently wrong. |
 * | `destroyed()` → the `mounted()` cleanup | v4 idiom; joining and leaving a group are one closure. |
 * | `nextTick()` → `defaultScheduler.background()` | v4 ships no `nextTick`. The background lane is where eager mounts queue, so "after everything mounted" is a guarantee rather than a hope. |
 * | `this.$warn(…)` → `warn(…)` | no `$warn` in v4 (REPORT.md gap 10). |
 * | `[RESCOPE]()` | new — see `DataScope.mounted()`. Nothing in core can express it. |
 *
 * ## What has no framework support
 *
 * `$watchChildren` looks like the answer to group membership and is not, for
 * three independent reasons, so this port registers members instead:
 *
 * 1. **A group is not a subtree.** Membership is *nearest scope + group
 *    name*: a member inside a nested `DataScope` belongs to the nested one,
 *    while `$watchChildren` on the outer scope collects it too. Filtering it
 *    back out means re-deriving each member's nearest scope — which is the
 *    resolution `$watchChildren` was supposed to replace.
 * 2. **It matches on exact `config.name`.** `DataModel`, `DataComputed` and
 *    `DataEffect` are `DataBind` subclasses with their own names, so a scope
 *    needs one collection per class — and a user subclass gets none.
 * 3. **The page-wide group has no component to watch from.** There is no
 *    root `Base` instance, and `provideRootContext` deliberately does not
 *    create one.
 *
 * *Ask for core:* `$watchChildren(name)` matching subclasses (an
 * `instanceof`-shaped predicate rather than a name equality), which would fix
 * (2). (1) and (3) are properties of this family, not gaps — a registry
 * members set is the right shape here and costs two lines.
 */
export class DataBind extends Base<DataBindProps> implements DataScopeMember, Rescopable {
  static config: BaseConfig = {
    name: 'DataBind',
    options: {
      prop: String,
      immediate: Boolean,
      key: String,
      group: String,
    },
  };

  /**
   * Resolved on first use and kept **for the mount cycle**.
   *
   * Lazy rather than resolved at a fixed lifecycle point, because `get()` and
   * `set()` are specified to work on an instance that has not mounted yet —
   * ui's specs construct a `DataBind` and call `set()` on the next line, and
   * an `Action` can reach one through `$closest` before the registry gets to
   * it. That is v3's `__dataScopeResolved` memoization, and it is the reason
   * this port uses **neither** `$inject` (which resolves at one moment) nor
   * the `@inject` field decorator (which resolves at construction, the
   * earliest and worst moment of all).
   *
   * @private
   */
  #registry?: DataRegistry;

  /** Undoes `#connect()`. `undefined` while disconnected. @private */
  #leaveGroup?: () => void;

  #virtualBindings?: VirtualBinding[];

  #virtualValue?: DataValue;

  #hasVirtualValue = false;

  #ifNodes?: ChildNode[];

  #ifPresent = false;

  /**
   * Whether this component's value is one the scope should hydrate from.
   * `DataModel` says yes; a plain binding is a subscriber.
   */
  get isDataSource(): boolean {
    return false;
  }

  /**
   * Whether `toggle()` / `increment()` / `cycle()` make sense here.
   * @protected
   */
  get supportsMutations(): boolean {
    return true;
  }

  get dataRegistry(): DataRegistry {
    this.#registry ??= resolveDataRegistry(this.$el);
    return this.#registry;
  }

  get group(): string {
    return this.$options.group || this.dataRegistry.defaultGroup || '';
  }

  /** The live peer set — `withGroup`'s `$group`, without the decorator. */
  get peers(): Set<DataScopeMember> {
    return this.dataRegistry.members(this.group);
  }

  get dataKey(): string {
    if (!this.dataRegistry.scoped) {
      return '';
    }

    if (this.$options.key) {
      return this.$options.key;
    }

    const { target } = this;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLSelectElement ||
      target instanceof HTMLTextAreaElement
    ) {
      return target.name;
    }

    return '';
  }

  get $data(): Readonly<Record<string, DataValue>> {
    return this.dataRegistry.getData(this.group);
  }

  get multiple(): boolean {
    return this.group.endsWith('[]');
  }

  /** @protected */
  get controlContext(): DataControlContext {
    return {
      dataKey: this.dataKey,
      members: this.peers,
      multiple: this.multiple,
      prop: this.prop,
      target: this.target,
    };
  }

  get target(): HTMLElement {
    return this.$el;
  }

  get prop(): string {
    if (this.$options.prop) {
      return this.$options.prop;
    }

    const { target } = this;
    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      switch (target.type) {
        case 'number':
          return 'valueAsNumber';
        case 'date':
          return 'valueAsDate';
        default:
          return 'value';
      }
    }

    return 'textContent';
  }

  get virtualBindings(): VirtualBinding[] {
    if (!this.#virtualBindings) {
      this.#virtualBindings = [];

      for (const attribute of this.$el.attributes) {
        const simpleMatch = /^data-bind:(text|if)$/.exec(attribute.name);
        if (simpleMatch) {
          this.#virtualBindings.push({
            type: simpleMatch[1] as 'text' | 'if',
            expression: attribute.value,
          });
          continue;
        }

        const match = /^data-bind:(prop|attr|class|style)\.(.+)$/.exec(attribute.name);
        if (match) {
          this.#virtualBindings.push({
            type: match[1] as 'prop' | 'attr' | 'class' | 'style',
            name: match[2],
            expression: attribute.value,
          });
        }
      }
    }

    return this.#virtualBindings;
  }

  get hasVirtualBindings(): boolean {
    return this.virtualBindings.length > 0;
  }

  get value(): DataValue {
    return this.get();
  }

  set value(value: DataValue) {
    this.set(value);
  }

  get(): DataValue {
    if (this.hasVirtualBindings && this.#hasVirtualValue) {
      return this.#virtualValue;
    }

    return this.getTargetValue();
  }

  /** @protected */
  getTargetValue(): DataValue {
    return readControlValue(this.controlContext);
  }

  set(value: DataValue, dispatch = true): void {
    const publication = dispatch ? this.publishValue(value) : undefined;

    if (!publication || this.dataRegistry.isCurrent(publication.group, publication.frame)) {
      this.applyValue(value);
    }
  }

  /**
   * Publish to the resolved group without applying locally.
   * @protected
   */
  publishValue(
    value: DataValue,
    force = false,
    updateData = true,
  ): { group: string; frame: DataUpdate } {
    const registry = this.dataRegistry;
    const { group } = this;

    // The scoped path publishes keyed and always forced, because a scope's
    // value can legitimately be re-set to what it already was — a form
    // resubmitting the same answer is still an event.
    if (registry.scoped && this.dataKey) {
      if (updateData) {
        registry.setValue(group, this.dataKey, value, this);
      }
      return {
        group,
        frame: registry.publish(group, {
          force: true,
          key: this.dataKey,
          source: this,
          value,
        }),
      };
    }

    return { group, frame: registry.publish(group, { force, source: this, value }) };
  }

  /**
   * Publish a keyed value and synchronize matching subscribers.
   */
  dispatchScopedValue(value: DataValue, updateData = true): void {
    const publication = this.publishValue(value, true, updateData);

    if (this.dataRegistry.isCurrent(publication.group, publication.frame)) {
      this.set(value, false);
    }
  }

  /** @private */
  applyValue(value: DataValue): void {
    if (this.hasVirtualBindings) {
      this.#virtualValue = value;
      this.#hasVirtualValue = true;
      this.#applyVirtualBindings(value);
      return;
    }

    writeControlValue(this.controlContext, value);
  }

  /** @private */
  #applyVirtualBindings(value: DataValue): void {
    for (const binding of this.virtualBindings) {
      let result: unknown = value;

      if (binding.expression) {
        try {
          result = getCallback(this.group, `return ${binding.expression};`)(
            value,
            this.target,
            this.$data,
          );
        } catch (error) {
          console.error('[data] Binding expression failed:', error);
          continue;
        }
      }

      switch (binding.type) {
        case 'prop':
          setProperty(this.target, resolvePropertyName(this.target, binding.name), result);
          break;
        case 'attr':
          if (result === false || result === null || result === undefined) {
            this.target.removeAttribute(binding.name);
          } else {
            this.target.setAttribute(binding.name, result === true ? '' : String(result));
          }
          break;
        case 'class':
          this.target.classList.toggle(binding.name, Boolean(result));
          break;
        case 'style':
          this.target.style.setProperty(
            binding.name,
            result === false || result === null || result === undefined ? '' : String(result),
          );
          break;
        case 'text':
          this.target.textContent = (result ?? '') as string;
          break;
        case 'if':
          this.#applyIfBinding(Boolean(result));
          break;
      }
    }
  }

  /**
   * Toggle the presence of a bound `<template>`'s content in the DOM.
   *
   * Ported unchanged from v3 apart from `$warn` and the raw dispatch. The
   * logical state is tracked synchronously by `#ifPresent` while the DOM
   * change may run later through a `dom-update` runner, so each closure
   * guards on `#ifNodes` to stay a no-op when queued runners apply in
   * sequence.
   * @private
   */
  #applyIfBinding(isPresent: boolean): void {
    const { target } = this;

    if (!(target instanceof HTMLTemplateElement)) {
      warn(
        'The data-bind:if binding can only be used on a <template> element. Use data-bind:attr.hidden to show or hide an element in place.',
      );
      return;
    }

    if (isPresent === this.#ifPresent) {
      return;
    }

    this.#ifPresent = isPresent;

    const apply = isPresent
      ? () => {
          if (this.#ifNodes) {
            return;
          }
          const fragment = target.content.cloneNode(true) as DocumentFragment;
          this.#ifNodes = [...fragment.childNodes];
          target.after(fragment);
        }
      : () => {
          if (!this.#ifNodes) {
            return;
          }
          for (const node of this.#ifNodes) {
            node.remove();
          }
          this.#ifNodes = undefined;
        };

    const runner = emitDomUpdate(this.$el, { isPresent });

    if (runner) {
      // Intentionally not awaited: the reactive pipeline stays synchronous
      // while the runner defers the DOM change.
      void runWrapped(runner, apply);
    } else {
      apply();
    }
  }

  /** @private */
  #validateMutation(method: string): boolean {
    if (this.supportsMutations) {
      return true;
    }

    warn(`The ${method}() method can not be used with this component.`);
    return false;
  }

  toggle(onValue: DataValue = true, offValue: DataValue = false): void {
    if (!this.#validateMutation('toggle')) {
      return;
    }

    const isRadio = isInput(this.target) && this.target.type === 'radio';
    const hasCustomCheckboxValues =
      isCheckbox(this.target) && (typeof onValue !== 'boolean' || typeof offValue !== 'boolean');

    if (isRadio || hasCustomCheckboxValues) {
      warn('The toggle() values can not be represented by this input.');
      return;
    }

    this.set(valuesEqual(this.value, onValue) ? offValue : onValue);
  }

  increment(step = 1): void {
    if (!this.#validateMutation('increment')) {
      return;
    }

    if (isInput(this.target) && this.target.type === 'date') {
      warn('The increment() method can not be used with date inputs.');
      return;
    }

    const value = Number(this.value);
    this.set((Number.isNaN(value) ? 0 : value) + step);
  }

  cycle(values: readonly DataValue[]): void {
    if (!this.#validateMutation('cycle') || values.length === 0) {
      return;
    }

    const index = values.findIndex((value) => valuesEqual(value, this.value));
    this.set(values[(index + 1) % values.length]);
  }

  /**
   * Join the resolved group and start listening.
   * @private
   */
  #connect(): void {
    this.#disconnect();
    const registry = this.dataRegistry;
    const { group } = this;
    const leave = registry.join(group, this);
    const stop = registry.subscribe(group, (update) => this.#onUpdate(update));
    this.#leaveGroup = () => {
      stop();
      leave();
    };
  }

  /** @private */
  #disconnect(): void {
    this.#leaveGroup?.();
    this.#leaveGroup = undefined;
  }

  /** @private */
  #onUpdate(update: DataUpdate): void {
    // Disconnection is processed by the registry on a background task, so an
    // element can be out of the document while still subscribed for one turn.
    if (!this.$el.isConnected) {
      this.#disconnect();
      return;
    }

    if (
      update.source !== this &&
      (!update.key || !this.dataKey || update.key === this.dataKey) &&
      (update.force || this.hasVirtualBindings || this.value !== update.value)
    ) {
      this.set(update.value, false);
    }
  }

  /** @private */
  #propagateOnMount(): void {
    if (!this.$options.immediate) {
      return;
    }

    const registry = this.dataRegistry;

    if (registry.scoped && this.dataKey) {
      if (this.isDataSource) {
        registry.hydrate(this.group, this);
        return;
      }

      // A subscriber mounted after hydration — content inserted by
      // `data-bind:if`, a fetched fragment — syncs from the current scoped
      // value. On first load the value is not collected yet and arrives
      // through the post-hydration dispatch instead.
      const data = this.$data;
      if (this.dataKey in data) {
        this.set(data[this.dataKey], false);
      }
      return;
    }

    defaultScheduler.background(() => {
      if (this.$isMounted) {
        this.set(this.get());
      }
    });
  }

  /**
   * Re-resolve the registry because a nearer `DataScope` appeared.
   * See the long comment on `DataScope.mounted()`.
   */
  [RESCOPE](): void {
    if (!this.$isMounted) {
      return;
    }
    this.#registry = undefined;
    this.#connect();
    this.#propagateOnMount();
  }

  mounted(): void | (() => void) {
    this.#connect();
    this.#propagateOnMount();

    return () => {
      this.#disconnect();
      const registry = this.#registry;
      if (registry?.scoped && this.dataKey) {
        registry.deleteValue(this.group, this.dataKey, this);
      }
      this.#registry = undefined;
    };
  }
}
