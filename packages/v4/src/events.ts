const component = Object.freeze({
  mounted: 'js-toolkit:component:mounted',
  destroyed: 'js-toolkit:component:destroyed',
} as const);

const dom = Object.freeze({
  update: 'js-toolkit:dom:update',
} as const);

/** Public framework event names. */
export const EVENTS = Object.freeze({
  component,
  dom,
  error: 'js-toolkit:error',
} as const);
