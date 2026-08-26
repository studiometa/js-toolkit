# Events

Everything a component announces is a real DOM event, and everything it listens to is delegated from its own root element.

[[toc]]

## The conventions

| Method name         | Listens to                                    | Payload                      |
| ------------------- | --------------------------------------------- | ---------------------------- |
| `on<Event>`         | the component's own element                   | the raw event                |
| `on<Ref><Event>`    | a declared ref, delegated                     | `{ event, target, index }`   |
| `on<Child><Event>`  | a component in `config.components`, delegated | `{ event, target, payload }` |
| `onWindow<Event>`   | `window`                                      | `{ event, target }`          |
| `onDocument<Event>` | `document`                                    | `{ event, target }`          |

Every one of them is bound for the **mount cycle** and removed by `$unmount()`.

## The component's own element

```js twoslash
// @twoslash-cache: {"v":1,"hash":"641dcac5e31faa092f5833a73f54ee0656da7b209c9e3d6570d27cb4df4764ee","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8aQQFIpNZOeaLRAAVgA7Kt1pskAA2XYLA4MDwgsEQ07nRAAJmut1I90eqLeHxweB+ZD+9CYbE4PF8QOOMjk9DiygMmm0vD0x0M2jMFnCdgcJ2crncnm8bP8ciCIX4YRskWiXIUCSSqXSmWyeSoBSKcFKFWqtXqjWabQ63V6/UGw1G40mMzmeyxcOJWSRW0QO2oGMOHmOTmyXz9NzuD3pRIAjFTqJ9acR6bt/h5GFh+WRMHwceCYPE1WAAGbsFKIXjAcy8Ru8MDMSwwWudUhnFIAbnML0h3qQAA5h4iwBtA2iQ/swyBy1WUpGzl8AMwkuMU54pzA074Z8hZxk5vNaAsYPgttsdtBdieDhZYpYrf0T5FB9GzrHgVvSqNIdd51JckE0JC4dzTfdfiPb9GDbTZoCLUES3iCIAGEOH4HJGECKI0FrZgwAvWsiAgdgoAfaFEzA8dJyQBEZ0xPB0Mw40shXJAYQ3Ml4yeQkIL3AgDwZWCsDueCyD4XDogIojKKxaix1fOjYU/JiPGkhh8S+LigM3BNE3A95U0EulD2obMQFzcSBkk5U8NkjB5KQRNWkTWj310vZ1JATTlwJadYx4rdWgEr4hOgizjxAQinK9R8XNaBi1jfQNXLUuc800gARGAK2YLpWC09iAu4kCnkMsL00imhotzfM7AvKVJGFfkTHiAASGBWFrAAJaQAFkABkAFE1jbaJnMQRM4WDFKVMA7y5y61h/K+BigvK5YqqgzMotEhrC14MaYAmtAyz8OAhvYTpa2ygB5AaQRyKJrs6JwXDcPAvB8UgYGYKAqgiVgQgAKlBgADQF/DetAIfB3hTxwRreAgCteE2HwTrO3gzkefL+B8ctkjOERmF4DgSF4B6nogF6wFh0JWDWB4+jAXg/qy1Rom7DGFWhsnCi7AAjLoaFR9HMbkca8PiYF8BugRCL5qJeGFnwulUKAMYgXhLEI9gsEK5hxalgWKZu87zHMZABuygA5XgACU8rIKJCamRhTWKMphm6s9SHiSwIAAL3YZnmFQ/YSk+uASgAdRgYWSgAQTUABJEpsbwkoBdh7gppmpT5vfF8lu/PPLbW+iyt4lzVx2iK9tq2D4MIKA+Bp57Xst+JalxGBGFqembzvFIKF4CtbEJgB+WthbqNZCO4efF/+sAPtlb6FXBiH+5LRhuHh0G9YGduJZV6nHu7hnLdx6IyAJ37TozMn2boS3eeH1WK00SxL44J0XghFtZ/W6KQMAIh8qsFUHLdOksFTf3Zi4eAYAADkMRaB3yaGgsmUBYDaxAZfCsXQwCswiBzAYXQIEiFvF0Us1swC2wds7V2f0yEwE9t7c0vtcKsADkHUO4chBRxSDHWUCck6pwziULudMe6dBKPvNYBd4pUVHB5KcGVvzKL/BxRAG1gJ1yJA3WY85oDhSsDYSUwApS8BeJPP+vA0EAAFOg9D6PBZgloaiL1tC0VoaC+xgHMObYsaxtQ8jsfWdmvB5hoHYPwUIlZqyCjrM2X8tY0HhJgGg+xwSGyozABhRJ2FNJ8BiU2ey0R4hZRINEXK+VCpoEPsEqpmwbqdW6hdYQsM+7ITWIwNBN0qjknYCQNB3A2n2P7E4LxSBQCxEgWzPAlQQAvBeEAA==="}
import { Base } from '@studiometa/js-toolkit-v4';

class Toggle extends Base {
  static config = { name: 'Toggle' };

  onClick(event) {
    event.preventDefault();
    this.$el.classList.toggle('is-active');
  }
}
```

