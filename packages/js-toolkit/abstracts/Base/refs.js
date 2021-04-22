import { getConfig, warn } from './utils.js';

/**
 * @typedef {import('./index.js').default} Base
 */

/**
 * A ponyfill for the CSS `:scope` selector which is not supported in IE11.
 * The following method will return an array of elements similare to the
 * `:scope ${selector}` selector.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/CSS/:scope
 * @see https://github.com/jonathantneal/element-qsa-scope
 *
 * @param  {HTMLElement} element  The element from which the scope is taken.
 * @param  {String}      selector The children selector.
 * @param  {String}      uniqId   A uniq ID to prefix the selector with.
 * @return {Array}                A list of elements.
 */
export function scopeSelectorPonyfill(element, selector, uniqId) {
  let list = [];

  try {
    list = Array.from(element.querySelectorAll(`:scope ${selector}`));
  } catch (err) {
    const attr = `data-uniq-id`;
    const scopedSelector = `[${attr}="${uniqId}"] ${selector}`;
    element.setAttribute(attr, uniqId);
    list = Array.from(element.querySelectorAll(scopedSelector));
    element.removeAttribute(attr);
  }

  return list;
}

/**
 * Get all refs of a component.
 *
 * @param  {Base}        instance The component's instance.
 * @param  {HTMLElement} element  The component's root element.
 * @return {Object}               Return an object containing all the component's refs.
 */
export function getRefs(instance, element) {
  const definedRefs = getConfig(instance).refs || [];
  /** @type {Array<HTMLElement>} */
  const allRefs = Array.from(element.querySelectorAll(`[data-ref]`));
  const childrenRefs = scopeSelectorPonyfill(element, '[data-component] [data-ref]', instance.$id);
  const elements = allRefs.filter((ref) => !childrenRefs.includes(ref));

  const refs = elements.reduce(
    /**
     * @param {Object} $refs
     * @param {HTMLElement & {__base__?: Base}} $ref
     */
    ($refs, $ref) => {
      let refName = $ref.dataset.ref;

      if (!definedRefs.includes(refName)) {
        warn(
          instance,
          `The "${refName}" ref is not defined in the class configuration.`,
          'Did you forgot to define it?'
        );
      }

      const $realRef = $ref.__base__ ? $ref.__base__ : $ref;

      if (refName.endsWith('[]')) {
        refName = refName.replace(/\[\]$/, '');

        if (!$refs[refName]) {
          $refs[refName] = [];
        }
      }

      if ($refs[refName]) {
        if (Array.isArray($refs[refName])) {
          $refs[refName].push($realRef);
        } else {
          $refs[refName] = [$refs[refName], $realRef];
          warn(
            instance,
            `The "${refName}" ref has been found multiple times.`,
            'Did you forgot to add the `[]` suffix to its name?'
          );
        }
      } else {
        $refs[refName] = $realRef;
      }

      return $refs;
    },
    {}
  );

  instance.$emit('get:refs', refs);
  return refs;
}

export default {
  getRefs,
};
