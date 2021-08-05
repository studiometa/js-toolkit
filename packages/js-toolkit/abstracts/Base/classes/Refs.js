export default class Refs {
  #element;
  #refs;

  constructor(element, refs) {
    this.#element = element;
    this.#refs = refs;

    const allRefs = Array.from(element.querySelectorAll(`[data-ref]`));
    const childrenRefs = scopeSelectorPonyfill(element, '[data-component] [data-ref]', instance.$id);
    const elements = allRefs.filter((ref) => !childrenRefs.includes(ref));


    elements.forEach(ref => {
      let refName = ref.getAttribute('data-ref');

      const $realRef = $ref.__base__ ? $ref.__base__ : $ref;
    })
  }

  #addRef(name, element) {
    if (name.endsWith('[]')) {
      name = name.replace(/\[\]$/, '');

      if (!this[name]) {
        Object.defineProperty(this, name, {
          value: [],
        });
      }
    }
  }
}