## Refs

See [Refs](/guide/introduction/managing-refs.html#event-handlers). The payload's `target` is the ref element the handler matched, not `event.target`, and `index` is its position in a list ref.

## `$emit()` — a native event

`$emit(name, payload?)` dispatches a bubbling, cancelable `CustomEvent`. `detail` **is** the payload:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"46cb02b072153e9be8797d9afaf768e337b5cd302aef6cfcd1b1321dc66a798e","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8niCYS8AAinFYEBSTnmi0QAFYAOyrdabJAANl2CwODA8oLYEKc2S+ACZrrdSPdHmi3h8cHgfmQ/vQmGxODxfEDjjI5PQ4soDJptLw9MdDNozBZwnYHCdnK53J5vOz/HIgiF+GEbJFotyFAkkql0plsnkqAUinBShVqrV6o1mm0Ot1ev1BsNRuNJjM5ntsfCSVlkVtEDtqJjDh5jgSzsTSXcHgzEESAIzU6ifOnEBm7f4eRhYAVkTB8XHglLxdVgABm7BSiF4wHMvCbvDAzEsMDrnVIZxSAG5zC8oT6kAAOEdIsAbIPo0P7cMgCvVyGnc6IADMsfJ8aer3eadp30z5GzTNz+a0hYwfFb7c7aG7k6HC2xSxWAcnKODGLn2PAbZlhJIBuC5khSCZEhcqaYAeBBHoyv6MO2mzQMWYIQvEF5gIw3B1kQEDsFAT4wkmEETlO2zflieCYVGq6wpuYFPESUHpoevwnghSGEFAfCciKAomPEAAkMCWE0kimCAmGScYjCBFEaB1pJ0mULwWDMBg4LMFAAD8uH4VAvAAD68BAABG5QwA8xm8F0igwNWkQ8XWADCXSdGEACiJDRJIeEETZ5mWQ8xhOC4bh4KCcDqWgNy8MwvBmV0ZlmdkKQUAIzBgPwMBCKlPjydqADuTT4Lwmw+OpmkQNp8UiAABrAyTsKw9WJBiaRIBkICkAMXSkGACBUF4Pi9NFzCxd4hmFWg8S8C53j8DkvCNQ5zBdKwaAaDNMBQPVvCVrYmXZblQhoH0YCJF6IDQtiSZLDOawfkG9GzlRHgiWJDArl8iIgXGlLPCxMH0se1A5iAiEDNxqF4mWKQQLUjBnLAtB1llV76QRRHYsm47vuRX5vfOCO1LRXxJlc/1boDzF7tBXywex4OnpD6nkkhZB8CjdDo2AGA40gRJEsBT2E69ezvSAPO0OTSCUwx25IPCwOM6D8FMFxKHSpI/FGMYwmieJkmkxAMlyT5im8CbiNm6pVVabpWOGSZQVWfYJl2bAjm7Th83ubUljeQpfkGYFFnu6FVDhfKUUxXFCVJSlaUZfwWU5XlawqgpvAlZs5WKg7NWGVwK1NcwLVtfqnUoJkvXdANQ0KqN7DjZNu3Z9Ec0LVZy2rZW62bdtlu7fth2kMdGdnRdV2zDdw6Jks+Ni5+Ethr+n1NHLiAkYrgO7jSatwRxTDnjgdhXrwMt8wL3rPkBSYhivL2UfOMvb7v1OMULsIvHP6qwDwFYGwUpgDSl4C8A6mhLC8AAOQAAFOg9D6EhZgVoah1AaE0ForRYH9jAOYQEyoSwQh1LycBDYwBNnmOdfgoQqw1iFPWFs/46ywJISkWBED8GNlMjgLCfBKHNl4GUXgAA5CAakNKOzrKtZqrUr4iAqmpM648YFEDYF0Hw9UwAbVavEXhTZNit0Nl9RgsDMKwO4PgpsLxzC8NNsjeytBBGGJESUXgAB5SIfDzoRDYKZCODwMpZUMnIiuCjW4FwmoE4Ks03HGLgKYpo5jTawIymAmWEDrG8LsWAQcVBUFIFALEQaF08CVBAC8F4QA"}
import { Base } from '@studiometa/js-toolkit-v4';

