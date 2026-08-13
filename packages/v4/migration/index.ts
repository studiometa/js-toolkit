/**
 * @studiometa/ui components ported onto the v4 prototype.
 *
 * This is a migration feasibility test, not a component library: four
 * families were chosen because they hit the parts of v3 that v4 changed most.
 * Each file documents what its port cost against the v3 original.
 *
 * Registering is left to the consumer — `registerComponent(Accordion)` and so
 * on — so importing the barrel mounts nothing on its own.
 */

export * from './Accordion/index.js';
export * from './Data/index.js';
export * from './Dialog/index.js';
export * from './ScrollAnimation/index.js';
export * from './Slider/index.js';
export * from './Transition/index.js';
export * from './utils/easings.js';
export * from './utils/focus.js';
export * from './utils/keyframes.js';
export * from '../src/utils/maths.js';
export * from './utils/transition.js';
export * from './utils/uid.js';
