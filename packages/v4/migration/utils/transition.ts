import { nextFrame } from '../../src/index.js';
import type { OptionDefinition } from '../../src/index.js';

/**
 * The `transition` helper, ported from
 * `@studiometa/js-toolkit/utils/css/transition`.
 *
 * It is the Vue `<transition>` recipe: apply the `from` state, wait a frame,
 * swap to `to` with the `active` state applied, resolve on `transitionend`.
 * Both the class form and the inline-style form are kept because
 * `AccordionItem` needs the style one (it animates a measured pixel height)
 * and the `Transition` component needs the class one.
 *
 * The enter/leave pair below is the rest of v3's `withTransition` decorator,
 * as two functions: v4's `Transition` is a component rather than a mixin, and
 * `SliderDots` — v3's only other consumer, which mixed it in to transition its
 * dot refs — cannot mix in a component. Everything the decorator did with
 * `this` is a parameter here, so there is one implementation and no base class
 * between the two.
 */

export type ClassesOrStyles = string | string[] | Partial<CSSStyleDeclaration>;

export interface TransitionStyles {
  from?: ClassesOrStyles;
  active?: ClassesOrStyles;
  to?: ClassesOrStyles;
}

interface TransitionState {
  isTransitioning: boolean;
  onEnd: (() => void) | null;
}

const states = new WeakMap<HTMLElement, TransitionState>();

function stateFor(el: HTMLElement): TransitionState {
  let state = states.get(el);
  if (!state) {
    state = { isTransitioning: false, onEnd: null };
    states.set(el, state);
  }
  return state;
}

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

function end(el: HTMLElement, classesOrStyles: TransitionStyles, mode: 'keep' | 'remove'): void {
  const state = stateFor(el);
  if (state.onEnd) {
    el.removeEventListener('transitionend', state.onEnd);
  }
  if (mode === 'remove') {
    setClassesOrStyles(el, classesOrStyles.to, 'remove');
  }
  setClassesOrStyles(el, classesOrStyles.active, 'remove');
  state.isTransitioning = false;
  state.onEnd = null;
}

/**
 * Run a CSS transition on an element.
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

  const state = stateFor(el);
  if (state.isTransitioning) {
    end(el, classesOrStyles, 'remove');
  }

  state.isTransitioning = true;
  setClassesOrStyles(el, classesOrStyles.from);
  await nextFrame();
  setClassesOrStyles(el, classesOrStyles.active);

  await new Promise<void>((resolve) => {
    if (hasTransition(el)) {
      state.onEnd = () => resolve();
      el.addEventListener('transitionend', state.onEnd);
    }
    setClassesOrStyles(el, classesOrStyles.from, 'remove');
    setClassesOrStyles(el, classesOrStyles.to);
    nextFrame().then(() => {
      if (!state.onEnd) {
        resolve();
      }
    });
  });

  end(el, classesOrStyles, mode);
}

/**
 * The eight class options v3's `withTransition` declared, and the two
 * components that use them declare in turn. Spread into a `config`, so each
 * class owns its own object.
 */
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
 * A type alias rather than an interface, because `BaseProps.$options` is a
 * `Record<string, unknown>`: an object type alias gets an implicit index
 * signature and satisfies it, an interface never does.
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