class Dialog extends Base {
  static config = { name: 'Dialog' };

  open() {
    // No payload: `detail` is the platform value `null`.
    this.$emit('open');
  }

  goto(index) {
    // One optional object, and `detail` is that object.
    this.$emit('goto', { index });
  }
}
```

- It **bubbles**, so any ancestor hears it — a component, or a plain `addEventListener`.
- It is **cancelable**, and `$emit()` returns the event, so the emitter can read `event.defaultPrevented`.
- The payload is **one object**, or nothing. A value that is not an object is refused by the type and reported at runtime as `event.invalid-emit-payload`. The event still dispatches.

Nothing in the framework is gated on cancellation. It is a channel for component code.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b5fe681a5e12cdfdd249a26584df851a8d4d908e6322a30ac52a296f88f90861","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

class Dialog extends Base {
  static config = { name: 'Dialog' };

  close() {
    const event = this.$emit('close');
    if (event.defaultPrevented) return;
    this.$el.removeAttribute('data-option-open');
  }
}
```

### Typing the events a component emits

`$emits` in the props type maps each name to its payload object, or to `void` for an event with no payload:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"61c9ca14d92485a08d1102fa267af2ef1ef742dc2da3c15543ae063ca2b54c96","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

class Slider extends Base<{
  $emits: {
    goto: { index: number };
    stop: void;
  };
}> {
  static config = { name: 'Slider' };

  mounted() {
    this.$emit('goto', { index: 2 });
    this.$emit('stop');
  }
}
```

`$emits` replaces the runtime `config.emits` of v3. Nothing of it stays in the bundle.

## Child events {#child-events}

A parent hears a child through `on<Child><Event>`, resolved against the names in `config.components`:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"3588aaa4fad252aeddb08f4ea9f3f0172b5480fec7addc68e58f5e201b329ee2","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XhnR4AM3uPgAIjA1ilmDQoABREjRGRyehxZQSXh6Y6SY6GbTGCi8ADSGIUSl4nVIZxSuJpaDpYBSZgs4TsvBhcIRMGRqIYVBcbjwAGF8OxWFA5ILeFhmBhWBBmFB4rwAAYKpUqqAakEiTY+LpgG7MVn82VReywZJS0mYHAysGaSy8I0CSXSgDkIg1ABIYJYmnANYk5nsGIgAExXLLrTZIACMO2oCwOUZAPJg8MRKOtTmyXzjZtI90eSFjbw+ODwPzIf3oeEEwl4AEF+PxbL0IgBJGiWJzzRaIADsAA5VgmtogkwBmXbpw4eDtd0g9sD9oOFs5faPXW5lh4NxAANmr1E+deIDd2/w8LA4XD4Lf8DiksliimxqiJunff7slYNhcscTgiu4njeL4raBGQIRduEkTRJSWLhmmaRIBkWRnHkVAFEUcClBU1S1PUjTNG0HTdD2lgDMwQyBKM4yTDMEYLFGSYXHGaysomiCpnsGZHBIO7nDGB53MeTzRuOF6Ol8BA3uQd5Ng+WCaDgdgYHwgbBmgRG8MA5i8KZvBaFEiBGSZZm2d47ApAUVlgF0lgAEZkAA3DZpkvN5YAvEOkbJhco5TnxM6nou+zLiAekhmJe6SUeFaIHOACs8lXt8ymNpmjAaRZ2l8BZYBWcZYB2TADlObwLnuV55iBexI5JkmYXxhF2zRcJHilYllbJeWJ6tJl7yXrWOW/Kp+WFVpmB8PZjloM5rkeSpIDDpx0bpeFGyRT1sVLQUA0SSApbDU86Vzllk1KdN1D3iABWaWQC3tp23Z9JuA7xF2YBgg55U+XVzB0VZtL0v5zWbcFs7pZOnX7UgUVpjFmb/YDKSnQu52Hpdyy3Yp9YbTQanPXNb06aD4NMiy2MtZxp4rEj/GCUumZgGDJw4eJuMXdJlYXET14PWT+V0Zs0B8KuX19r9ERihw/A5Iw3BWUQEDsFAQUccmSwdbxyNjodmaK8reG818u141JqXRiLU23o95OMJLhBQHw+LALw8UGeV5k4GVRm8MdK11WtXm8H50eedHxjxH7kimCApUp8YjBwdEVkp2nlDyoqyqqsDlVmWHq0NaQ0Pq7wYpdJ0YT5miFVVTV4f1et0PGOBriQVC7BwAqaA3LwzC8G5XRuW52QpKS/DmvwsLMNPPhZ/YADuTT4O60HakXMpcJqtrMFKYZJKk6SZKQAxdKQYAIFQXg+L0g8Ijclpr+qEowCrR8wBCXRWBoA0Gvfk+owS2AEAvWEQg0DfUSGxWGesYxJkRkbfiNshKxT9qdVGAtUqvHGgpUWztxZMEpsVUO1VloV3WrrEc0Y5ypnQQdNGvUCDUJOqccSeD8aCxjGNGsxNcozXIa9Sh3tfZBhDAHUqAdy4R0rnHGOKiE6BlYFZAAEtIAAsgAGSRGsOi0R6FRmjK0Q204kC4ywZmdRuChr8LnHJIh2V7qkKei9Iq71DFBmtB0fgmhWCsE0Zw9ukcNoQTwE/XgAAqWJGo4CBPqCEsJGp4m8GvqqKoERWAhAoZgcyYId4+F8cY+woIyAQkXgaUevA6JcFvn4lCEBikejDkU0elVYTNLQL6UI0RrSkjOIIHo9IBkKHsJAewRAB7sBXuZSqHoknXyiLwKAXQfC1HMkEMEyp17xHMOYZAOioQADleAACV/5kCiIvKYjACLFDKMMWERV4iWAgAALylEIeItgUglAgiUAA6jANyJQ2xqF7CUMp1oSgrJSaEtu3BTGVnSkmPa/Ekz7jYbFRFwTkXLQcbbFKI0HauLuiTPKzY/AiFluub6aKYzjkxazGcLNbF4AZRuU6XFHGpXPJS4RYtPGAmfDBN8+JPyYm/ABTS/5CQKqApyewYFhS92idBV8AQggITCDYZCMRZUJHPphFAmRsiWyeURMolQah1AaE0Fo7ROhjP6IMYYzEJjTFmEghhSwWYsO6nizM6qrYhQFSecxjt3Gk08QU6mPL4GYyBtZUupkua00hqyfytlEKGutIZFutkzLJvlkGKyClWkfTXBuLclg81mT8k1Zlc4kw22DWeU2zYIhYz5Wy/BJ5CFCJIfG12ia+BZpgBDZk9I21zh4lYgSPaPDTr5biodTxWixupaI9S4j3oFoiEWkutly0/Ure6T4NaL0Nuhm266WKZz8tDb2pCRa+X8z4alHdwqx00oPd4pNn1GUVssFWm9xS70DjbaeSxXVZw2I5ty0D9bYPcK+POKNTxUG7pES7CWAwPYyzQ/AiIMGgwAHkg6MB9rY0ke9dTRystmXM/Im5oEkJRywpJc5B3TjXTW2s21LFxV2pMnKUN9TADxmjUQ+W8LttG/DoqJ13ElmQPgtirI8eZa0FMz6UarrfZh5MSmyUyT/aOp247ZoaYGFpguOpi7ptbjQxRndW2M22NGcTy6Opco8Ex1UimcPWIpTZuNgHnriuBJU0g1ToQ9PYwKa06IvzUmOIyfESqjAknJKhOVOaGR6BKyqkC9g2N8jSyYjVooPASilDKNezn97qi1IXXU+oB4lN4CaM0FoWtymPvaa9TpeAujCH1m4zX+kBmkQZM+PmBJzlxhJ9m6M8DVbzIKMLpKCardUx48mOra1y0vYOFbrRWhoOXdht9K4yPgf21upACNjt2bwEQBYAy4D1BnbXCI/21j6YnEZk2j3zrA4B3yjqb2BKfZi27Yj0sgf3wB/EZUKRGDxDx1ABEzArLmgwMgKYQmtY63q5BGJ8SNT/RBzALHEAcfcHSbEpkCJ2D8HqajmUEAuhFEFyIMedF/CpC2RAGbMO1iHLAMc05FzrlgluaaGADybXEVecqLSHzvm/IYgCoFvdQXgshdCkoDOAclGxwAfXmHA/gqLrvjlRl25DW2PDY7h+F2ckWJoipO/ZssmnSDaY5rp57l39NLHW8u1GQXTMRtnPDn9J5JNI/3RTQ91NJF+2LYHSyIcFEdyjio5Rajtazvpj3BrIAACqFgACOmzSTzAWWceYauQQykYBqSQYoDUnuiGc7mxgqiSFUC3u5MBjAam4HL8wABxKIZAauLJqRs+mf3mRdAeN9Sbro+vXxByQGUx6jU0yZ7wfs5h5gYBEAN24Q3R7JLfCaT5Jp7DmhlNfT/KF+AMBBB4A28pcx4L9rQoFKp64YBzAmhJtIEtI4AB5Jl2xLlew2xMkl44FgdJRtBeBN4pZBdPRzQUhxkPQoQqMdEe8QQDJYQwR0Itp3tuIIcPd2F/QRMzMU9fdowhUos91CNyEHNHg+AQsoAz0y4wlaFGoApmUMUENjZAtpMQAxCfcDt+FWgbp/1bNkdJ0qE25pCNomDEB0odoIcE9lCw41CEcMUXg/UuxYA8BgJbB7AfZjgHRPhuQUsatONo5D9ptvQAABN1WieiEiB1ciZ1Nob0fycwM7HjIrLLCQSQH2fPWRIOeRKQzzMgPwl4eONzTnR3AZLGRkH2adKyb0Hjb0WOI5Uuc2bnVWPgEtUyTYAeRORbRgb0Uqb0UkH2BRVouAdo1gAJIJVJNuaObgJtF4JqWo+IqPRIn8HwEtB3bnYohyUokGco3gSoqPHokGCA6IAvBIt4GyFteXOo2TKPBteTMAOjd0DmRjLrVUFjLw3kXbdLHjUkLooOb0YwJo/YmXJnbHPvf0YAWxRObWPI0qS0bZUEsQ+IMOF4LAWgefKY7zEASWZgJAUAL8ZAiIPAAyEAF4F4IAA=="}
import { Base, type DelegatedEvent } from '@studiometa/js-toolkit-v4';

class AccordionItem extends Base<{ $emits: { open: { height: number } } }> {
  static config = { name: 'AccordionItem' };

  onClick() {
    this.$emit('open', { height: this.$el.scrollHeight });
  }
}

class Accordion extends Base {
  static config = {
    name: 'Accordion',
    components: { AccordionItem },
  };

  onAccordionItemOpen({ target, payload }: DelegatedEvent<AccordionItem, 'open'>) {
    console.log(`${target.$id} opened to ${payload.height}px`);
  }
}
```

