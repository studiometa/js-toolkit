import { nextFrame } from '../../src/index.js';

/**
 * The `transition` helper, ported from
 * `@studiometa/js-toolkit/utils/css/transition`.
 *
 * It is the Vue `<transition>` recipe: apply the `from` state, wait a frame,
 * swap to `to` with the `active` state applied, resolve on `transitionend`.
 * Both the class form and the inline-style form are kept because
 * `AccordionItem` needs the style one (it animates a measured pixel height)
 * and the `Transition` component needs the class one.
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
