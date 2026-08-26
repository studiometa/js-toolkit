# registerComponent

```ts
registerComponent(ComponentClass: BaseConstructor): void
```

Registers a component and its merged family, then scans the document for matching elements.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"d4957b76c67e9f181bfa6ae1d1538753f6efbcf0bab624cc6d68f72ff9b63cc7","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGC8pDB+7C5kAMIQ1p2+aIzDo0lgaINCcHCIDjDDYC6kzTm23MtEEOxQ5lY2dt29/blTNjMMVFAQ/AgxAEoXA6S8zAIjN+Nfil47DQIksZEiUCazEs7FYGAovECvl4cH4zC6lmYaAyiT8ch8YNmcAAdOZzNJ8DBeGBoVT+CN4E1NJZEZTeGCIjBIfSwI12H4ERwANZUpFA9auNowADkIgABgASQ5ygGQpHmOUASQAcgBlaQAQW1gwAorqVZisLwRRggfYsM0AEYcOCUkTA1SsRq8VqwUjLb5wJ2CYS8ADu+HYGTk9F8Si+5np03+YeB+BjaFI3x5fLx6MhjVskRBiIg5xpYPDEGarEhECRpFTqnOfQ+5l9ZF4co7fKSUBViQGzDr3vprA4UFx4bTrKpFapwPFlNIwK5xKcLjc0QAjABWby+AJBRDbgDsYTcxbwPVbV1+Y1mTg4SSQaRAGSyOUqJ93RRKODwQgSHIMJ5DwENFl4XUJ0qKhN3cRBTwANgPfxAiQFDqEvKI8Ggw5YJAZ9kgAJnSTIsy/PIkL/ahSkAioQOoMCYhYDguD4CDlAkGQMzjLjVEMbReD0OJBJMY5RjOOIN3CaIPG3VCjxCC9OWiWIJCfRISLIz9ciQYjtxozAAJiICCOqNTGCwTQcDsDA+Dwv1iRzfllmAcxeE86laWWDZcQAbnMAoZK3JBtxSc9CMPdDEEw8IrxiFy/E0l9EAAZh0ii9PyIy6NMhiqmYkArJsshMD4edfMzXEQoQ7dtwADkUmLQiw1S8HnFLkgy99yOybLiJSXKTPKYDCpqFi6nYltLiGe9bkmebxnmYRljiNYNi2NAdj2A4jgsST7BvWbSGuB87hAB4njwN5b07bMltmVU7VBcEuShGE4QRJEulRdF2SxHF/HxGBCRBUkwHJNl5x+MEREaZlZ3ZN7uU6XNBXYEUkcHSV+BleUlX7Z71TALU9UNY0zQtZgrRtO1eAdZ1+jdF6YC9H1FDIAMUWDBYRAjKN03kPiEzaR77FTQIMyzH5eX5Z7C1UkRtvLWkqxrOsGybKljrbMAO0+btOd7LkBwlGBh14CBRwgcdDinSX0zFGHF0SZdVygdc4NksK0q8KK0OPM8VISkBdbvZNHwSVLMI/LLvyG4paJGszGIs8C+agmDGPgndd0inxA4wkOcJiRyCKI4vet079GoKABddJoDKE5bHsYAVgRcO5sj+wCiZEZeGlAABFxmknBlXAAegAKzgABabbbaFYF56IYJpUCyG2kz8vPmFxR+KpdyuhRVw0CjWXc2E3gO8qoe9+lXgCi3goyTAbvTvFxg9+4fynDBK4JAoAD5wA6GAPAc8QAFAKEAA=="}
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
// @twoslash-cache: {"v":1,"hash":"acb161bdbb30a175495e1364bd87a3185f45a5f05aec54733528513dde8f475f","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGACENadvmiM/J2N7H6IDjAAwsOj3OMycvS+ShPTYC6kzTm2xoxEbM0w49IU3WDVaOOTQnBwACIwQ6TMaLZrFzLGfDrGvEQQ7Cg5isNjs3V6SXOTigEH4CBiAGUorxAjBwTZIfYhmARn5eMxFLxSDA/OwXGQUfg0YJhLwAO5Urrsexk3iwEZJKAAOicLjc0QAjABWby+AJBfJhNyRaIgIYQ/pODhJJBpOWZZ45SqIYVFEo4PCEEjkMLyWocLh8eUY/qDGZjVb2ua8BbyZbKCRrDZbV6kXb7ViHY6nbEXK43e6PWwvN6dD7SL68H5/AFAiy9MHWvpQqgwuF4JH2VHo7NY+34wnE0nk0iU6kR+mM3jM5sidmJGDc3nhaIANgAzKL/IFPFKIlE8FnMUqO0gAEzpDXZXJIAV66ilQ0VE3UM0xRhYTQ4OwYPhxNa4rlgZiWI68DaJPzd/lIADsIpAPmHEtC1GlE5ia9bxnFVEAXdUsi1PIBX7ddMANGIjUqU0an3Q8tDITAz09e0uWJRo4AAfnGB9/GQABdXgAB9eFadtOWfdx8gFIdxRCMcZTwfCEASUDwIySCVzAwpig3BDymNKo9zlBsEQ4WAdz5JiBWFViR0QXsOIAkA5MBZDP1nRBBwgzUhN7ODN0Q7cpNQkAWAtBoaVuCZXSWRQPVUQxtCTCYvJMYEM3sOJGMFfs1S/NjEF/cJOJiYLeOSYyBNM7U5zXcj0mgMoQVsexgAmEMehtc5eAKJpNEsXgAHIAAEXGaKAOlvVwAHoACs4AAWleCBWAAa2ZTqiGCKqAG5zHMGqp1tfKgLvKrdIUqrTm48ZkCqpJ6CqyiCm4cwnJERaKTddyJl4YACicZrmCQUATrgDowDwNAEAKAogA==="}
import { Base, component } from '@studiometa/js-toolkit-v4';

@component({ name: 'Slider', refs: ['next'] })
class Slider extends Base {}
```

See [`@component`](/api/decorators/component.html).
