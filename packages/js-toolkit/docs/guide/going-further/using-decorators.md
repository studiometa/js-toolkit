# Decorators

**Every decorator is a thin wrapper over a function API that works without it.** No engine ships stage-3 decorators, so a page that loads the package from an ESM CDN keeps `registerComponent`, `$provide`, `$watchChildren`, `$read`, `$write` and the `on<Child><Event>` method names.

Decorators are sugar. They are never a requirement.

[[toc]]

## The six

| Decorator                           | Wraps                                   | Notes                                                                           |
| ----------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------- |
| `@component({ name })`              | `static config` + `registerComponent()` | Registers as soon as the class is defined.                                      |
| `@on(target, type)` / `@on(type)`   | the `on<Child><Event>` names            | The target is a name or a value.                                                |
| `@provide(key)` / `@inject(key)`    | `$provide()` / `$inject()`              | The shape of Lit's `@provide` and `@consume`.                                   |
| `@children(nameOrClass, callbacks)` | `$watchChildren()`                      | Exact name, or constructor and subclasses. Callbacks are bound to the instance. |
| `@read` / `@write`                  | `$read()` / `$write()`                  | Runs the method body in that phase, cancelled on unmount.                       |

Each value decorator works on a plain field and on an `accessor` field.

## A component with decorators

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"6f22f47de6ff43eb0b00a558350bf0dd4f4de9cb567ee52325132631c0914ad3","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACMS1SsUSlo+EitVMmkKQN4Krhr7JHLVPz4C8z8NOSIAEwAvhTo2LgehEFJ8kxsTg8XgAMy6YHufTAAnw7FYUFIURkcnocWUEl4ehOkhOhm0xgovAAEhBOpjeMwwBhjIwwMxLDBELxOqRzilCfw2KwAEZ3HJwAD8TIA6sw0NcAMKw+GIsASrm8/j8mTGXgAMl4XnYcGkn0kJM6xm4TIAamwujAACIwfi2MW2SRSuEIqIS+rrSERFWqxgAaiWvGIZFYEGYUG45isNjsMOdsqcLjceGkpD5vEsEHBNCgvFgcH4cUpaBEXApvA4JFCrA9aCh8V4AGU0KywGl02LrrwAAa2sAg9gpeJ0hldlF3NCsDDxcxu8KRaK+YTwXjnQQ9HzDmA5uBdbmCJdwevy6uK/m8bnnHO1XhbHyEMm2udRNCJPapdKZbJ5KgFIpwUoVNUtT1I0zRtB03S9P0gzDKM4wlLAtqprUpBwCU1xxlE8QFJYrDTLMIDzIsiBLAAnGsGxbEgAAcb4HEcHgYTKURONkXxPFcNypvcZBIK87zUJ8eA/Lxez/B4LAcFwfBghCtYRKET7RIwvb9ikTInG6fYDsavDIrEijoqoWksl09y2DSRDmoymochEND0EyEp+HA1pIfapBaQ5aAqnwOiqkQEDsFAkbhDGj42PODBUIm7ggA2Aw3t4imRc+oTaSkFKKLwiIpNqDxJT4+7+LwADu3jQk0K4iLA/aRFAr7UO+SAZFk5zfgQhTFGUlQ1HUDRNC07SdD0fQMjBgRwRMiF2ihaERREz7YWguH4XM+wMIgADMqxZJR2yIORTX0ZtIALVFrHnF8W2cbcPGPPxHw4MJQbkGJ9AAlJwKyZ60JegA0iiChKLwOQwBgEAgsS0gALIADIAKLrAy0QIyQ0Qw2MNKYDgTL/bpMiwgEqKGQ4MCWdZTKMFs2pMlqcCEoEz5MkSsOI8jz5o8+mNYMg/1TH5AVBVAdnRPITkuTDAyEFAbmzbYXnyIT2qEtTRN00TjPo2gLNs0jMAo2gXMY2MfMC5iQvBUaFu8IFwW8H6ACsgZBCGYY8KF0b2BECauHFcvIT4zDptL0AUiW0JMwuNyKOspDTmAADykTMs2bLnpeEdyNrgbQreKWLQumgQC+vAAIKpy2mWUjmUf2DjPgXtlwdMTmtg5TAIIJxX51pcVIhNyDWxirG8I3p89ZdqVl4QKVo4192iZdIbo6D7wKQhryrDZ8+h5JM1KCfu1+Rdf+PVAf1oFDRBo3QcwQyTWM002vLqElBEy2rTM60LJtrS7HtVsVFnh0UOKdH2ZwLiIAAdcO6Dw+JvCel8Agr0/gfQkoCaSK4xakBBHcHwTpmJyndDaeSYB9IkxBicck2JcSaHxGYCwYV7CEJdMQ6spCoS+yTB4OG7ASCEktInGGVRbCwERDmIg7AYClRdmQdMmYxY5jzAWRQRYRCWA7N4HM3IQh0HHAXKK5hNyBlIOeEILcwipQXL2Uy5kzELyaCIHce4XLwEakRTajtHYUSAQdJYtFjpgLwKw2UboOG/UulAnxZ0uLjl4ogAA7IgwSz1vioPeqdSSQI+DnAeHggsvBrTrBSGKLcxsfKyAMlQjEWIJA4gMPQkwhJAbVOcWnVs5IWRskYVGWw9hikwFKdmCp3C4qsJ3guLAzAMBuwat2aZszQxQFHNqQqvBwSwNbFuSZ9hYDJDhISBuOYQSaEsOs1uAByEQXYAAkBsnFdg8RtGiHFAGbH8QA/YwSPCDOGeU7WUSvgADZbrcXgUklJDcXq/EyZ9HJhjnwqQiGpDSEgtJqQJlUyhRkYAmWbGZFCFNWAWjpqLbyEthABw8oregvkbZ2xCkwr2iLohjLwAleuyVe42JRQOLKOZcr5XkfnfuZUKornsGs2qV0Gr7zSC1I+uQT5/gAr1YCA0wLDUgmNAY99YJPwQi/ZCth5pWMLi+HCeFv6EReSRLaN13nAKOt8hiZ1zUXUgV8I6sDwUJKWFCoS6TYXUHEiARgWB6FkEwHwTSfLBybiZN01sThPHLFaDE9YfidigLdZuIFSAfVxPussLaga0koJDd5PAYqy78CQlBMAABJGglhU12qWIk0FTr/GOtdadOtDaoQtoNgWkiAAGMF8THjAvLcgkSb1Q3oPDZg4EYrsTYuBrivEugyY7t6cwsm7KPBeCKi5HewRWUxBxY1ZICrD5tWVT+U+aqL4gUGuBEaUFxr6sfvBNatrf7LFIoErNHyc1BLdScMdSxJ2xLgQkp41E50wtEkurJkatDRowHwe5lgnFMmAOYXgJHAw4DAEyRlABucwLx21AeeOOzN+0kDdv7XgPDTiYNwd9dOpAW1HYoeDWh6tElMM4DsDhsjURKPC3o8RJ4SxmPZugbm8B5HuNTpLdAwTAloXCcXaJldX0+BelMGdDgSpzPY0+Eyczgh2BWZAFiomxLSUOxpv+TUmtdlMjUEFHBFTBa22FuS8WvBnLCCllsaA1KUK0sqT5tWtNvMq187wfzeSyBBYZcLa2/kQv2ydnI0gcyPbMv6bnY9IA4tBxDjFnMpZKS7N4DHKAccE7Jx8MmzKg8s511zhcj1aVi6lwrj1gVLWG4Z2bqPNuZjERd3MD3YbNjz19aSiPVu48cCT2nooWe89spdiXivGbOYN4QC3rsveb572tS/Cq7qgE+rvq1Tfb9eqH4jENTNE1b8P5WoA2m54W1u1geAW89jHgIGPq+CsLTEKy16aDZWkTYbGDjRlnwQdYjh2tviLUFIG8YCMF0oy+Tm0niOzgxDg6bGFg/OoBAYn6wYNvN49px6qT50ZPQ0wLH0BY31OALwTjxZCPSYo4VqAVHeAvDly8Yw8RxeSHM1hsA1nGB1zsyADX5nCSLLmUKGXvAAA+GzFCd1lbpCUXROhhAqZIMAXRqzGGq5abU0zxT4DLNyXc3JsjsgEJSAsQhA8+AG9PLY6yjfLPDovPVcInnyo/CARE3RSBgAQFQU9uYvdaJ2XXI83glSJ7wa7tAGg65blHCCdunIIQwGrGKOswO7VPESbTljiAYnQ5AOLmDjrOcQtIkJtHhmMerr4DytAyKMpouMvGrFQM0Rk3xaQQlFlGBWRJTZaQYXHIRZcnFhW9klbSHy5bJlfTwqreis4P2HLEqivv+lNSk2hWdBFdy895UoiSrVS5jW71S3oHwPbHzPqqrnyvaarXxfq6oTQ/bwR/YeRmpKSWorTWoEQg5PCkSOp06FpqY1r34waJKI7+rj4LpoIYZRqSbC5L4ZRDj0g2Q9aU78ZMa+LgaqaQanT5perLDkHwZ+qPBLDI5IKoaT7LoRp0Exrr7xrxCz6ChMgABKxqUAkgPWhIca2eBK9i5uEW9+TazCZAqoFu4IMq9U1WEy/cy47cQgAAXiELfg8CIGDBgDsrolerwJuPWMYV7GQCWIiB3HlN/hImVE0IQF0PYNyDAOnJyBwnKj/MRFtE8AAoQROsQYxPfjnnDoIRQY8KkVQXzkZjIVhvQeXPWnjhECOpYEyA3JDJUUOjUa2uwdtFtKBj3mIVkSALjqQI2rUWQQUTsLOijhWtQXCoxOen0Y2m0WDgQT3i6ozm6jMVwgISRIEiPgkqMRIQZjQfClguuvUpumvnQkYDQo0kYAeiytBjFE/ier/sIBeiELPqvoZGAfdkqh1L+M9uqpfB+tqrfD+t9lNJMDaiDh0btBkV8ssadLcXkRscMc8K0MUVWlPiZnNrKJIA0VDKsS0QbISJSNSIwLONYmgJFv4PUZ8I0Xic2q2hyAqHyMoQ7KKD7qEq6IyUqHAJILSbUaqBqPTLqDgJIESdbOYVbnVFuLpGaHvqfqQI6NKGwuEjWFCDyVUf0fjgbMYD6P6CVnMhGBVuFIqfGHcTwp4NxDkAolmDsiooWNECWCWOWPwkVCQr9PWE2FXBolot2KpAOMwSOGOPcJOAnKSRaouP4MuKuCSrAD4SwduLuLYYeBFpyWeGvNePnPePYLPh8Wno9lAb8W+nAZ+jqnfCCb9samgehMaVhEDuCXaltKRFCT3oEv3q3CaQiWREieITzpIfsVMU8bya0ckX/OOt3ipt0bwXgIOaOusZ2cIXxiRNzvphPn2eGuJthjjuqY2vEE0AbF5uyewiqV6NOZYO7sOTsJ2lwcAn3rCXgLuZYLkWxHxDxsWhCkuajhMfzhghiVlrgvghFtWYeZwl6CcaTNQnUqoA0qoPutcZVgecqcBWANVnwgIkUsIqIv0WQDslIjIiVlaUosAfmHacWO2D7p4XorQAYrPsYiwaYuYmWK8bYnoShJNk4syAmW4rdoBsRK0NTlef4i2beR4PBa6WQmOk8C+QhqIeOqiejsurWluZqW2uedAv/PxaWj0SeeJZJSIXxGPmMbzmidIdPrnNidSbiYpfiZYISOruRlrq3FSTgDSZZXSQSTtjZLZVEOZi5tqG5jZKwkSDXHHGqc0a5dZbwJ5ZriAASOlBSsflFqHLLBWfFufnSvTISAFUFWQCFdUWFTZXrnZdFVfqbsVq9GVgaS4VVqaf7MlXVoLo1v1jnG1h1uYF1pXOnBts1gNgpK/hgTlHUGNu1Z0gvANtNmvC3IqXRYtt3N4WKhtsPFmZNQ3HtjPHPJNidq4MvM+KvJeOvJvGwDdjmYqo+t8S+jARqlfMWUCV9gaigclaau/GAJ/NgSpa0MCukT3lDkJXrkhesU8Bzq+Qkt2cuZ+UZgpaFYMa9cCkIRkROf3lpX9QDVJaxrJVIVkvVZuaFYoSGKoInLeKhIwKLv2vLkyH8mUlAE7ieflfrtFeTnJq9aRG8rDbtK2TjTAHjd4KhOJcPoDQ9KjauRGrcONGQHwP2kyAjdxV4uOuDj3gzidHgOxn9TzcjSRDsT2XsZMcZgir+QUj4GTSMtrBQlumTBcZBWcfiC0m8SDBNnoD1rBTGPrQCs+NYZNQNnHmGJPO7SskAfnJsjHIcLXDnPsswIcu5Scmchcoqdct2OLnACnipY7EsDLeOTCfLb8s3kMuTaMkrUiU8GrSDSUWGuDblZDZLUgI7DtOpfappS5aXU+aDkia0AGgZb2ZrUxZKgbOLbXUOWXb3okkzT3qnUzveeJTArzcsLprsSuZrWURJnIbSTua2vuYBQhb9DlRqVZWeb3Y7NRMptwTeWnSAPeY+VdHxGPSrUhvzW3REGSPeV3RDT3SDsCuOh9SpkPW6iPX9TElsdJVfV+WuULQMCLTeLCffSXY/XasChORkXLUzorQiXxfOdpmRH/WDTfVKq2mAxvWFW0cCoplXe/adJ/Qg9/ePc8Mki3Rrf/bPRuWTJIKLrHZLhrrJsFIrorsrvcqwLrPDPrIbLg3nVXX2t9Zw+JaQyrUUZQ9PdQxjbwLw0tIiBmCQGXIUKyP7jQIwAAI5dCAj9hbgAByLBSaHSKQdNwU1WeecjC49VvAAAVDY12Ao0GMo2nGo6TtwF2HYx3Io8uPnGKC49ET4NHr7vnHADgPwOwLozmCYqcmEOshnYbAnOYMgDDJaHo7wGoSCFhU3lMIwD8WfEaiQCGBJvEBmA4XCEIPELYCkAhH7CUMKDANyCUGXGoE2iUJY2gCUI40oyo+wK49wLg1tGOdwUpj0V0zAM46owE6I12bOgRLaLAHeYekRtCGTBQMRpiVEGsys7PlsyRhELs+5QBZhEBb9Ac9No7RTdrFsy8KCBHZcgAAIIF3wvYXVNCXI0aa5gD3Oz6E2xkMhMiXInmXLy4GnF3YO1FW24r0Ni4PIS68Ci7MOm43NK7wvrP3MRCMCXIOZKiXIGkkZE4k5k6osrP4tEwq6wuYsa64sfMkYvC0bmDmDfP36/OJq8CAsuWXJ2QYFeai4nny4gvmBguNqQsm3LMkbfOAWMAnl4sd0PkACETkK9olqpJ5xgHzaLGLVNbLVLMrggpI7N+NcAvzxNLwpNGd/ylzz469Ax9J2r5Gly1sYrpG9eZi8+t9ragYUMnmi9e5fATrpGK4UMjA95vAcrOgeg/auSBOnD8QYzEzvTATmLUAYozAoiWAZCabUQ1L6ztL6zdLYAdGVAP6SAoABkcAXCHgxYIALwLwQAA==="}
import {
  Base,
  children,
  component,
  on,
  type ChildrenCollection,
  type DelegatedEvent,
} from '@studiometa/js-toolkit';

