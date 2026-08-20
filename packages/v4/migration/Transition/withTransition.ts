import type { BaseConfig, BaseConstructor, MixedClass } from '../../src/index.js';
import {
  enterTransition,
  leaveTransition,
  TRANSITION_OPTIONS,
  type TransitionOptions,
} from '../../src/utils/transition.js';

/** The option and event surface `withTransition` adds to its host. */
export interface TransitionProps {
  $options: TransitionOptions;
  $emits: {
    'transition-enter': void;
    'transition-enter-start': void;
    'transition-enter-end': void;
    'transition-leave': void;
    'transition-leave-start': void;
    'transition-leave-end': void;
  };
}

/**
 * What a transition runs on: one element, or several transitioning together.
 *
 * The list form is v3's and it is load-bearing — a component whose visible
 * part is a set of refs rather than its own root transitions all of them as
 * one gesture.
 */
export type TransitionTarget = HTMLElement | HTMLElement[];

/**
 * A component that can be entered and left — what `Dialog` fans its
 * open/close out to.
 *
 * The interface is deliberately narrower than what `withTransition` provides:
 * it is the contract a caller needs, and a caller does not choose the target.
 * `ViewTransition` implements these three methods over the native View
 * Transitions API, sharing the contract and none of the CSS-class
 * implementation.
 */
export interface Transitionable {
  enter(): Promise<void>;
  leave(): Promise<void>;
  toggle(): Promise<void>;
}

/** What the mixin adds, beyond {@link Transitionable}. */
export interface TransitionInterface extends Transitionable {
  state: 'entering' | 'leaving' | null;
  readonly target: TransitionTarget;
  readonly transitionOptions: TransitionOptions;
  enter(target?: TransitionTarget): Promise<void>;
  leave(target?: TransitionTarget): Promise<void>;
  toggle(target?: TransitionTarget): Promise<void>;
}

/**
 * Add enter/leave CSS transitions to a component.
 *
 * **v4's first mixin that is not a service mixin**, and the reason it is a
 * mixin at all is consumer count rather than shape. The earlier port
 * collapsed v3's `withTransition` decorator and its `Transition` component
 * into the component alone, on the finding that the decorator's body used
 * `this` for nothing but reading two options — so the shared half became
 * `enterTransition()`/`leaveTransition()` in core, and the one consumer that
 * needed it elsewhere (`SliderDots`) called those directly. Five consumers
 * later that no longer holds: `MenuList`, `AbstractFigure`, `FigureVideo` and
 * `AnchorNavLink` each reimplemented the same `state`/`target`/`enter`/
 * `leave`/`toggle` block around those two calls, which is the duplication
 * this restores v3's structure to remove.
 *
 * It is not built on `createServiceMixin()` because there is no service and
 * no subscription: nothing to start on mount, nothing to release on destroy.
 * What it shares with those mixins is the type shape — `MixedClass` — so a
 * consumer threads its own props through exactly as it does for `withResize`:
 * `class Figure<T> extends withTransition(Base)<FigureProps & T>`.
 *
 * **It declares no config**, so a consumer spreads `TRANSITION_OPTIONS` into
 * its own — one line, which every consumer already had. Declaring them here
 * would need a `name` too, because `BaseConfig` requires one and the static
 * side has to stay assignable to `Base`'s; that name would then be inherited
 * by any consumer which forgot to declare its own, registering a second
 * component under a name it never chose. Core's service mixins declare no
 * config for the same reason.
 */
export interface TransitionMixin {
  <T extends BaseConstructor>(BaseClass: T): MixedClass<T, TransitionInterface>;
}

/**
 * Typed against concrete `BaseConstructor` rather than the public signature's
 * type parameter, and cast on the way out — the same split `createServiceMixin()`
 * uses, and for the same reason: TypeScript requires a class extending a *type
 * parameter* to declare `constructor(...args: any[])`, which would add a
 * constructor this mixin does not need and would let a caller construct it with
 * anything at all.
 */
