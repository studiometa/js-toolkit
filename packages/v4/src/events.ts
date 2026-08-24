const component = Object.freeze({
  mounted: 'js-toolkit:component:mounted',
  unmounted: 'js-toolkit:component:unmounted',
} as const);

const dom = Object.freeze({
  update: 'js-toolkit:dom:update',
} as const);

/** Public framework event names. */
export const EVENTS = Object.freeze({
  component,
  dom,
  diagnostic: 'js-toolkit:diagnostic',
} as const);
