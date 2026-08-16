import {
  Base,
  defaultScheduler,
  domUpdate,
  subscribeContext,
  type BaseConfig,
  type BaseProps,
} from '../../src/index.js';
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
  DataRegistryContext,
  resolveDataRegistry,
  type DataRegistry,
  type DataScopeMember,
  type DataUpdate,
  type DataValue,
} from './registry.js';

// An interface lacks the implicit index signature required by `BaseProps`.
export type DataBindOptions = {
  prop: string;
  immediate: boolean;
  key: string;
  group: string;
};

export type DataBindProps = BaseProps & {
  $options: DataBindOptions;
};

function warn(...args: unknown[]): void {
  console.warn('[data]', ...args);
}

type VirtualBinding =
  | { type: 'text' | 'if'; expression: string }
  | { type: 'prop' | 'attr' | 'class' | 'style'; name: string; expression: string };

/** A two-way binding between an element and a named data group. */
/**
 * Stringify whatever the author's expression returned, objects included — the
 * same contract `v-bind` has. The default `[object Object]` form is the
 * intended output here, not an oversight.
 */
// oxlint-disable-next-line typescript/no-base-to-string
const bindingText = (result: unknown): string => String(result);

export class DataBind extends Base<DataBindProps> implements DataScopeMember {
  static config: BaseConfig = {
    name: 'DataBind',
    options: {
      prop: String,
      immediate: Boolean,
      key: String,
      group: String,
    },
  };

  /** Lazily resolved before mount and updated when the nearest scope changes. @private */
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

  /** The live peer set for the resolved group. */
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

    // Equal keyed values remain observable events.
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
            this.target.setAttribute(binding.name, result === true ? '' : bindingText(result));
          }
          break;
        case 'class':
          this.target.classList.toggle(binding.name, Boolean(result));
          break;
        case 'style':
          this.target.style.setProperty(
            binding.name,
            result === false || result === null || result === undefined ? '' : bindingText(result),
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
   * Toggle bound template content. Queued runners guard against stale state.
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

    // Intentionally not awaited: an unclaimed update applies before
    // `domUpdate()` returns its promise, while a runner may defer the change.
    void domUpdate(this.$el, apply, { isPresent });
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

  /** Follow the nearest registry; create the required root registry as fallback. */
  mounted(): () => void {
    const unsubscribe = subscribeContext(this.$el, DataRegistryContext, (registry) => {
      this.#registry = registry;
      this.#connect();
      this.#propagateOnMount();

      return () => {
        this.#disconnect();
        if (registry.scoped && this.dataKey) {
          registry.deleteValue(this.group, this.dataKey, this);
        }
        this.#registry = undefined;
      };
    });

    if (!this.#registry) {
      resolveDataRegistry(this.$el);
    }
    return unsubscribe;
  }
}