const applyTransition = (BaseClass: BaseConstructor) => {
  class WithTransition extends BaseClass implements Transitionable {
    /**
     * The options the mixin reads, declared once here instead of by every
     * consumer: `resolveConfig()` walks the prototype chain and merges each
     * own `config`, and a mixin class is a link in that chain like any other.
     *
     * Typed rather than spelled with a `name`, which `BaseConfig` requires and
     * this has no business setting — a name here would be inherited by any
     * consumer which declared none, registering it under a name it never
     * chose. The merge treats a config without a name as a contributor to the
     * one below it, which is exactly what a mixin is.
     */
    static config = { options: { ...TRANSITION_OPTIONS } } as BaseConfig;

    state: 'entering' | 'leaving' | null = null;

    /**
     * What the transition runs on. Defaults to the root element, and can be
     * overridden to return one ref (`AbstractFigure` returns its `img`) or
     * several, which then transition together.
     */
    get target(): TransitionTarget {
      // Through `unknown` for the same reason as `transitionOptions` below:
      // the host is a loose `BaseConstructor`, so `$el` is `any` here.
      const el: unknown = this.$el;
      return el as HTMLElement;
    }

    /**
     * The transition declaration.
     *
     * Its own hook, rather than a direct `$options` read, because a component
     * can need a value the markup is not allowed to choose: `MenuList` forces
     * `enterKeep`/`leaveKeep` to `true`, since a menu left open must stay
     * visible. v3 did that by overriding the `$options` getter, which v4
     * refuses — `$options` is a read-only view over attributes with no
     * override point — so the override moves one level down, onto the
     * declaration this mixin reads instead of onto the options themselves.
     */
    get transitionOptions(): TransitionOptions {
      // Through `unknown`, not a direct assertion: the host is a loose
      // `BaseConstructor`, so `$options` is `any` here and returning it
      // straight would hand back an unchecked value under type-aware linting.
      const options: unknown = this.$options;
      return options as TransitionOptions;
    }

    /**
     * The elements one call acts on: what it was handed, else the getter.
     *
     * An explicit argument **replaces** `target` rather than adding to it,
     * which is v3's rule — the caller who names an element is the one who
     * knows, so a component that transitions its own root by default can
     * still be told to transition something else for one call.
     */
    #elements(target?: TransitionTarget): HTMLElement[] {
      return [target ?? this.target].flat();
    }

    async enter(target?: TransitionTarget): Promise<void> {
      this.state = 'entering';
      this.$emit('transition-enter');
      this.$emit('transition-enter-start');
      await this.#run(enterTransition, target);
      this.$emit('transition-enter-end');
    }

    async leave(target?: TransitionTarget): Promise<void> {
      this.state = 'leaving';
      this.$emit('transition-leave');
      this.$emit('transition-leave-start');
      await this.#run(leaveTransition, target);
      this.$emit('transition-leave-end');
    }

    toggle(target?: TransitionTarget): Promise<void> {
      return this.state === 'entering' ? this.leave(target) : this.enter(target);
    }

    /**
     * Run one direction across every element, together rather than in turn.
     *
     * `Promise.all` over a synchronous `map` is what makes them one gesture:
     * each `enterTransition()` applies its `from` state and clears the other
     * direction's `to` before it first awaits, so every element is staged
     * before any of them reaches the next frame — which is the ordering v3
     * got by passing the whole list to a single `transition()` call.
     */
    #run(
      run: (el: HTMLElement, options: TransitionOptions) => Promise<void>,
      target?: TransitionTarget,
    ): Promise<void[]> {
      const { transitionOptions } = this;
      return Promise.all(this.#elements(target).map((el) => run(el, transitionOptions)));
    }
  }

  return WithTransition;
};

export const withTransition = applyTransition as unknown as TransitionMixin;
