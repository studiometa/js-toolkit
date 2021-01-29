import { getConfig, warn } from './utils';
export function scopeSelectorPonyfill(element, selector, uniqId) {
  var list = [];

  try {
    list = Array.from(element.querySelectorAll(":scope ".concat(selector)));
  } catch (err) {
    var attr = "data-uniq-id";
    var scopedSelector = "[".concat(attr, "=\"").concat(uniqId, "\"] ").concat(selector);
    element.setAttribute(attr, uniqId);
    list = Array.from(element.querySelectorAll(scopedSelector));
    element.removeAttribute(attr);
  }

  return list;
}
export function getRefs(instance, element) {
  var definedRefs = getConfig(instance).refs || [];
  var allRefs = Array.from(element.querySelectorAll("[data-ref]"));
  var childrenRefs = scopeSelectorPonyfill(element, '[data-component] [data-ref]', instance.$id);
  var elements = allRefs.filter(function (ref) {
    return !childrenRefs.includes(ref);
  });
  var refs = elements.reduce(function ($refs, $ref) {
    var refName = $ref.dataset.ref;

    if (!definedRefs.includes(refName)) {
      warn(instance, "The \"".concat(refName, "\" ref is not defined in the class configuration."), 'Did you forgot to define it?');
    }

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
        warn(instance, "The \"".concat(refName, "\" ref has been found multiple times."), 'Did you forgot to add the `[]` suffix to its name?');
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