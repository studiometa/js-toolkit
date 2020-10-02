/**
 * Get all refs of a component.
 *
 * @param  {Base}        instance The component's instance.
 * @param  {HTMLElement} element  The component's root element.
 * @return {Object}               Return an object containing all the component's refs.
 */
export function getRefs(instance, element) {
  var allRefs = Array.from(element.querySelectorAll("[data-ref]"));
  var childrenRefs = Array.from(element.querySelectorAll(":scope [data-component] [data-ref]"));
  var elements = allRefs.filter(function (ref) {
    return !childrenRefs.includes(ref);
  });
  var refs = elements.reduce(function ($refs, $ref) {
    var refName = $ref.dataset.ref;
    var $realRef = $ref.__base__ ? $ref.__base__ : $ref;

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
  getRefs: getRefs
};
//# sourceMappingURL=refs.js.map