@component({ name: 'AccordionItem' })
class AccordionItem extends Base<{ $emits: { open: void } }> {
  @on('click')
  toggle() {
    this.$emit('open');
  }
}

@component({ name: 'Accordion', components: { AccordionItem } })
class Accordion extends Base {
  @children(AccordionItem)
  items!: ChildrenCollection<AccordionItem>;

  @on(AccordionItem, 'open')
  closeOthers({ target }: DelegatedEvent<AccordionItem, 'open'>) {
    for (const item of this.items) {
      if (item !== target) item.$el.removeAttribute('data-option-open');
    }
  }
}
```

## `@component` and `static config` merge

They merge in a class initializer, which runs after the fields and inside the class definition, so `registerComponent()` on the next line reads the finished config. The rules are the rules of `$config`: `refs` union, `options` and `components` merge entry by entry, a declared value overrides.

A key both sides declare differently is reported as `component.config-conflict`.

**The decorator is applied last**, so it registers a finished class.

## `@on` — a name or a value

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"e365c86c41500ba3e17994cf74e2426df89c97088dfb184bc169d056413e4e35","data":"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="}
import { Base, component, on } from '@studiometa/js-toolkit';

class AccordionItem extends Base {
  static config = { name: 'AccordionItem' };
}
// ---cut---
@component({ name: 'Demo', components: { AccordionItem }, refs: ['dots[]'] })
class Demo extends Base {
  @on('click') a(event: MouseEvent) {} // own element, typed from HTMLElementEventMap
  @on('submit') b(event: SubmitEvent) {} // idem
  @on('dots[]', 'click') c() {} // a ref, named as declared
  @on('AccordionItem', 'open') d() {} // a child, by name — imports nothing
  @on(AccordionItem, 'open') e() {} // a child, by class — the class is the type
  @on(window, 'load') f() {} // a global
  @on(document, 'click') g() {} // a global
}
```

