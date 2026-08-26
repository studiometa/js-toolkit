# Configuration

`static config` declares everything the framework needs to know about a component before an instance exists.

```ts
interface BaseConfig {
  name: string;
  components?: Record<string, BaseConstructor | ComponentImporter>;
  refs?: string[];
  options?: Record<string, OptionDefinition>;
  mountStrategy?: MountStrategy;
}
```

[[toc]]

## `config.name`

**Required.** The name the registry registers under, the token `data-component` writes, and the prefix of every instance's [`$id`](/api/instance-properties.html#id).

The name comes from the **merged** config, so a subclass that extends a component and forgets to rename registers under the name it inherited — and collides — rather than under `undefined`.

## `config.refs`

The refs the component declares. A list ref keeps its `[]`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"f9f2b84f87e4c484a476ef8c1fee6955124e6cdb91c6a0229ae8555121484242","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8aTMABGCDmewYiAArAB2VbrTbbXYLA7QzxgiFZM5fABM11upHujyQADY3h8cHgfmQ/vQmGxODxfEDjjI5PQ4soDJptLw9MdDNozBZwnYHCdnK53J5vKz/HIgiF+GEbJFopyFAkkql0plsnkqAUinBShVqrV6o1mm0Ot1ev1BsNRuNJjNIQtoXCrlkkVtEDtqGjDh5jk5svjCXcHnTEABGV7vaifGnEOm7f4eRhYPlkTB8EHg+KqsAAM3YKUQvGA5l49d4YGYlhg1c6pDOKQA3HWG6QYGWzbx253kFMe2AXk55otEAAOMmIsAbAOL4P7UMgUsVlIR3FIADM0eJsaeSapXwI6fImYZ2dzWnzGD4TZbbbQHeX06hSHjF3jS4rii67ongr5SpGwE3DGpKBpSKbUt8170hiOZ5nYz68P2g7vp+KRjt+Xq/omgHIoGqIbhi2HYpBsLHiScatC8sxbtAl5WDYErAJKvAvLwZaaJYvAAOQAAKdD0fQtskFo1HUDRNC0rTCRO5iAoqRYBFyig8qoNa9vMaDsPwoTlpWAr6WADaNs2rYiZpwkUL29bUdWyDCRwnSOSJyTgmO3nCVgzCRKwcD+bMvYvBOU5UNJzBIKAsRgHAfRgHglQgC8LxAA=="}
import { Base } from '@studiometa/js-toolkit-v4';

class Tabs extends Base {
  static config = {
    name: 'Tabs',
    refs: ['list', 'tabs[]', 'panels[]'],
  };
}
```

See [Refs](/guide/introduction/managing-refs.html) and [`data-ref`](/api/html/data-ref.html).

## `config.options`

Each entry is a type, a tuple of types, or an object with `type` and `default`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c0fe69516b685802e37b645c90f8d24aa77a4686e363bd0a8d66510328794f14","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

class Slider extends Base {
  static config = {
    name: 'Slider',
    options: {
      label: String, // short form
      speed: { type: Number, default: 1 }, // primitive default
      loop: { type: Boolean, default: true },
      tween: { type: Object, default: () => ({}) }, // factory required
      offset: [Number, Array], // a union, in order
    },
  };
}
```

The five option types are `String`, `Number`, `Boolean`, `Array` and `Object`. `Function` is not one, which is what makes a function `default` unambiguously a factory.

See [Options](/guide/introduction/managing-options.html) and [`data-option-<name>`](/api/html/data-option.html).

## `config.components`

The declared **family**. It does two jobs, and neither is ownership:

1. it registers those names when this component registers, so one `registerComponent()` call covers a whole tree;
2. it gives the name set that `on<Child><Event>` resolution needs.

```js
static config = {
  name: 'Accordion',
  components: {
    AccordionItem, // a class
    Icon: () => import('./Icon.js'), // a thunk — its own chunk
  },
};
```

- **The key supplies the name**, so a lazy child is a name the registry knows with nothing downloaded.
- A thunk is deferred rather than resolved, and becomes a lazy entry of the same registry.
- **First wins, quietly.** Several parents declaring the same lazy child is the normal case.
- A value written with `class` that does not extend `Base` is reported as `component.invalid-family-declaration`, where it is declared.

