# registerComponent

```ts
registerComponent(ComponentClass: BaseConstructor): void
```

Registers a component and its merged family, then scans the document for matching elements.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"d4957b76c67e9f181bfa6ae1d1538753f6efbcf0bab624cc6d68f72ff9b63cc7","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XgAMy6YAefTAvFIMBS7E6ZAAwmEbJFoowUeF0WgkX44IgHDAUWBOqQug9bNxCUQIOwoOYrDY7DC4QjHli0VEGFQXG48AAlNmI0i8ZihbHcsWKXhNESWMgHKCg5iWdisDAUXibKK8OD8ZjQyzMNA3M4pORrBXRODxczmLw+MCqnz8foiEGaSza7y8BX7GDKt1gEHsFJajg5Hw62Wk5IQmAAchEAAMACT0lPS5U68wpgCSADkAMrSACChaRAFFi1njVheFGQk1eFgugAjDhwbwiOUwVgg3jg2CkQniuAdwTCXgAd3w7BucnocREzHMbsl0VnTXwS7QpHFwdDFsNypBtgOaBEtVZzoVs4gXVYyogOtIM4RPlh8JF5mHZF4FN/1DSIoCzM5EWYF9BzdVgOF6MALQ/TYfSdF1ZXsM5vFIJpA0SXZUnSTJsjyKgCiKAkykqGo6gaJoWnaToej6BVBmGUZxhKb92WCLjhQ5VEIm5eICksVhplmEB5kWRAAEYAFZVnWTYkFkgB2AiAwYDxuJFTkhOiJxsi+K4QBuO4HjIVT5LeD4cDwH4rN2f4PCnfxeGLeCnKkvZtLUgA2JTEJUxBAuoBZLzwTz6W84ykAAJmuW4D0sp5/Ns6hPgc4hvJoegAQ4Lg+Dc5QJBkPcVyJQxtF4PRjmqkxGXCFljicPl3E8X0SrkIIQg3Lkt1iRRbSSQikAyLIzlIghCmKKjqlqepGmaNoOm6Xp+jYwIOImCS5l85ZZKCjYtkQHZwq0o4JCMs4vkSszkvuR4EtkjLMHs74cvIZz8o8RgsE0HA7AwPhopHeIjzDQlgHMXg4d4O8YEJMlzQAbnMF4nGk7TZIuDSsmU06wr2SLXIiY8bvORAAGYkos57njerLPt+H7tJAf7AbITA+ER5H93NLGDrk2SAA5jpC86ScODxEcpr5aYe+mrMQeKLiZj6CC+v5fo5wEitZH8BM3NBMUEnE8WEQljhJMkKVqUhqV4Wl6Sa5l7F042Bp5ZxXA6oUjYAw9zalU8MPlRVAxVNUNS1HVoX1Q0/RNM1EMtGBrSvO0wAdX1EYleBQS9VC/UjoNybDCN2CjEuIPjfgk1TDMwOzVC8yLUsK2rWtk4bJsMNbDsux7cP+0Hf9RzFPVJ3xWd50XIalDFdcQ63ZDd3kA9QhDMNW/PLTrwgW90JnR9n14V9sI/VRDfZMg/0UACgMfkDA3AuMYCgi+YPqeDzW3FCMZ84tiwmQXCUB8LhTSONYiU18izUohUBatFloMTWsxTazAhjbTGBMT2vFPbIlXmgESaAxJ7R8gsHG1MVgE2CqddSmlSYgEIaQfSOJ5ZIDCuZFKDN1bvEyprRy31qAuTMrPMG3lsbWXxmsehXCmEyxAJIkRcVQp014SrMWLxJJulgHgJkth7DACJFqVh7CpQvCLmEXgiYAACTENqsWYEgmiS16JtETOjHOEIJFeVFIvUqN8YbQj1MkNAC5t7HlqrwExfNbEqMTLwF43iXj2jAOY4hjAVHcFRk4ZxSBQBDTgFCPAlQQAvBeEAA=="}
import { Base, registerComponent } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"4fa3b42bfb2be1519d8d30d9d7b5eb3061ead974e4d55b50a4d96eb610a65ff7","data":"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"}
import { Base, registerComponent } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"acb161bdbb30a175495e1364bd87a3185f45a5f05aec54733528513dde8f475f","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XgAMy6YAefTAoXCkWijH4ERB7BSiAcMAAwkiUdw0TI5PQ4soJFiwJ1SF0HrZjIwiGwujA0dIKKFovI0Ri/HAACIwRGkZi1Uikmj0GTGPg6Yy8IgQdhQcxWGx2GE2OEMKguNx4ADKA14mx8iNhUXsiLAyJSvGYil4pBgKXYnTIBu8vmEvAA7t5oU1eE7eLBkZEoIldql0plsnkqAUinBShVqrV6o1mm0Ot1ev1BsNRuMSrB+YLbHASsa1ab4gVLKxprMQPNFogAIwAVlW602y3D+0OHgrEVNTmyXyuIBudweZCQ7beHxweB+M92/w8LA4XD4g/VCOxqPRpMtuN4+NiimJqlJ5MpQppdNYDKZLPNorQHK5vOLQpF8nFkulWV5UVcIVR3YdNVcdwQD1exDVVIdolZS1rVte1HWdUhXSNLkvR9f17ADIMzhgUMkgjJAMiyM4YwIQpijKSoajqBomhadpOh6PpLAGZghkCfMJiLWwS1IMtwOias0Fres5j2BhEAANgAZk7MANi2Z5ewOBSJzCStohHEikAAJmuW4BWnJ4W3nahPiXYgV2oNcQEYLBNBwOwMD4Y4jxReIwGYHi0XJM4UicJsFIAdg7LIu00nZqAWHS8ECnijPORAzInCz7keWdlNszBF2+RzyFXegmHcrQyEwHySX3eJ7RBOAAH4QrQUgwuQKZeAAH14cFiJDCL5OWFs1I07ZtP7EBmoQU5MuyydLPyrLXneOySoIMq/kqgdcJ1DhYHKxsxtbdtJu7JSZt0o75Sc0ckFUnKpzWxSivs0rfgq3SNyBbdcOOM9CQvdFDG0Xg9GOCGTBA5V7GOJwtWgrwcI9QIyBCCSYlBhJyLSSioxo/J6ITRjkxYtN2MzLicz4vMxgmWSzoWBSW2U8c1nU67Er2FKPCRxavhela8pnLKbIbRFYDwJVbHsYB0RffTEPsF5QU0SxeAAcgAAU47MeOSJNmNTNi2h1gBucxzD1nHGCVtLGV1+6Tp1ll5rRZAdciegdd6l5uHMQQPTdl1zyUdFeGAF4nGN5gkFAc84ChPA0AQF4XiAA="}
import { Base, component } from '@studiometa/js-toolkit-v4';

@component({ name: 'Slider', refs: ['next'] })
class Slider extends Base {}
```

See [`@component`](/api/decorators/component.html).