How it works:

- **One listener per event type** on the parent's root element.
- The handler walks from `event.target` up to `this.$el`, reads the instance map of each element, and calls `on<Name><Event>` for the **first mounted instance** that matches.
- A child inserted later needs no new binding.
- Events that do not bubble, `mouseenter` and `mouseleave` included, are delegated from the **capture** phase.

::: warning `config.components` is what disambiguates the name
A method name alone is ambiguous: `onSliderDragStart` is `SliderDrag` + `start`, or `Slider` + `drag-start`. The name set from `config.components` is what decides. A child that is not declared there is not resolved.
:::

A lazy child works the same way — the string key is the name, so nothing is downloaded to resolve a handler:

```js
static config = {
  name: 'Accordion',
  components: { AccordionItem: () => import('./AccordionItem.js') },
};
```

## Global handlers

```js twoslash
// @twoslash-cache: {"v":1,"hash":"b059098e1d88d353bf17e49b175ec8839363d0e60042c1e57dac18d90f1c374b","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

class ClickOutside extends Base {
  static config = { name: 'ClickOutside' };

  onDocumentClick({ event }) {
    if (!event.composedPath().includes(this.$el)) {
      this.$emit('click-outside', { event });
    }
  }

  onWindowResize() {
    this.$el.removeAttribute('data-option-open');
  }
}
```

