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
// @twoslash-cache: {"v":1,"hash":"f9f2b84f87e4c484a476ef8c1fee6955124e6cdb91c6a0229ae8555121484242","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvNLMAEYIVC5u0QCsAOzevgFBiKHUbpHRII0tThxJSABM6Zmk2blIAGxFJTh4hCTkYfJMbJw8AkJwyhIycvS+Sg7qmtq8enGG2mYW1rb2cU7t7kQ3TSIB8/kCITCoyieD+CVmiAWIAyWRylUQAEZCsVqKUdhV9tRDjFGFgnmRMHxJnAAHT8CBgABm7D8iF4wHMvC5vDAzEsMDZLlIiT8AG5OdzSDBGXBBWhhf5kABdcVgAr/cLRAAcaz64MGupGERhMXpTJZ00SyQAzItUat8ptcdsYrtKgcaiSyVoKRg+Lz+XKFX4NR0kBiUhi9QNIUaxngA/FQVbYyjlmi8sEnZgXeU9lViSBSeS7H7eFKZUGRcrQ4CMVjoxChlDjeMK61kwjOnb0w6s0r0tAylYbHZ2Q9eAVeIzNJZeAByAACLgArlB2BB+a4APQAKzgAFo0BAIKwANbsNAHojBeeq8x1C4NZoieR3S6qdkS9podj8AQMsyfgvF+YDcjyfICgu1LzhQEpcu2bLIPOHAuLBC6uC0yrofOWDMEkrBwNhA4SgUqrqlQW7MEgoBvmAcAbmAeD7iABQFEAA"}
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
// @twoslash-cache: {"v":1,"hash":"c0fe69516b685802e37b645c90f8d24aa77a4686e363bd0a8d66510328794f14","data":"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="}
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
// @twoslash-cache: {"v":1,"hash":"c43cf6369c04b4267f9048b177e1e2a893703a1798c2e9ee68cb22e24f907263","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvACyzFhOLm7RAKwA7N6+AUGIAMxhbpHRIE0tCUlIAEzpmaTZuUgAbEUlOHiEJORh8kxsnDwCQnDKEjJy9L5KDuqa2rx6cYbaZhbWtvZxreHRqy8IB8/kCIRGESieF+02S8xAGSyOUqiAAjAAODbUUrbCp7agHGKMLCPMiYPiTAB0/AgYAAZuw/IheMBzLx2bwwMxLDBmS5SIk/ABuNkcywQACuYDQAGU0EsaH4MHz5YKRWACn92kh0R1eqCBqsIWNarSGX4nBwZkMFkiVvksZgtjEdpV9jUiSStGSMHwuTyVQL/Fr3GiUmlgX0wYhQtRRlCYv74sDEslY4ilsi8sFHTiXXiqoSQMTSXZfbxxVLZfLmIrlbx+YKQ9FUaiepGDUhUcM45DxpXpXKFTAlZbU0g9QjFssUTmALrpaBlKw2Ows+68Aq8OmaSy8ADkAAEXBKoOwIDzXAB6ABWcAAtGgIBBWABrdhoe9EYL79XmOrnI0zTXAodxxCyoptGg7D8AIZqMs8EFgBynLcryB6TPuFCiuyA7VsOSrMvuRDsHA7AAEY+FhooFOqmpUJezBIKA8i+GRtJ4HeIAFAUQA==="}
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
// @twoslash-cache: {"v":1,"hash":"a46d9d32239f674899a5ba06de3ddb3b1cca96176e4af335dd676de119683d5c","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvACCAEYupNloAMIQYGiarE4ubtEArADs3r4BQYgAjMNhbpHRIM2t7V09fU4cSUgATOmZbTmViABsRSU4eIQk5GHyTGycPAJCcMoSMnL0vkoO6k02l4ejihm0Zgs1ls9jiA3C0QAHDMJv5AiEFhEong4QldogDiAMlkTnkAMwpS7UUo3Cr3aiPGKMLBAsiYPirXrrbq9CCsAB0/G6ADN2H5ELxgOZeDLeGBmJYYBLWok/ABuaWy0gwYVwZW9VXIAC6GrAst4WjQ7G6eslmvNMqETRgrAlAGUDf4Nq0AK45Wym80FU0FeFDTzjEA+NHTM6Ypa1EVi7aJZJkw4k3KeKmYa4xW6VB41JksrRsjB8eWK/WkVVh9yzGaE6NTDHURbYmJV+JR1Nt4nHLOIYI5mn5ulVRkgZmsuwV3ja3U1w1G+vRGbBFFRybo4fxzsgRcIPHJeZEo7tU4j4rUvPlO6T4vT0s4Od8S3WsC2qVm2VOl3up6fjer0fpoAG5ihlQgwNjMZzptuMZIJG4QJjEH42im+JxuemZXqOd4FvS1TLDOZZvrw/6urwHq1l6Nqgf69IweuoyhIhraIGeqEHlRWHJDhA6XnkcwEWURGPssRBuDRQGAXRwEMaQYG2E4UAQPwCAxA0rCsBAADuIiWMwFhYD6QhWt0vAmVAvDCrYxloFa/gWsKvAkbwKr+CINm8LAuSWIkzCWWavl6fwwWfq5nk+i0QEiPp7CBIknnxfya5IDMyKopxOE8cstF1ieSCCRepL7HsYm0g+RbLHUHy8AAcswRBipF3QbLy/TQQi+wpGeLa7jMKEdsszWtX47VgJ1WzFbMaS4YOpwXDeubiROtW1O8IicoOM18hlBJklug3THM+7LLt3KbAdc0zAtQnlYgZKVatY73oWDJPmRr7sk1LVtSF+0CkKYCiuKdq/jK3bLv4gZajqtpeX4xrwzKGFfhKP4OrKcCEPpXTWMIEqiBAfIwCZIHKUxaO8MGkGHXswyIjlu55aNiZg8md1bo9Q6FG9hEbV9pEvuWlYKkqqUKYzowIadbb5Xg3b8ZlhJ8/hgvrTVItMGLFFHrDKOrj14bPSk7EK3u7ZYssR6q7MCEa3k15XNrn0kXrs5/Rj372p5+OE1gxNiGTPiU0pKmkCGh1kmcC1WyNtt4L7DsbhmS0u1V44657Jbe/OeMGUHIek+TEdfox4HMb1z2jCdO5nVuSsxEXBMQETHxp+xzuZcM2cfcRU7SaQofl2AJNhxT02R0xseIpbjfIRdOJTyZ3cZ8J+yIgURrpNAZRWDYdiSgCdN2Zoli8AA5AAAi4PpQNaiquAA9AAVnAAC04F8gA1klL+RBgjX1NOYeqO04p7R5H0H4Ch/hxEhjKQYVp+ACCTH4EESDZQwxvldHIwNr4UH9obXgyBr5NB9E5bo1897+19ljSizBnTUUKi5Iomp6ZgAKOYcB21/oTSmsDOBfxIFrAITAvk2CUHsDQaDcGWDsY4MlhKa+41AafkIcQqGC5EYSnIUKTucBaEUF4K/V+vBFRYigPoihVDwJgCITfQxwcPi0PoVgEK34A7Fw7q420Zdw5miKGYixVjIi2USoEXgAADKiMTOExyoC/ZgSBQDyF8HAT8eBP4gAKAUIAA==="}
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
// @twoslash-cache: {"v":1,"hash":"1f66761ff5247a2369bbd71728cd58e12f5f436e7814e2532471ce6859397be9","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGACENadvmiM/J2N7H6IDjAAwsOj3OMycvS+ShPTYC6kzTm2xoxEbM0w49IU3WDVaOOTQnBwACIwQ6TMaLZrFzLGfDrGvEQQ7Cg5isNjs3V6SXOTigEH4CBiAGUorxAjBwTZIfYhmARn5eMxFLxSDA/OwXGQUfg0YJhLwAO5Urrsexk3iwEZJKAAOicLjc0QAjABWby+AJBfJhNyRaIgIYQ/pODhJJBpOWZZ45SqIYVFEo4PCEEjkMLyWocLh8eUY/qDGZjVb2ua8BbyZbKCRrDZbV6kXb7ViHY6nbEXK43e6PWwvN6dD7SL68H5/AFAiy9MHWvpQqgwuF4JH2VHo7NY+34wnE0nk0iU6kR+mM3jM5sidmJGDc3nhaIANgAzKL/IFPFKIlE8FnMUqO0gAEzpDXZXJIAV66ilQ0VE3UM0xRhYTQ4OwYPhxNa4rlgZiWI68DaJPzd/lIADsIpAPmHEtC1GlE5ia9bxnFVEAXdUsi1PIBX7ddMANGIjUqU0an3Q8tDITAz09e0uWJRo4AAfnGB9/GQABdXgAB9eFadtOWfdx8gFIdxRCMcZTwfCEASUDwIySCVzAwpig3BDymNKo9zlBsEQ4WAdz5JiBWFViR0QXsOIAkA5MBZDP1nRBBwgzUhN7ODN0Q7cpNQkAWAtBoaVuCZXSWRQPVUQxtCTCYvJMYEM3sOJGMFfs1S/NjEF/cJOJiYLeOSYyBNM7U5zXUT4LKJCdwuJh0OPLDeF0hSuWxXFxmAcxeGq3ggLvUi/AAbiqmqtDQDp1gqlqapquAcE7cYADlmksAAjMgvTQTZtlIZquhqgo5oKELV2CTTPzFdT1pi7SytGEDkl/ZLl21ET9Sy6yUNlA8j0w09apveqpsfFadSFV81J/LTZTqg72JMk68jnFILPE7KbOu/K7r4NqOrgLr5uqvqYAG3hhrGibOm9GaltegVX2MiL1I+v9x1lWGsb+qLF0E7V+3MjLLIk/TcrQ26Tz4ZHUfR8bSEm6bfTxgAOX8iYlD8dtlLmoCpo6lygkJX1Bi7JKuvB9lrHmyCGkbef5n1bGhWF4RAABBLoIFGgArR4i0yexiUPeB+hEZhat1ikIEaCsMF4ABrRJuV4U3WFYXgAClmH2BF+FIdgsHsMAPdIV3iV4XtggAWlGltGlYCAXkfTObESRPk7gHkqCUwUPBYjbvyQbb/1lLWd2VQ6aZSvIhWCApyPSaAyhBWx7GACYQx6G1zl4Aomk0SxeAAcgAARcZooA6W9XAAeituBM9eCBWADtBM6IYJF7m8xl6nW0x7q8ZF+KshF9ObjxmQReknoRfKIKbhzBOREM/Wsbp3ITF4JVeafJ2r8DOLiHy99HqPxAa/XgFNOqQPvP1KAOsMa1lnotcwy0qBb2YEgUAYC4AdTwGgBABQChAA="}
import { Base, component } from '@studiometa/js-toolkit-v4';

@component({ name: 'Slider', refs: ['next'] })
class Slider extends Base {
  static config = { name: 'Slider', options: { speed: Number } };
}
```

They merge in a class initializer, which runs after the fields and inside the class definition, so `registerComponent()` reads the finished config. A key both sides declare differently is reported as `component.config-conflict`.

See [`@component`](/api/decorators/component.html).
