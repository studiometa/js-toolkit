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
// @twoslash-cache: {"v":1,"hash":"597d6ac4a3f47f224d98aa0e7b916add9439cf4470a0d73666f95c0f60c0cdd8","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8aTMABGCDmewYiAArDssutNttdgsDtDPGCIVkzl8AEzXW6ke6PJAANjeHxweB+ZD+9CYbE4PF8QOOMjk9DiygMmm0vD0x0M2jMFnCdgcJ2crncnm8LP8ciCIX4YRskWiHIUCSSqXSmWyeSoBSKcFKFWqtXqjWabQ63V6/UGw1G40mM0hC2hpIA7KtEVtEPC9mijhInNk8QS7g9aYgAIyvd7UT7U4i03b/DyMLC8siYPgg8HxFVgABm7BSiF4wHMvDrvDAzEsMCrnVIZxSAG5a/XSDBS6beG2O8gpt2wC8nPNFogABwAZj9YA2AdJKP2hw8JfLKXDOKQi5AN2jJOeFOTVO+afIGfpWZzWjzGD4jebrbQ7eXU6hy1nS5XyLUKim7gE2koRoBx5EjGTytOemCXgQ150ui2a5nYz68H2A7vp+KSjt+npIHGcZrgiy5IoG64hh42FYhBsJRtBp5wbMR7QF8IBWDY4rABKvAvLwpaaJYvAAOQAAKdD0fTNsk5o1HUDRNGJ47mICCqFgEnKKNyqjVj28xoOw/ChGWFb8gZYD1g2YFVmJWliRQPZ1nRVbIGJHCdE54nJOCo4+WJWDMJErBwAFsw9i846TlQcnMEgoCxGAcB9GAeCVCALwvEAA"}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"774d76721604e7c9f4569ebabd7a6623dc8d30fff2e10b41e7ef32554538303b","data":"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"}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"367227f42554a5f27eb23a78c054bbd99a936bdce820711d0ea83a87ae8043b2","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8ACyYyc80WiAArDssutNkgAMy7BYHBgeUFYJzZL4AJmut1I90eSAAbG8Pjg8D8yH96Ew2JweL4gccZHJ6HFlAZNNpeHpjoZtGYLOE7A4Ts5XO5PN4Wf45EEQvwwjZItEOQoEklUulMtk8lQCkU4KUKtVavVGs02h1ur1+oNhqNxpMZnM9ujSaTVvCtohYXs0UcJNizniCXcHrTEABGAAcFOon2pxFpu3+HkYWF5ZEwfEx8RVYAAZuwUoheMBzLxa7wwMxLDBK51SGcUgBuGt1ywQLrRADKaCJNBSGBbw/bXbAL3BnqQ8fxcLAG39PuoqMOHmLZZSYfOiGRIBuUZJzyTmCp3zT5Az9KzOa0eYwfAbTYnbZXc4W6KWAHZfRXBEAxRfYt3ARtJRxbZIyJaMnlaC8U2vX473REBs1zOwX14Xt+zQIcRxgMcP3bb9IVjWNYTWID/VjI8g3AvDB2HZhRwwfcvihWDiRjRDZmPaAvhAKwbHFYAJV4F5eBLTRLF4AByAABToej6JtknNGo6gaJoFOncxAQVTFNS5STqzAWt5jQdh+FCUty35Ktu1rN9m0UzEFIoFzcL7FiiJIxSiHYOB2AAIzWLzuxeadZyoDTmCQUBYjAUKIjwSoQBeF4gA="}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"4dc28c9a21b9ac78393d5c4b3ea4b7095aa7d187659b5465bb80ccaa65004afe","data":"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"}
import { Base } from '@studiometa/js-toolkit';

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
// @twoslash-cache: {"v":1,"hash":"db4e2ef9b7598c6d5a14b5563522097cf0bd838dcb3ef74855708b5489ef2ef1","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XgAMy6YAefTAoXCkWijH4ERB7BSiAcMAAwkiUdw0TI5PQ4soJFiwJ1SF0HrZjIwiGwujA0dIKKFovI0Ri/HAACIwRGkZi1Uikmj0GTGPg6Yy8IgQdhQcxWGx2GE2OEMKguNx4ADKA14mx8iNhUXsiLAyJSvGYil4pBgKXYnTIBu8vmEvAA7t5oU1eE7eLBkZEoIldql0plsnkqAUinBShVqrV6o1mm0Ot1ev1BsNRuMSrB+YLbHASsa1ab4gVLKxprMQPNFogAIwAVlW602y3D+0OHgrEVNTmyXyuIBudweZCQ7beHxweB+M92/w8LA4XD4g/VCOxqPRpMtuN4+NiimJqlJ5MpQppdNYDKZLPNorQHK5vOLQpF8nFkulWV5UVcIVR3YdNVcdwQD1exDVVIdolZS1rVte1HWdUhXSNLkvR9f17ADIMzhgUMkgjJAMiyM4YwIQpijKSoajqBomhadpOh6PpLAGZghkCfMJiLWwS1IMtwOias0Fres5j2BhEAANnHNYwA2LZnl7A4FInMJK2iEcSKQAAma5bgFacnhbedqE+JdiBXag1xARgsE0HA7AwPhjiPFF4jAZgeLRckzhSJwmwUgB2Uysi7DSdmoBZtLwAKeMM85EBiycLMeWcAGYbMwRdvgc8hV3oJg3K0MhMG8kl93ie0QTgAB+YK0FIULkCmXgAB9eHBYiQ3C+SkAADjGzs1O7RAEr2ZKPCahBTgyrLzPuXLMted5bOKghSr+CqB1wnUOFgMrG1G1sWxi1T1KQRStP7GCzsc0ckDysyp02xTCrskrfnKnSNyBbdcOOM9CQvdFDG0Xg9GOWGTBA5V7GOJwtWgrwcI9QIyBCCSYihhJyLSSioxo/J6ITRjkxYtN2MzLicz4vMxgmWTLoWBSbsiqb7tmp6dPRlavk+id1sskzrJ2oqvn2wGnKOlyqo82reFO+UyHic1LTRYBzF4I3eFSxleBCtSAG5DeNrQ0ChBNeAN6FjdduAcFItEADkuksAAjMhrw629bGtl2jZeMOXhG7nZ1acW7pmx7Er7HTdZRdKvgS7KNpnZ4/r25cLrfSr3JqryTcCs2LbCuTY9bNsEsT+KhZSqvM+2L6crz4yLgL+Wi8O4HVfLvg7Yd/WbaN92YE93gff9wOIhvKlSCjmPmxbSKVLipA+ZThaQHH5eO8FiXvrzvLftl/6Fcckv1xHzy+BnueF4D4Vl+D1eN55saW35jNDsB9nqvygKfbOktNqtEiv3eyisH4gDpFhd+ZBva+w/kHCkP9ILag8AAQWhBAP25Q+RwVuPYe0bl4CmhEMwE2GCXQQBBKhEIjRFDxF4Pg1grBeAAClmB0h1PwTqWB7BgEYWJa09peCKVaFUP2foQSsAgIKUKVQbBnHEZIuAYYuabwmoAjSyd5rPVQRdd6Z8c5S0QI3F4DZESwDwEqWw9hgDohfHpRC9gXigk0JYXgAByAAApxbMPFkhJmYqmJogSw7mGCYTRg7jTZokCZrc6gSWRLTRMgQJkR6CBJ6i8bg5hBAegyS6c8Sh0ROxtvMe2/BkIonhk7SuQUgmVNIFk3gx8yT63Nh7KA6DF5YV8ZHcw0cqAROYEgUA544BQjwGgBALwXhAA="}
import { Base, component } from '@studiometa/js-toolkit';

@component({ name: 'Slider', refs: ['next'] })
class Slider extends Base {
  static config = { name: 'Slider', options: { speed: Number } };
}
```

They merge in a class initializer, which runs after the fields and inside the class definition, so `registerComponent()` reads the finished config. A key both sides declare differently is reported as `component.config-conflict`.

See [`@component`](/api/decorators/component.html).
