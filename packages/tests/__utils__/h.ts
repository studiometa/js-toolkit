import { createElement } from '@studiometa/js-toolkit/utils';

/**
 * Create an HTMLElement and connect it to a document.
 */
export const hConnected: typeof createElement = (...args) => {
  const element = createElement(...args);
  const doc = new Document();
  doc.append(element);
  return element;
};

export { createElement as h };