- **Scope: the mount cycle.** `$unmount()` removes the listener and a new mount binds it again.
- **Phase: bubble, always.** `onDocumentClick` hears what `document.addEventListener('click', …)` hears. To hear a descendant's non-bubbling event, use `on<Ref><Event>`.
- **The two prefixes are reserved**, and they match before children and refs. `onWindowResize` binds to `window` even in a component whose `config.components` holds a `Window`. To reach a child with that name, use `@on('Window', 'resize')`.
- The rule is about method names only. `onClick` and `onDocumentClick` are different names and both can exist; a click on the element fires both.
- The payload is `{ event, target }`, where `target` is the global the handler names. There is no `payload` and no `index`.

## `$on()` and `$off()`

For an event whose name is data rather than a method name, listen by hand and return the cleanup:

```js
import { Base } from '@studiometa/js-toolkit';

class Watcher extends Base {
  static config = { name: 'Watcher', options: { events: Array } };

  mounted() {
    // `$on()` returns its own remover.
    return this.$options.events.map((type) => this.$on(type, () => console.log(type)));
  }
}
```

## Negotiated events

Two helpers let a component announce a step **before** it happens so an ancestor can take part. They are not `Base` methods and they are absent from `$emits`:

| mode          | asks for   | registers with | keeps                 | on failure                     |
| ------------- | ---------- | -------------- | --------------------- | ------------------------------ |
| **take over** | the action | `wrap(runner)` | one runner, last wins | the mutation is applied anyway |
| **delay**     | the moment | `waitUntil(x)` | many, all are awaited | the step happens anyway        |

