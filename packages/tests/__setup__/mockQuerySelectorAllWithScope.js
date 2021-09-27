import { jest } from '@jest/globals';
import nanoid from 'nanoid/non-secure';

export default function mockSelectorWithScope(prototype, methodName) {
  const originalMethod = prototype[methodName];
  const spy = jest.spyOn(prototype, methodName);

  spy.mockImplementation(function mockQuerySelectorAllWithScope(selectors) {
    if (/:scope/i.test(selectors) && this !== document) {
      // Mock IE11 which does not support the `:scope` selector and throws a syntax error.
      // eslint-disable-next-line no-underscore-dangle
      if (globalThis.__SCOPE_PSEUDO_CLASS_SHOULD_FAIL__) {
        throw new Error('Syntax error');
      }

      const attr = `data-uniq-id`;
      const uniqId = nanoid();
      const scopedSelector = selectors.replace(':scope', `[${attr}="${uniqId}"]`);
      this.setAttribute(attr, uniqId);
      const list = originalMethod.call(this, scopedSelector);
      this.removeAttribute(attr);
      return list;
    }

    return originalMethod.call(this, selectors);
  });

  return spy;
}

export const spies = [
  typeof window !== 'undefined' && mockSelectorWithScope(Element.prototype, 'querySelectorAll'),
  typeof window !== 'undefined' && mockSelectorWithScope(Document.prototype, 'querySelectorAll'),
];
