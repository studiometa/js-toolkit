/**
 * The modifier vocabulary of a `<namespace>:<event>[.<modifier>…]` declaration,
 * and the one parser that reads it.
 *
 * This is ui's half of the attribute grammar, and it stays in ui deliberately:
 * core owns when a declaration is re-parsed and how the attribute is observed,
 * while what the parts of a qualifier mean belongs to whoever declared the
 * namespace. `prevent` and `throttle200` are product vocabulary, not framework
 * concepts — see DESIGN.md §3.
 *
 * `Action` and `Track` had one of these each, written independently, and the
 * second was the first plus `throttle` — a superset, not a variant. The
 * **defaults** are what differed for real (`Action` debounces at 100 ms,
 * `Track` at 300), so this parser reports only the delay an author actually
 * wrote and leaves the fallback to the caller.
 */

/** Every modifier a declaration may carry. */
export const MODIFIERS = Object.freeze({
  /** `event.preventDefault()` before the effect runs. */
  PREVENT: 'prevent',
  /** `event.stopPropagation()` before the effect runs. */
  STOP: 'stop',
  /** Listen once, then release. */
  ONCE: 'once',
  /** Register the listener as passive. */
  PASSIVE: 'passive',
  /** Register the listener on the capture phase. */
  CAPTURE: 'capture',
  /** Delay until the declaration stops firing. Takes a delay in milliseconds. */
  DEBOUNCE: 'debounce',
  /** Fire at most once per interval. Takes an interval in milliseconds. */
  THROTTLE: 'throttle',
  /** Merge a `CustomEvent` detail into the payload instead of resolving placeholders. */
  DETAIL: 'detail',
} as const);

export type Modifier = (typeof MODIFIERS)[keyof typeof MODIFIERS];

/** The modifiers which carry a number: `debounce500`, `throttle200`. */
const TIMED_MODIFIERS = [MODIFIERS.DEBOUNCE, MODIFIERS.THROTTLE] as const;

const MODIFIER_NAMES: readonly string[] = Object.values(MODIFIERS);

export interface ParsedEventDefinition {
  /** The event name, which is everything before the first dot. */
  event: string;
  /** The modifiers written, in declaration order and without duplicates. */
  modifiers: ReadonlySet<Modifier>;
  /**
   * The delay an author wrote on a timed modifier, in milliseconds, or
   * `undefined` when the modifier was bare or absent. Each family keeps its own
   * fallback, which is why this is not defaulted here. A property rather than a
   * method, so a caller can destructure it.
   */
  delay: (modifier: Modifier) => number | undefined;
}

function warn(...args: unknown[]): void {
  console.warn('[event]', ...args);
}

/**
 * Split an event definition into its event and its modifiers.
 *
 * @param definition The qualifier of one declaration: `click.prevent.stop`,
 *                   `input.debounce500`, `view.once`.
 * @example
 * ```js
 * const { event, modifiers, delay } = parseEventDefinition('input.debounce500');
 * // event: 'input', modifiers: Set { 'debounce' }, delay('debounce'): 500
 * ```
 */
export function parseEventDefinition(definition: string): ParsedEventDefinition {
  const [event, ...parts] = definition.split('.');
  const modifiers = new Set<Modifier>();
  const delays = new Map<Modifier, number>();

  for (const part of parts) {
    const timed = TIMED_MODIFIERS.find((modifier) => part.startsWith(modifier));

    if (timed) {
      modifiers.add(timed);
      const written = part.slice(timed.length);
      if (written) {
        delays.set(timed, Number.parseInt(written, 10));
      }
      continue;
    }

    if (!MODIFIER_NAMES.includes(part)) {
      // Unknown modifiers used to be pushed through as if they were real, so a
      // typo silently did nothing on a listener that still bound.
      warn(
        `\`${part}\` in \`${definition}\` names no modifier — known names: ${MODIFIER_NAMES.join(', ')}.`,
      );
      continue;
    }

    modifiers.add(part as Modifier);
  }

  return { event, modifiers, delay: (modifier) => delays.get(modifier) };
}
