/**
 * Register with `registerComponents(Action, Target)`. Targets resolve from the
 * current DOM at event time.
 */

export { Action, type ActionProps } from './Action.js';
export { ActionEvent, type ActionTarget, type Modifier } from './ActionEvent.js';
export { EFFECT_ARGUMENTS, getEffect, type EffectFunction } from './expression.js';
export { getInstancesOn } from './instances.js';
export { Target } from './Target.js';
