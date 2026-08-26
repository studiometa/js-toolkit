# TypeScript

`Base` takes an optional props type. It types `$refs` and `$options`, and it checks the event names and payloads of `$emit()`.

[[toc]]

## The props type

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"b6da5331dea909e6f6a8cec05fb8b4369448e06ea5eec942a7803cc67b0135ff","data":"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"}
import { Base } from '@studiometa/js-toolkit';

class Slider extends Base<{
  $el: HTMLDivElement;
  $refs: {
    next: HTMLButtonElement;
    items: HTMLElement[];
  };
  $options: {
    speed: number;
    loop: boolean;
  };
  $emits: {
    goto: { index: number };
    stop: void;
  };
}> {
  static config = {
    name: 'Slider',
    refs: ['next', 'items[]'],
    options: {
      speed: { type: Number, default: 1 },
      loop: { type: Boolean, default: true },
    },
  };

  mounted() {
    this.$refs.next.disabled = true;
    this.$refs.items[0];
    this.$options.speed;
    this.$emit('goto', { index: 1 });
    this.$emit('stop');
  }
}
```

Four keys, all optional:

| Key        | Types                                                     |
| ---------- | --------------------------------------------------------- |
| `$el`      | the root element                                          |
| `$refs`    | each declared ref — an array for a list ref               |
| `$options` | each declared option                                      |
| `$emits`   | each event name to its payload object, or `void` for none |

`$emits` replaces the runtime `config.emits` of v3. **Nothing of it stays in the bundle.**

## Extending a component

A component can take a props parameter of its own. This is how one component extends another:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"9358b40c4cd1b4376b370eae5f20c8d9814239963ddd8c49887c36fe26ebc010","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XhnR4AM3uPmOAGEImD2ClzFYbHYHDBYWB4SknPNFogAExXLLrTZIACMRL2BwYHhhcIRTmyXyJNzuDzISEJbw+ODwPw5u3+HhYHC4fFBZAh/ChBk02iR4VRx0M2icLjceGknyqaxIrF4sDg/FI7CwaD6YF4EDBvGYoXCkWiAHIRFgugAjDj8XhwLqkKUweLmcwAAwAJDBWCHeGAFpoAO4iTY+TQQGJrSxRNDxXjhmCWJpwaOWMYBEjRGPMTNJiC8LDMDCsCDMKBW93lGAPOAUK2kXNECDsKDRsG2OTltAieNNQhdez1xvNhK8AAinaEpGY5oiIhcMbTvCIgKgW58JdIOS6WFt9lIXWiVkDOL2NIAzAB2VYkrbPXYLalHLKRiMmczLXLcm7sk8H7ctQnx8sQArUEKIASv6kK8AAgg8FoqggcwvssZJfmAGw/mSxHUP+hweNh25gHhIHnAS4Fso85IXLBmC8t8iHkIK9AAqKwJoQGaJ4QqKL2Mqcr4c4rjuJ42q6pGBrwMapr0VaNp2vwYQ2I6aAunWHpej6foBkGYChhGUaVqQCZJt4vCpum+ZZjmeYFpOxaluOWaVtWvC1HWDZNi2bYdl2PZjiGA5DiOY6BFmU4zhAc6hYuLZwDma6CHc9G7rWkD2EeHAnjQvDnpe15bi597mpmiQEQsNIUZRaykaSv5UfsNEgDJwGnMx+KsZB7GIK+nHvHBPEEHxfyCcKWBymQmB8HRuGyfEYZaIViC8MA5i8CdwXUWgB2dCapEANzmC8aoKXgIYQO2nZoNG9zSmaIixpmrZ7RaILRJKkKpZs6W3jAACOXTsNdKS2paZywLQPoIrG3SkE+LV4mS+IAKwkWRSAABx/n1NIgLtZoWnJTJIK+Y33BN+JcfBvG/AJVOMCtWhrRgfBUgMl1oAjz6teSH7E91ABsFMAR4wsMMNXxMyArLjRyiBkq07Nzfy/HIUtGt+CIm0RDIcj0HEyhAdovB6IN2jGBLeOyzsxJdT+8u9YrIAW2ATFfL7mss9rsv61881c8bPPcT49abpmjx8LIZxYThluyLEih26oeGO+Jsmu7jbXvh137kgr/XSMHSChxB4dPGSr5Rwhsc0CbIpAuKIPodKxdGJJtjSfbcnqopWo4DqyX6oaGm0xE2m2vaBlZsZbqeuw3q+gPgbBmAeZ2bGDkQImwXOa5cgZh5uYRt5RZVX5yUVn98DBbWC7hQDb3Rb2/ZBzDl4KOPsr9Jy8GnBDDK38lw5VXOuAqdMDTFQPGVIcp5n4XivDeeqD4mpuzaqTSu3tlg1yps7emoEG7MygpyNuM0E4dyQl3HmgIxTA3BBhShI8lTj0ehqDw08YCzz1GpI0Jol6WmtKvPSDoN6ulMjvcy+8rI2UjNGU+jlL4pjqG5TM0RPIP0LL5B24DAofxCrAiKr0oqThin2OKQDEpgInODWc84wpwNyogzchUUH7lKseTB1UcF1TvPgnGIBcRtSWOrTqJMerK0AgXWS9dECNzYtrV8BN26cxYShHuHD8r+DRFbXOSgh4OyduPMwFhFRj0cFQSempnIlLLGQEIcj14VgqTlJIqR0iZGyHkKgBQihwFKBUaotR6iNGaG0Do3Rej9EGMMUY4xJgzDLpyfGMsfye2SbSCQ6TMlayeATPWjCOYxwKSbUSGFA6MR2QSMkn4vaJIouQvATy0mqxoRrJudDEAE1eNcg2C1uZMATqFZOAwyBp2Bpnei5SbZ5yqboDFpdomEQJK+EhnzvlCNObQia74GE8mjobRaPM+Y4DsILZFFpUUKEqZQoulDjDxD0piBEB06S8uxC8/FnsElyyJRrekQqsjUMQOTQFWSnhgspcwo2rChK904aDQeAqsS8MaeiKVhDGb4lGh87qFIJW6oZP8uVpLtZvLybctVhS6UCz4NalI8R36i3FsK1oBLuqHPOngd+6SVgKvOdsJ11KoXLVWgyj1EgMRYniIDHcAB+A6AAlTstgoCSCumcFIPYADyUi1zwgsPRYwvAAA+vB7ywCrTAKAxrJqy0DT+d5RyQDprAFQ5ilrI3N2jeCqlkK45MDdYms6lMDoAGUxbFoxFdLoDxbDto/GasVPsJXJNtcOsOwKyS5PHaqmleAjx9iXQjRdy7SKrrFuu2oRsWm0VYE2C+JYLBuiEFpZgigQG2BLIUYtK9WE+gfWkJGrZYCPALJjIGgHWxNn4FuIGMjfTuiLaRdxGdcNpGajiyWk1SZEl3QC3tt7i3pKPUC1mFLZoTs7oUlOhAoAbSzmAFltsMUctqfESw6UQZQEYNwA68U23NKeh4AAMuwMEnYMCCB8IQCAOQeyZkA/YEK7ofB8RNFAWAYAcwAFkGwuQGH6S0uk1iAZwWCe83HzCMDHIB20DlLMyOTJYIWtxbz3hEMvZMMZ5D33vMJhq4noyABQCH0GAwDelsOYLgiX+CIEPqdW0cB0tVREzQMTfAjqWmy6EAd9g4AYzYEXZg8ZmBNEvuwHKYYzh2MYAu/oGJWHcDuqV7L2MsaWiqykWMrAOgegkewfTjBGBlS6DAPgOha3AF4IAMgJeAvF68dU6LxD6YTXhEAKFTwN2gLLQDOg2bNTgCyCGIaLKlsAiIjKB+A7twHMOfMAPYM6AZCJEToxbMvWX6/lhqrbxOHR2wN6zpBLTIF9PSoTBWIfcB7JD5bh11ubamH17LD1hVLHlZRxAPaQ0eCi6Juj6tj2sxjZO9V8b+azuOJIX5RheAADJeDSC5TTfavBc0tgiKwDAkhy2FTZ9xwu3PefYvfSAIXUAqgi5CEQdgMB4xWiCDow7hljIhgqswFXUiqgACpPqFBNO6Oc8ADoef7UiEQHmzhujQD2SIOu7SdFsAfEHIYbfsFYFACXdMYtqRbR04IdYE2YEgTOVe1JHiwf3D6AYjwexwAgOYUL82fDNbUiaEgrYwSaEsLrlcpazMp9zxr+MUkrSWhgPcN7X14DO8UOYEq+BwMF+Sn2eMJpChRGBjmTC/gMbgZCkdy+2i7QhmEQAUTPqQEMmezjSlS/lqAXQ1gghEEWh4oRYA3V1zCuADYnI+Av5mJrpFbTeBsTaULmwExqLAAd7pR2Kzxh7zcKqXQnQAgtwpEPgdoeed2VmEUOQMAMADsdoK07AR4lU8IkYUA5gqgraraICZeuu/aOYpakQkCf+b22mA6FeVen8wBgGBwkCQ+li3gqWVu02tuPYv+O8b2BeoWN+1+yQNABiumzkoS14JYMBOUh8XgPgPKa6G6fYXBzkM+WAQgg8jWBeqg2Y7aAaEaJO8qva/OdMdGnstO2syqzGF6caIAvMsejKysB0oeO4Uu9EMuPOxgyApgfsAw7hUwmh+IxOVcGS+6Iah6RhDGDqpM9OrGJs7SvAC6zASmgcmhoK+yHEEqsR8R3GdG8qxhTwkc56+SLqURZsTK2c1srK+c6gskAmqSRg2KMS2w74fhpCARHhVMCRh6WRoRTwhMERdytK1hfA+hO4B0JW2WPK8IpAlgB07odQ9mYAfWBOJGeIrQpM7yOhEqgxA6mR9q0EVyKq+Rl6TO9K605W4xkxvA0x9QzeQcLyrQSw2h/hZOlMeAYx8MlgWxI6wKrQuRexzqBxlhM6xxaRMAgc3KUqwx0OFivqxaeOp0/akyUOoOox9IEx/KMxVxT6d4shMJJ0Lw8x7aBMr4O6/hvsvaLx0qDMOsEa2RywPRBRfRzOxxPqUGfqixNIlyqx/hwaTxHgYatqhI2xY6PxsaU6hx7qVoUi8JIxp0LxKJYgaJgGGJL6tgeJLyBMFcyRpOEqcJ6S+IlE1JiAuxZh+xFhVhDJjKMpZxog8pYAipsh+JpMRJTRjx/sFpOpepnR5IZ6QpDOKE16cplxgGqJAZNpO4z6dpqpSwXaSAzp/UVpwZbpApBIhpTCxpIplh7G0AfAQJIJlOhW4mkmQCAiikCmSm/AKme+6mmmVUVxumtY+m2uZARmJm5mlmV2cOsisxjmzm9Erm7mtmXmIQPm3gfml84SQWjeuukQ9AEWYAuZ4e8WuWSWvYqWi5GWWWp0aWS5uZqOCJZW5WQBI2Y2tW9WjWmwzWO0bW70HWXWEQPW2Jp0bZw21W422GU2M2c2bAC2S2K22OW295e2IOn++k3+92rKp2VU7AF2loj5N2dUjWfStoTY9+r272n28Y32SKf2YWgOpEwOEJ25RWu5ZWj5vACOV4ZAyO4ORW6O35WOG2LwuOEJCxdRGSw6JOMZVMBFOpIRiqnItJfxppRxjKrO7ODs3Oq2GxkpJxrxUx1pp+uJm2fOcJOazeLgYAou4uEpjhW0HO4lEJkl4JiJ0pyJZxFxsx/58xxg8usmiuqlKu6laudeDZfYoWX++uIghuW4xu/a5uluy6NuNA8JDuUiTuSMwMbuHu/eq8Pu2M7+AecMwe9hA64ezaoEUeIQAJIQKFdoSeZAKekAaew+pAme2e0QzkEBBesARe2BpeYQFB1eKGuu6umuDey8ze/+bepSKGXeaYPe9+feOug+TQCgo+WEE+o2U+tYM+r+58zuuYS+K+a+6MSWMAW+wmO+e+ahy6R+ekJ+Z+nwPol+uuPBd+iMzAj+AMz+zkM18Y7+QF8iP+JBABQBrIoBq8FVUM0BsB8BMeSBmCqBweGBsBsAJeuBoW+BvAhBPg7B/+ZBV+q4lBIUr1tBQ1gVOiTB/lrBxBHB++x1VYvBp4Ahuuwhz8Yh7+kh+5YZr6uN4NRBShGEqhB+AwxGLFss+KGpuh5O1M2pfJRMHxE0phKZvxJpmVQs50UJpE7aHsFGxJgRTxvNiZZI4ReRwtaZglYpIl0ulR4lvABlWOFpslwZ8l8lSlEpKlwuDlmlkuolIgeloOetUpe5Bt5xclTFll1lgitlLY9louh4TlfEuublCiuYRuJu9EvlN4mNgV9u0iIVFgHe4Vc4kVXuUGvucVgeiVEpKVMAke/k0emV8emwie6eeVjVBV6hGePopVuen5+eu4ZASBNVYNzkleDVQGteLVo8E57Vre/A0oXVneYA3eveUedBw1I+ZwY+41Fg9+0+RBN1c1C+nwy+mgq+6+K1a10Au+ddzJO89gu1MAp+L+B1F+GA8NJ1Z59+51qlEG11+Ab++2euAUMNpBgB+9IBtB4BtdkB2MX1cBc1iByBPgAN6BA6wNTddV4NUiBBRBL91ZgG8NrdVByN0N9BV+GN1uWNcD8h1++NUGhNAUoWJNoh8A5NbSoZmJ1NODjeicyh+e9gahzNUt5KHN6xPNMqI0Zyo6zw/FIt/R0lspZlVxUtDpGpHFzxJlOpXDJ64RswkqsAeAyIXdq2xwPYMKnqajB17KLwOBdVToAAAp0D0H0CnMwNMjUDMfMk6H1kiP3GJDbaUXxuylKQ7XOtSBLYjLifdIfNEYHLxuiuyjUtUS7I4wExINpREM4bzkRWUFhEPWmKeFACVdFR6NEQXqXrAVQbAPlNjKvL0GCEptjBWGSVZCdPMOaN6GSfysmlKkXI7ZCbwE6IHE6BQBCcpVjrYTEdBptq06Vl4yDidARZDvU2eS1nCfEMrKfrE4RjtgBQBeYNEdmdxqE5Un4xJe06ts7UIx5joy8CtjtuU8omSXUxCUyU6Es/RC0202bfrSZUGbMT07MzY6VkM8VhCaMztOM5M7wNM+aJ+rvaRO8z3mMxKaCbyhMVMyUC7cGbM/dE4KY0gKALnFVhEHgJOCAC8C8EAA==="}
import { Base, type BaseConfig, type BaseProps } from '@studiometa/js-toolkit';

interface ActionProps extends BaseProps {
  $options: { target: string };
}

class Action<T extends BaseProps = BaseProps> extends Base<ActionProps & T> {
  // Annotated, so a subclass is free to declare a different config.
  static config: BaseConfig = {
    name: 'Action',
    options: { target: String },
  };

  mounted() {
    this.$options.target; // string
  }
}

class SafeAction extends Action<{ $options: { confirm: boolean } }> {
  static config = {
    name: 'SafeAction',
    options: { confirm: Boolean },
  };

  mounted() {
    this.$options.target; // still string
    this.$options.confirm; // boolean
  }
}
```