```js
import { Base, EVENTS, domUpdate, emitExtendable, viewTransition } from '@studiometa/js-toolkit';

class Panel extends Base {
  static config = { name: 'Panel' };

  // Take over: the code that mutates announces instead of mutating.
  async render(fragment) {
    await domUpdate(this.$el, () => this.$el.replaceChildren(fragment));
  }

  // Delay: the choreography announces its step and waits.
  async close() {
    await emitExtendable(this.$el, 'close');
    this.$el.removeAttribute('data-option-open');
  }

  mounted() {
    return [
      this.$on(EVENTS.dom.update, (event) => event.detail.wrap(viewTransition)),
      this.$on('close', (event) => event.detail.waitUntil(this.leave())),
    ];
  }

  leave() {
    return Promise.resolve();
  }
}
```

- **`defaultPrevented` is ignored.** The step is announced, not proposed.
- **A registration is valid only while the event dispatches.** A listener that keeps the function and calls it later is warned (`protocol.late-registration`) and ignored.
- **The work of the emitter always completes.** A runner that throws, rejects, or never calls `apply` loses the animation, never the change.
- **An unclaimed `domUpdate()` is synchronous.** With no listener the mutation runs before the returned promise exists.

See [`domUpdate()`](/api/dom/domUpdate.html) and [`emitExtendable()`](/api/dom/emitExtendable.html).

## Framework events

`EVENTS` is a deeply frozen object of the events the framework itself dispatches, all namespaced `js-toolkit:`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4be32aa2e4c3d8ac70df162e8372131735d9b395308826383b062c104e476e39","data":"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"}
import { EVENTS } from '@studiometa/js-toolkit-v4';

EVENTS.component.mounted; // 'js-toolkit:component:mounted'
EVENTS.component.unmounted; // 'js-toolkit:component:unmounted'
EVENTS.dom.update; // 'js-toolkit:dom:update'
EVENTS.diagnostic; // 'js-toolkit:diagnostic'
```

Component events are typed lower-kebab string literals declared through `$emits`. Private framework transports — the context request, for one — use module-local constants and are deliberately **not** in `EVENTS`.
