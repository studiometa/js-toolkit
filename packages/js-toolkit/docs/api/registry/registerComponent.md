# registerComponent

```ts
registerComponent(ComponentClass: BaseConstructor): void
```

Registers a component and its merged family, then scans the document for matching elements.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"adc53b88e7b35f1520a3e0a8ebf2c58cb01bedea44b580bfa1a856cc6ff70ce6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XgAMy6YAefTAvFIMBS7E6ZAAwmEbJFoowUeF0WgkX44IgHDAUWBOqQug9bNxCUQIOwoOYrDY7DC4QjHli0VEGFQXG48AAlNmI0i8ZihbHcsWKXhNESWMgHKCg5iWdisDAUXibKK8OD8ZjQyzMNA3M4pORrBXRODxczmLw+MCqnz8foiEGaSza7y8BX7GDKt1gEHsFJajg5Hw62Wk5IQmAAchEAAMACT0lPS5U68wpgCSADkAMrSACChaRAFFi1njVheFGQk1eFgugAjDhwbwiOUwVgg3jg2CkQniuAdwTCXgAd3w7BucnocREzHMbsl0VnTXwS7QpHFwdDFsNypBtgOaBEtVZzoVs4gXVYyogOtIM4RPlh8JF5mHZF4FN/1DSIoCzM5EWYF9BzdVgOF6MALQ/TYfSdF1ZXsM5vFIJpA0SXZUnSTJsjyKgCiKAkykqGo6gaJoWnaToej6BVBmGUZxhKb92WCLjhQ5VEIm5eICksVhplmEB5kWRAAEYAFZVnWTYkFkgB2AiAwYDxuJFTkhOiJxsi+K4QBuO4HjIVT5LeD4cDwH4rN2f4PCnfxeGLeCnKkvZtLUgBmJTEJUxAADZNMvPBPPpbzjKQAAma5bgPSynlC2zqE+BziG8mh6ABDguD4NzlAkGQ9xXIlDG0Xg9GOaqTEZcIWWOJw+XcTxfRKuQghCDcuS3WJFFtJJCKQDIsjOUiCEKYoqOqWp6kaZo2g6bpen6NjAg4iYJLmXykAADkOoKNi2RAdmoBZIo8VrTnORBErM5L7keBLZIyzB7O+HLyGc/KPEYLBNBwOwMD4aKR3iI8w0JYBzF4RHeDvGBCTJc0AG5zBeJxpO02SLkutZgvO8Krq0vAYZSIyzi+QLnost7nk+rKft+f7tJAIGQbITA+BRtH93NXGDrkhTTpCy69hu8AXRph76fMlKmfii4We+ghfr+AGucBIrWR/ATNzQTFBJxPFhEJY4STJClalIaleFpekmuZexdKNgaeWcVwOqFQ2AMPM2pVPDD5UVQMVTVDUtR1aF9UNP0TTNRDLRga0rztMAHV9FGJXgUEvVQv0I6DCJjwjdgo2LiD434JNUwzMDs1QvMi1LCtq1rJOGybDDWw7LsezD/tB3/UcxT1Sd8VnedFyGpQxXXYOt2Q3d5APUIQzDFvzy068IFvdCZ0fZ9eFfbCP1UA32TIP9FAAoCH5AwNwLjGAoPPmD6ng81txQmMecWxYTILhKA+ErppHGsRKa+RZqUQqAtWiy0GJrWYptZgQxtpjAmB7XiHtkQrzQCJNAYk9o+QWPjfyZNiZnVUhpcmMsCGkH0jieWXwyZK1elZRAat3iZQ1o5P61AXJmRnpDbyeNrJE2UqTCKhwPASOEXFMKSVGY8NkodF4kk3SwDwEyWw9hgBEi1Mw1hUoXiFzCLwRMAABJiG1WLMEQTRJaTRExY2zhCcRXlRQL1KtfeG0I9TJDQAuLex5aq8GMQLGxSjEy8BeJ4l49owBmKIYwJR3AMZOCcUgUAQ04BQjwJUEALwXhAA=="}
import { Base, registerComponent } from '@studiometa/js-toolkit';

class Slider extends Base {
  static config = { name: 'Slider' };
}