- **The one-argument form types its event from `HTMLElementEventMap`**, so `@on('click')` hands over a `MouseEvent` and `@on('submit')` a `SubmitEvent`. A name outside that map is a component event, whose detail only its emitter knows, so the handler declares the type it expects: `@on('content') inject(event: CustomEvent<{ content: string }>)`.
- **A class resolves to its merged `config.name`** and lands on the same delegated entry as the string form. The class is the type, so `target` is the component and `payload` comes from its `$emits`.
- **A lazy child needs the string form.** `@on('Child', 'open')` imports nothing; a thunk is not a target and both the overloads and the runtime refuse it.
- **A name is a child or a ref**, resolved children-first, so the handler is typed as `DelegatedEvent` or `RefEvent`.
- **A ref is named as it is declared**: `@on('dots[]', 'click')` for `config.refs: ['dots[]']`. A mismatched `@on('dots', 'click')` warns at bind time when the other spelling is declared. A name that matches nothing stays silent.
- **A global target goes through the same binding `onWindow<Event>` uses**: bubble phase, one listener per mount cycle, removed by `$unmount()`. `@on(window, 'click')` types the event from `WindowEventMap` and falls back to `Event`.
- **Nothing is reserved in its string space**: `'Window'` means the child and `window` means the global.
- **Any other `EventTarget` is refused**, by the overloads and by a `TypeError`. A decorator is evaluated once, at class definition, so an arbitrary target can only be a module-scope value.

