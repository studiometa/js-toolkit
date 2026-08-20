import type { BaseConstructor, MixedClass } from '../../src/index.js';
import {
  enterTransition,
  leaveTransition,
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
 * A component that can be entered and left — what `Dialog` fans its
 * open/close out to.
 *
 * The interface is deliberately wider than what `withTransition` provides:
 * `ViewTransition` implements the same three methods over the native View
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
  readonly target: HTMLElement;
  readonly transitionOptions: TransitionOptions;
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
    state: 'entering' | 'leaving' | null = null;

    /** What the transition runs on. Defaults to the root element. */
    get target(): HTMLElement {
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

    async enter(): Promise<void> {
      this.state = 'entering';
      this.$emit('transition-enter');
      this.$emit('transition-enter-start');
      await enterTransition(this.target, this.transitionOptions);
      this.$emit('transition-enter-end');
    }

    async leave(): Promise<void> {
      this.state = 'leaving';
      this.$emit('transition-leave');
      this.$emit('transition-leave-start');
      await leaveTransition(this.target, this.transitionOptions);
      this.$emit('transition-leave-end');
    }

    toggle(): Promise<void> {
      return this.state === 'entering' ? this.leave() : this.enter();
    }
  }

  return WithTransition;
};

export const withTransition = applyTransition as unknown as TransitionMixin;