See [Autoloading](/guide/going-further/autoloading.html).

## `config.mountStrategy`

The component's default answer to _when_. Any element overrides it with `data-mount`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c43cf6369c04b4267f9048b177e1e2a893703a1798c2e9ee68cb22e24f907263","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8ACyYyc80WiAArAB2VbrTZIADMuwWBwYHlBWCc2S+ACZrrdSPdHkgAGxvD44PA/Mh/ehMNicHi+IHHGRyehxZQGTTaXh6Y6GbRmCzhOwOE7OVzuTzeVn+ORBEL8MI2SLRTkKBJJVLpTLZPJUApFOClCrVWr1RrNNodbq9fqDYajcaTGZzPYYskrLIIraIHbUNGHDzHHFnfGEu4POmIACMAA5KdRPjTiHTdv8PIwsHyyJg+Fj4qqwAAzdgpRC8YDmXj13hgZiWGDVzqkM4pADcdYblggXWiAGU0MSaCkMG3R52e2AXuCvUhE1D4WANgGyaj9qGQKWKykI+dECjd0SSXHXu9U9TvhnyFmGTm81oCxg+E2W1OO2uFwsMfGLiuP010RQMt3RPAPylXFtmjYlYyeVoU0wG8CDvekMRAXN8zsN9eH7Qc0BHMcYAnL9O1/SF43jOFgPXJB4xPPYII8Ajh1HZhxwwQ8vhXU8Y1JQMXlmXdoC+EArBsCVgElXgXl4MtNEsXgAHIAAFOh6PoW2SC0ajqBomhaVoVNncxAUVLEtW5WTazAet5jQdh+FCctKwFGte3rKDqxUrEVIoLz8IHdiSLI1SiHYOB2AAIzWALexeWd5yoHTmCQUBYjAaKIjwSoQBeF4gA==="}
import { Base } from '@studiometa/js-toolkit-v4';

class Map extends Base {
  static config = {
    name: 'Map',
    mountStrategy: 'visible',
  };
}
```

See [Mount strategies](/guide/going-further/mount-strategies.html) and [`data-mount`](/api/html/data-mount.html).

## Merging along the prototype chain

`$config` walks the prototype chain and merges every config it finds:

| Key             | Merge rule                  |
| --------------- | --------------------------- |
| `refs`          | union                       |
| `options`       | entry by entry              |
| `components`    | entry by entry              |
| `name`          | the most derived class wins |
| `mountStrategy` | the most derived class wins |

A subclass that states a `components` key again wins for **that key only**.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"a46d9d32239f674899a5ba06de3ddb3b1cca96176e4af335dd676de119683d5c","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

class AbstractControl extends Base {
  static config = {
    name: 'AbstractControl',
    refs: ['button'],
    options: { label: String },
  };
}

class NavigationControl extends AbstractControl {
  static config = {
    name: 'NavigationControl',
    refs: ['compass'], // merged: ['button', 'compass']
    options: { showCompass: Boolean }, // merged with `label`
  };
}
```

An intermediate class should declare `static config: BaseConfig`, or let TypeScript infer a literal type every subclass matches.

**The registry reads the merged config too**, before any instance exists, through `resolveConfig()`. That is how it knows the mount strategy of a pair, the family to register, and the name a class registers under.

## There is no `withExtraConfig()`

To extend a component with a different config, declare a class. To extend one you cannot edit, do it in expression position:

```js
registerComponent(
  class extends Vendor {
    static config = { name: 'CompactVendor', options: { compact: Boolean } };
  },
);
```

## `@component()`