## `@read` and `@write`

They are **leaf-method sugar: the phase belongs to the call site.**

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"cd7d9c008ffb04863950b2f03279658c6f16c32ec2dc67fae2420c646f901053","data":"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"}
import { Base, component, read, write } from '@studiometa/js-toolkit';

@component({ name: 'Measure' })
class Measure extends Base {
  #height = 0;

  @read
  measure() {
    this.#height = this.$el.scrollHeight;
  }

  @write
  apply() {
    this.$el.style.setProperty('--height', `${this.#height}px`);
  }
}
```

::: warning Decorate a method nobody overrides
A phase decorator returns a wrapper around the method it decorates, and that wrapper is a property of **that class**. A subclass that overrides the method defines its own, undecorated, and `this.method()` resolves to it — so the base's scheduling disappears and the body runs in whatever phase the caller was in.
:::

A **template method** — a base that schedules work its subclasses implement — schedules at the call site instead:

```js
// in the base, where the call is
state.subscribe((value) => this.$write(() => this.update(value)));
```

The alternative, dispatching a decorated method through something a subclass cannot replace, was refused: it would make a decorator's behaviour depend on inheritance depth, which nothing else in v4 does.

### Stacking with `@on`

The skip is keyed by the method name, so `@on` and `@read`/`@write` stack in either order. The order decides what the listener calls:

- a phase decorator written **below** the `@on`, nearest the method, schedules the body of the handler;
- one written **above** it schedules direct calls only.

Write `@read` and `@write` closest to the method body.

## Build setup

Vite 8 transforms TypeScript with Oxc, which passes decorators through untouched. The package itself compiles them with `@rollup/plugin-swc` and `decoratorVersion: '2023-11'`, filtered to the files that contain a decorator. See [Installation](/guide/introduction/installation.html#with-a-build-step).

## The same component, without any of them

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"b81e9bcafa4badb01f7759749081c6a0741ee61e730cc1e86827d9af49323052","data":"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"}
import { Base, registerComponent, type DelegatedEvent } from '@studiometa/js-toolkit';

class AccordionItem extends Base<{ $emits: { open: void } }> {
  static config = { name: 'AccordionItem' };

  onClick() {
    this.$emit('open');
  }
}

class Accordion extends Base {
  static config = {
    name: 'Accordion',
    components: { AccordionItem },
  };

  items = this.$watchChildren(AccordionItem);

  onAccordionItemOpen({ target }: DelegatedEvent<AccordionItem, 'open'>) {
    for (const item of this.items) {
      if (item !== target) item.$el.removeAttribute('data-option-open');
    }
  }
}

registerComponent(Accordion);
```
