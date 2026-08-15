const component = Object.freeze({
  mounted: 'js-toolkit:component:mounted',
  destroyed: 'js-toolkit:component:destroyed',
} as const);

/** Public framework event names. */
export const EVENTS = Object.freeze({
  component,
  error: 'js-toolkit:error',
} as const);