The decorator writes `static config` and calls `registerComponent()` in one step, and the two forms merge:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"1f66761ff5247a2369bbd71728cd58e12f5f436e7814e2532471ce6859397be9","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XgAMy6YAefTAoXCkWijH4ERB7BSiAcMAAwkiUdw0TI5PQ4soJFiwJ1SF0HrZjIwiGwujA0dIKKFovI0Ri/HAACIwRGkZi1Uikmj0GTGPg6Yy8IgQdhQcxWGx2GE2OEMKguNx4ADKA14mx8iNhUXsiLAyJSvGYil4pBgKXYnTIBu8vmEvAA7t5oU1eE7eLBkZEoIldql0plsnkqAUinBShVqrV6o1mm0Ot1ev1BsNRuMSrB+YLbHASsa1ab4gVLKxprMQPNFogAIwAVlW602y3D+0OHgrEVNTmyXyuIBudweZCQ7beHxweB+M92/w8LA4XD4g/VCOxqPRpMtuN4+NiimJqlJ5MpQppdNYDKZLPNorQHK5vOLQpF8nFkulWV5UVcIVR3YdNVcdwQD1exDVVIdolZS1rVte1HWdUhXSNLkvR9f17ADIMzhgUMkgjJAMiyM4YwIQpijKSoajqBomhadpOh6PpLAGZghkCfMJiLWwS1IMtwOias0Fres5j2BhEAANgAZk7MANi2Z5ewOBSJzCStohHEikAAJmuW4BWnJ4W3nahPiXYgV2oNcQEYLBNBwOwMD4Y4jxReIwGYHi0XJM4UicJsFIAdg7LIu00nZqAWHS8ECnijPORAzInCz7keWdlNszBF2+RzyFXegmHcrQyEwHySX3eJ7RBOAAH4QrQUgwuQKZeAAH14cFiJDCL5OWFs1I07ZtP7EBmoQU5MuyydLPyrLXneOySoIMq/kqgdcJ1DhYHKxsxtbdtJu7JSZt0o75Sc0ckFUnKpzWxSivs0rfgq3SNyBbdcOOM9CQvdFDG0Xg9GOCGTBA5V7GOJwtWgrwcI9QIyBCCSYlBhJyLSSioxo/J6ITRjkxYtN2MzLicz4vMxgmWSzoWBSW2U8c1nU67Er2FKPCRxavhela8pnLKbM24qvh2n7nP21zqs8ureHuk74nNS00WAcxeH13g0sZXhQvUgBuPWDa0NAoQTXhdehA2nbgHBSLRAA5LpLAAIzIa9OtvWwLcd/WXmDl5RrZ2dWkUq7NNjpK+10rWUQyr5ErFqzlk+7bl1Ot8qo82rvMNoLjdN8K5Kj1s2yiuPpsTgXwDLtOG8ztaTIuHPZbzva/uV4u+Gt22dct/WXZgN3eE9n2/YiG8qVIcPI+bFsope7mpsQOvG9m4f59bxAM9yrPEGUj7pa+uWnIL9cB68vgJ6nmffeFeeA8Xlf2YADkSzfrtivzWaT8oCH2Pm9CWrQordwcvLW+IA6RYRfmQD2XtX7+wpJ/SC2oPAAEFoQQG9uUPkcFbj2HtO5eApoRDMENmgl0EAQSoRCI0RQ8ReC4NYKwXgAApZgdIdT8C6lgewYB6FiWtPaXgilWhVG9n6EErAICCjClUGwZxRHiLgGGVmq8lgTTijzeOt08DINOk9I+5kIFPDbK0F4DZESwDwEqWw9hgDohfPpRC9gXigk0JYXgAByAAApxbMPFkhJmYqmNibRAnB3MMEnGjB3FGzRIE9WZBAksnmmiZAgTIj0ECb1F43BzCCA9JkrC54lDontpbeYNt+DIRRFDe2pdgpBKqdk3g+8yQ6xNq7KAqDZ5YV8WHcwEcqAROYEgUA544BQjwGgBALwXhAA="}
import { Base, component } from '@studiometa/js-toolkit-v4';

@component({ name: 'Slider', refs: ['next'] })
class Slider extends Base {
  static config = { name: 'Slider', options: { speed: Number } };
}
```

They merge in a class initializer, which runs after the fields and inside the class definition, so `registerComponent()` reads the finished config. A key both sides declare differently is reported as `component.config-conflict`.

See [`@component`](/api/decorators/component.html).