registerComponent(Slider);
```

**Parameters**

- `ComponentClass` — a class extending `Base`, with a `config.name`.

**Return value**

- `void`. It is a registration, not an instantiation: the elements that match get their instances through the ordinary pipeline, and there is no list of instances to hand back. Use [`getInstances()`](./getInstances.html) if you need them.

## It registers the family too

`config.components` is walked in one loop, so one call covers a whole tree:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"00c69a96a9339bb4200124172682d7148c3d1a50530f2f3b3bedd22bdf19356e","data":"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"}
import { Base, registerComponent } from '@studiometa/js-toolkit';

class AccordionItem extends Base {
  static config = { name: 'AccordionItem' };
}

class Accordion extends Base {
  static config = {
    name: 'Accordion',
    components: { AccordionItem },
  };
}

// Registers both.
registerComponent(Accordion);
```

A thunk in `config.components` is **deferred** rather than resolved, and becomes a lazy entry of the same registry under its key. See [Autoloading](/guide/going-further/autoloading.html).

## The name comes from the merged config

Like the instance's `$id` and the instance-map key it publishes itself under. A subclass that extends a component with extra config and forgets to rename therefore **collides** with the name it inherited, rather than registering under `undefined`.

## One name, one entry

As with `customElements.define()`. A second registration under a name already taken gives a `registry.conflict` warning and is ignored.

The exception is a lazy child declared by several parents: that is the normal case, and it is **first wins, quietly**. A token two components genuinely claim is caught by the class-name check when the import lands.

## Registering a class you cannot edit

Do it in expression position:

```js
registerComponent(
  class extends Vendor {
    static config = { name: 'CompactVendor', options: { compact: Boolean } };
  },
);
```

## What it does not do

- **It does not construct anything itself.** The registry does, when the DOM and the mount strategy agree.
- **It does not take a name or a selector.** `config.name` is the only name, and arbitrary selectors are removed.
- **It does not take a promise or a thunk.** Use [`registerManifest()`](./registerManifest.html) for a lazy entry.
- **It has no inverse on a page.** `resetRegistry()` exists for tests only — see [`/test`](/api/test/).

## `@component`

The decorator writes `static config` and calls this function in one step:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"dd87ce9a264881b1f3d2673cc002179b049af54dac0c2f37fe347b39bb2d615f","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XgAMy6YAefTAoXCkWijH4ERB7BSiAcMAAwkiUdw0TI5PQ4soJFiwJ1SF0HrZjIwiGwujA0dIKKFovI0Ri/HAACIwRGkZi1Uikmj0GTGPg6Yy8IgQdhQcxWGx2GE2OEMKguNx4ADKA14mx8iNhUXsiLAyJSvGYil4pBgKXYnTIBu8vmEvAA7t5oU1eE7eLBkZEoIldql0plsnkqAUinBShVqrV6o1mm0Ot1ev1BsNRuMSrB+YLbHASsa1ab4gVLKxprMQPNFogAIwAVlW602y3D+0OHgrEVNTmyXyuIBudweZCQ7beHxweB+M92/w8LA4XD4g/VCOxqPRpMtuN4+NiimJqlJ5MpQppdNYDKZLPNorQHK5vOLQpF8nFkulWV5UVcIVR3YdNVcdwQD1exDVVIdolZS1rVte1HWdUhXSNLkvR9f17ADIMzhgUMkgjJAMiyM4YwIQpijKSoajqBomhadpOh6PpLAGZghkCfMJiLWwS1IMtwOias0Fres5j2BhEAANnHNYwA2LZnl7A4FInMJK2iEcSKQAAma5bgFacnhbedqE+JdiBXag1xARgsE0HA7AwPhjiPFF4jAZgeLRckzhSJwmwUgB2Uysi7DSdmoBZtLwAKeMM85EBiycLMeWcAGYbMwRdvgc8hV3oJg3K0MhMG8kl93ie0QTgAB+YK0FIULkCmXgAB9eHBYiQ3C+SkAADjGzs1O7RAEr2ZKPCahBTgyrLzPuXLMted5bOKghSr+CqB1wnUOFgMrG1G1sWxi1T1KQRStP7GCzsc0ckDysyp02xTCrskrfnKnSNyBbdcOOM9CQvdFDG0Xg9GOWGTBA5V7GOJwtWgrwcI9QIyBCCSYihhJyLSSioxo/J6ITRjkxYtN2MzLicz4vMxgmWTLoWBSbsiqb7tmp6dPRlavk+id1sskzrIbRFYDwJVbHsYB0RfPTEPsF5QU0SxeAAcgAAU47MeOSJNmNTJo9YAbnMcwDcJxgVdSxl9dO+UyD1lklrRZA9cieg9Z6l5uHMQQPXd86CQUJR0V4YAXicU3mCQUBzzgKE8DQBAXheIA="}
import { Base, component } from '@studiometa/js-toolkit';

@component({ name: 'Slider', refs: ['next'] })
class Slider extends Base {}
```

See [`@component`](/api/decorators/component.html).
