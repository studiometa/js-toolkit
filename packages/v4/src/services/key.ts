import { getSharedRuntimeSlot } from '../shared-runtime.js';
import { createServiceMixin, type ServiceHandles, type ServiceMixinOptions } from './mixin.js';
import { createService, perTarget, type MutableProps, type Service } from './service.js';

/** Anything a key event reaches: the document, an element, or the window. */
export type KeyTarget = Document | Element | Window;

/**
 * The named keys, mapped to their `KeyboardEvent.key` value.
 *
 * The `key` value and not the `keyCode` of v3: that property is deprecated, and
 * its numbers were never specified, so they differ between engines and between
 * layouts. `event.key` is the character or the named key that the platform
 * reports.
 */
export const KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  TAB: 'Tab',
  ESC: 'Escape',
  LEFT: 'ArrowLeft',
  UP: 'ArrowUp',
  RIGHT: 'ArrowRight',
  DOWN: 'ArrowDown',
} as const;

/** One of {@link KEYS}. */
export type Key = (typeof KEYS)[keyof typeof KEYS];

/** A name of {@link KEYS}. */
export type KeyName = keyof typeof KEYS;

/**
 * One boolean per named key, `true` for the key the event carries.
 *
 * Mapped over {@link KEYS} rather than written out, so the props cannot drift
 * from the constant they describe.
 */
export type KeyFlags = { readonly [Name in KeyName]: boolean };

/**
 * Keyboard state for the last observed event.
 *
 * The eight named booleans of {@link KeyFlags} are a deliberate exception to
 * the rule that nothing derivable is a field: each one is `KEYS[name] ===
 * event.key`, and they are kept for call-site parity with v3, where
 * `keyed({ ESC })` is how the ported components read the keyboard.
 */
export interface KeyProps extends KeyFlags {
  /** The source event, or `null` before observation and after release. */
  readonly event: KeyboardEvent | null;
  /** How many times the same key has been pressed in a row. */
  readonly triggered: number;
  readonly isDown: boolean;
  readonly isUp: boolean;
}

/**
 * The resting state: nothing observed, no key held.
 *
 * One helper for both ends of a run — it builds the props at creation, and
 * `Object.assign()` writes it back over the live object at teardown, so a
 * stopped service retains no event target.
 */
function restingProps(names: readonly KeyName[]): MutableProps<KeyProps> {
  return {
    event: null,
    triggered: 0,
    isDown: false,
    isUp: false,
    ...(Object.fromEntries(names.map((name) => [name, false])) as KeyFlags),
  };
}

function createKeyService(target: KeyTarget): Service<KeyProps> {
  // The name list is derived here and closed over, not at module scope: a
  // computed top-level expression would tie the whole service to `KEYS` for a
  // consumer importing only the constant.
  const names = Object.keys(KEYS) as KeyName[];
  const props = restingProps(names);

  function update(event: KeyboardEvent): KeyProps {
    const isDown = event.type === 'keydown';
    // A repeat is one key going down while it is already down, read from the
    // state the new event is about to overwrite. This fixes a v3 bug: v3
    // incremented on any two consecutive keydowns, so holding `A` and then
    // pressing `B` reported `2`. A different key, or any keyup, restarts it.
    const isRepeat = isDown && props.isDown && props.event?.key === event.key;

    props.triggered = isRepeat ? props.triggered + 1 : 1;
    props.event = event;
    props.isDown = isDown;
    props.isUp = !isDown;
    for (const name of names) {
      props[name] = KEYS[name] === event.key;
    }

    return props;
  }

  return createService<KeyProps>({
    props: () => props,
    // The resting state is not an observed value.
    hasProps: () => props.event !== null,
    start(emit) {
      const onKey = (event: Event) => {
        emit(update(event as KeyboardEvent));
      };

      // Not passive: `trapFocus()` and every keyboard shortcut a subscriber
      // writes call `preventDefault()` on the event they are handed.
      // No capture: a descendant that handles its own keys and stops the
      // propagation is respected.
      target.addEventListener('keydown', onKey);
      target.addEventListener('keyup', onKey);

      return () => {
        target.removeEventListener('keydown', onKey);
        target.removeEventListener('keyup', onKey);
        // Release the event so its target subtree can be collected, and leave
        // no key reported as held for the next run.
        Object.assign(props, restingProps(names));
      };
    },
  });
}

const keyServices = /* @__PURE__ */ getSharedRuntimeSlot('service:key', 1, () =>
  perTarget(createKeyService),
);

/** Use one key service per target. Defaults to the document. */
export function useKey(target: KeyTarget = document): Service<KeyProps> {
  return keyServices(target);
}

/** The method `withKey()` subscribes for the component. */
export interface KeyHook {
  keyed?(props: KeyProps): void;
}

export type KeyMixinOptions = ServiceMixinOptions<KeyTarget>;

/**
 * Subscribe `keyed()` for each mount cycle. The document is the default target,
 * as in v3 and as `withScroll` and `withResize` do for their own page-wide
 * source. Scope it to a region with a target:
 * `withKey(Base, { target: (instance) => instance.$refs.wrapper })`.
 */
export const withKey = /* @__PURE__ */ createServiceMixin<
  KeyHook & ServiceHandles<'keyed'>,
  KeyTarget
>({
  hook: 'keyed',
  target: () => document,
  use: (target) => useKey(target),
});
