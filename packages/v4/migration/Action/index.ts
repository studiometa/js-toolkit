/**
 * The `Action` family of @studiometa/ui, ported onto the v4 prototype.
 *
 * Registering is the consumer's call:
 *
 *     registerComponents(Action, Target);
 *
 * Order does not matter for the `Action` itself, but it does for what it can
 * reach: targets are resolved **at event time**, from the DOM, so a component
 * registered after an `Action` is targetable as soon as it mounts. That is
 * strictly better than v3, where the same lookup ran against a registry
 * populated at construction.
 */

export { Action, type ActionProps } from './Action.js';
export { ActionEvent, type ActionTarget, type Modifier } from './ActionEvent.js';
export { EFFECT_ARGUMENTS, getEffect, type EffectFunction } from './expression.js';
export { getInstances, getInstancesOn } from './instances.js';
export { Target } from './Target.js';
