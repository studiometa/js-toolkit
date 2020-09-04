/**
 * Get all refs of a component.
 *
 * @param  {Base}        instance The component's instance.
 * @param  {HTMLElement} element  The component's root element.
 * @return {Object}               Return an object containing all the component's refs.
 */
export function getRefs(instance, element) {
  const allRefs = Array.from(element.querySelectorAll(`[data-ref]`));
  const childrenRefs = Array.from(element.querySelectorAll(`:scope [data-component] [data-ref]`));
  const elements = allRefs.filter(ref => !childrenRefs.includes(ref));

  const refs = elements.reduce(($refs, $ref) => {
    const refName = $ref.dataset.ref;
    const $realRef = $ref.__base__ ? $ref.__base__ : $ref;

    if ($refs[refName]) {
      if (Array.isArray($refs[refName])) {
        $refs[refName].push($realRef);
      } else {
        $refs[refName] = [$refs[refName], $realRef];
      }
    } else {
      $refs[refName] = $realRef;
    }

    return $refs;
  }, {});

  instance.$emit('get:refs', refs);
  return refs;
}

export default {
  getRefs,
};
