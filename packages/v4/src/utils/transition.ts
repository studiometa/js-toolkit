import type { OptionDefinition } from '../Base.js';
import { nextFrame } from '../scheduler.js';

/**
 * CSS transition helpers for class names or inline styles. Apply `from`, then
 * `active` and `to`, and resolve after `transitionend` or on the next frame when no transition runs.
 */

export type ClassesOrStyles = string | string[] | Partial<CSSStyleDeclaration>;

export interface TransitionStyles {
  from?: ClassesOrStyles;
  active?: ClassesOrStyles;
  to?: ClassesOrStyles;
}

/** The run in progress on an element, which a new one interrupts. */
interface TransitionRun {
  aborted: boolean;
  abort: () => void;
}

const runs = new WeakMap<HTMLElement, TransitionRun>();

function toClassList(value: string | string[]): string[] {
  return (Array.isArray(value) ? value : value.split(' ')).filter(Boolean);
}

export function setClassesOrStyles(
  el: HTMLElement,
  value: ClassesOrStyles | undefined,
  method: 'add' | 'remove' = 'add',
): void {
  if (!value) {
    return;
  }
  if (typeof value === 'string' || Array.isArray(value)) {
    el.classList[method](...toClassList(value));
    return;
  }
  for (const [property, propertyValue] of Object.entries(value)) {
    // Removing an inline style means resetting it, not deleting the key.
    el.style[property as never] = (method === 'add' ? propertyValue : '') as never;
  }
}

function hasTransition(el: HTMLElement): boolean {
  const { transitionDuration } = window.getComputedStyle(el);
  return Boolean(transitionDuration) && transitionDuration !== '0s';
}

/**
 * Run a CSS transition on an element.
 *
 * A transition started while another one runs on the same element interrupts
 * it: the interrupted one removes what it applied and resolves, so a caller
 * awaiting it is never left waiting for an end which will not come.
 *
 * @param mode Whether the `to` state is kept or removed at the end.
 */
export async function transition(
  el: HTMLElement,
  nameOrStyles: string | TransitionStyles,
  mode: 'keep' | 'remove' = 'remove',
): Promise<void> {
  const classesOrStyles: TransitionStyles =
    typeof nameOrStyles === 'string'
      ? {
          from: `${nameOrStyles}-from`,
          active: `${nameOrStyles}-active`,
          to: `${nameOrStyles}-to`,
        }
      : { from: '', active: '', to: '', ...nameOrStyles };

  runs.get(el)?.abort();

  let onEnd: (() => void) | null = null;
  let settle: () => void;
  const ended = new Promise<void>((resolve) => {
    settle = resolve;
  });

  /** Drop the listener, the `active` state and, unless kept, the `to` state. */
  function end(endMode: 'keep' | 'remove'): void {
    if (runs.get(el) === run) {
      runs.delete(el);
    }
    if (onEnd) {
      el.removeEventListener('transitionend', onEnd);
      onEnd = null;
    }
    if (endMode === 'remove') {
      setClassesOrStyles(el, classesOrStyles.to, 'remove');
    }
    setClassesOrStyles(el, classesOrStyles.active, 'remove');
  }

  const run: TransitionRun = {
    aborted: false,
    abort() {
      run.aborted = true;
      end('remove');
      settle();
    },
  };
  runs.set(el, run);

  setClassesOrStyles(el, classesOrStyles.from);
  await nextFrame();
  if (run.aborted) return;

  setClassesOrStyles(el, classesOrStyles.active);

  if (hasTransition(el)) {
    onEnd = () => settle();
    el.addEventListener('transitionend', onEnd);
  }
  setClassesOrStyles(el, classesOrStyles.from, 'remove');
  setClassesOrStyles(el, classesOrStyles.to);
  if (!onEnd) {
    nextFrame().then(() => settle());
  }

  await ended;
  if (run.aborted) return;

  end(mode);
}

/** Shared transition option definitions. */
export const TRANSITION_OPTIONS: Record<string, OptionDefinition> = {
  enterFrom: String,
  enterActive: String,
  enterTo: String,
  enterKeep: Boolean,
  leaveFrom: String,
  leaveActive: String,
  leaveTo: String,
  leaveKeep: Boolean,
};

/**
 * The resolved values of {@link TRANSITION_OPTIONS}.
 *
 * This must be a type alias to satisfy the `Record<string, unknown>` constraint.
 */
export type TransitionOptions = {
  enterFrom: string;
  enterActive: string;
  enterTo: string;
  enterKeep: boolean;
  leaveFrom: string;
  leaveActive: string;
  leaveTo: string;
  leaveKeep: boolean;
};

function removeClasses(el: HTMLElement, classes: string): void {
  const list = classes.split(' ').filter(Boolean);
  if (list.length > 0) {
    el.classList.remove(...list);
  }
}

/**
 * Run the enter transition on an element.
 *
 * The opposite direction's `to` classes are cleared first: with `enterKeep` or
 * `leaveKeep` they are still on the element from the last transition, and a
 * `to` state left behind fights the one being applied.
 */
export async function enterTransition(el: HTMLElement, options: TransitionOptions): Promise<void> {
  const { enterFrom, enterActive, enterTo, enterKeep, leaveTo } = options;
  removeClasses(el, leaveTo);
  await nextFrame();
  await transition(
    el,
    { from: enterFrom, active: enterActive, to: enterTo },
    enterKeep ? 'keep' : 'remove',
  );
}

/** Run the leave transition on an element. */
export async function leaveTransition(el: HTMLElement, options: TransitionOptions): Promise<void> {
  const { leaveFrom, leaveActive, leaveTo, leaveKeep, enterTo } = options;
  removeClasses(el, enterTo);
  await nextFrame();
  await transition(
    el,
    { from: leaveFrom, active: leaveActive, to: leaveTo },
    leaveKeep ? 'keep' : 'remove',
  );
}