Each prop is read as an intersection with its default, such as `T['$options'] & Record<string, unknown>`.

::: warning The price of the intersection
An option or a ref a component does **not** declare reads as `unknown`, or as `HTMLElement | HTMLElement[]`, rather than as an error. Declared props keep their exact types. This is the cost of making extension work, and it was chosen deliberately over a conditional type.
:::

`$options` is read through the same intersection and then mapped to `Readonly<…>`, which has one price of its own: a mapped type over a props parameter is deferred, so inside a class **generic in its props** a declared option is a usable value of its declared type rather than a type identical to it. Reading it, passing it and annotating it all work; asserting its identity, or assigning one option to a variable inferred from another, needs an annotation.

`src/props.spec.ts` holds the assertions, and `npm run lint:types` enforces them.

## Handler payloads

A method named by convention is **not typed by convention** — the name is resolved at runtime. Annotate the payload:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"954002eef554ab13095d2b2966f99b600a006c3ebcec15f566691bec202b83ce","data":"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="}
import { Base, type DelegatedEvent, type GlobalEvent, type RefEvent } from '@studiometa/js-toolkit';

class Child extends Base<{ $emits: { open: { height: number } } }> {
  static config = { name: 'Child' };
}
// ---cut---
class Parent extends Base {
  static config = { name: 'Parent', components: { Child }, refs: ['dots[]'] };

