import { Base, type BaseConfig, type BaseProps } from '../../src/index.js';
import { withTransition } from './withTransition.js';

export type { Transitionable, TransitionInterface, TransitionProps } from './withTransition.js';

/**
 * Runs configured enter and leave CSS transitions on its element.
 *
 * Generic and mixin-built, as in v3: the behaviour lives in
 * `withTransition()` so a component with its own props can mix it in, and
 * this class is the declarative form of the same thing — `withTransition(Base)`
 * and nothing else.
 */
export class Transition<T extends BaseProps = BaseProps> extends withTransition(Base)<T> {
  static config: BaseConfig = {
    name: 'Transition',
  };
}
