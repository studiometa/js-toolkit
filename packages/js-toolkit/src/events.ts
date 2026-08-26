const component = Object.freeze({
  mounted: 'js-toolkit:component:mounted',
  unmounted: 'js-toolkit:component:unmounted',
} as const);

const dom = Object.freeze({
  update: 'js-toolkit:dom:update',
} as const);

/**
 * Public framework event names.
 * @link https://js-toolkit-v4.studiometa.dev/api/diagnostics/EVENTS.html
 */
export const EVENTS = Object.freeze({
  component,
  dom,
  diagnostic: 'js-toolkit:diagnostic',
} as const);