  onChildOpen({ target, payload }: DelegatedEvent<Child, 'open'>) {}

  onDotsClick({ target, index }: RefEvent<HTMLButtonElement>) {}

  onWindowResize({ event, target }: GlobalEvent<UIEvent>) {}
}
```

The [`@on` decorator](/api/decorators/on.html) does not remove the annotation — it **checks** it. The decorator derives the payload type its target implies and the method signature has to match, so a wrong annotation is a type error rather than a silent mismatch:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"2946fbb539823020358fdbbd7eb4a079c17d5b9c1c2e1bf258759d3bb6cbcc45","data":"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="}
import { Base, component, on, type DelegatedEvent } from '@studiometa/js-toolkit';

class Child extends Base<{ $emits: { open: { height: number } } }> {
  static config = { name: 'Child' };
}
// ---cut---
@component({ name: 'Parent', components: { Child } })
class Parent extends Base {
  @on(Child, 'open')
  onOpen({ payload }: DelegatedEvent<Child, 'open'>) {
    payload.height; // number
  }
}
```

A decorator cannot infer a method's own parameters — the method signature is checked _against_ what the decorator expects, not derived from it. Annotate the payload either way; with `@on` the annotation is verified against a real target.

## Config typing

`$config` walks the prototype chain and merges every config it finds, so an intermediate class must not narrow the type its subclasses need.

Left alone, `static config = { … }` infers a **literal** type, and every subclass has to match it — a subclass that adds an option gets `Class static side 'typeof SafeAction' incorrectly extends base class static side 'typeof Action'`. Annotate the intermediate class instead:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"4b9ade483040c1a5e10f5fa18539be778a0cd60aa5f7902e4a4bcf107c078168","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XhnR4AM3uPmOAGEImD2ClzFYbHYHDBYWB4SknPNFogAExXLLrTZIACMRL2BwYHhhcIRTmyXyJNzuDzISEJbw+ODwPw5u3+HkEwl4AEEAEadUj3NAYtCaVg4vY0gDsZNWJK2iDJAFZdgtqXhJdLZfLFYyzl98ddbjL2U8AGzc6ifPnEAXUIUgFgcLh8EX+NEyOT0OLKAyabS8PTHQzaMwWcKo45OFxuPBeHyBgJBEL8MI2SLRUMKBJJVLpTLZPJUApFOClCrVWr1RrNNodbq9fqDYajcaTGZzFXLfXEsAbbU7aiGw60iSW84E21sx5IADMFxdmF53w95EF9CYWCjZEwfBNCrNEQV9XiBcxCMQaIxWOVCxpZO/msnpMQjoGvs84gI+76nMuG6rva67PDubr7r8R40j6gL+iC0RkBC/BQhIb4Ikiyb2HST7YiOn7kmSKwTlO5KUnOKEkeBWRWpu0GyhyOqqvBe4EAefzHh4jCnlo54YHwTEIvEYDMJYMAvtKZxkSAuJfhuAAcv60YgM5UiBMlyUuXwzqyMGca0PFfHxSFeoJPoiTgdjia+9IpPEpAwGCcAAPwKQqSnIFMvAAD68F0iieVaUAfniZKOqqWn/rpDF4B5XlGUg46mRxTwWbMoHQFZyK2PYwBohQvC7rhqj4SkvAvLwYKaJYvAAOQAAKdD0fRyckzY1HUDRNK1ADc5jmDm4pSteDzmvUpbhmivDAOYvC8PMaDsPwoSkS+kl1XoK1gGta0GfJbVXjBc2sK1FCrSdaWNrwyCtRKXSFBErWzPdLxjWALxOL1zBIKAsRgHAfRgHgaAIC8LxAA=="}
import { Base, type BaseConfig } from '@studiometa/js-toolkit';

class AbstractControl extends Base {
  static config: BaseConfig = {
    name: 'AbstractControl',
    refs: ['button'],
  };
}
```

## Compiler options

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Preserve",
    "moduleResolution": "bundler",
    "experimentalDecorators": false,
    "useDefineForClassFields": true,
    "strict": true
  }
}
```

Stage-3 decorators need no flag on TypeScript 5. `experimentalDecorators` must be **off**.

## JSDoc

The props type works from JSDoc too, for a project with no `.ts` files:

```js
/**
 * @extends {Base<{ $refs: { output: HTMLElement }, $options: { step: number } }>}
 */
class Counter extends Base {
  static config = {
    name: 'Counter',
    refs: ['output'],
    options: { step: { type: Number, default: 1 } },
  };
}
```
