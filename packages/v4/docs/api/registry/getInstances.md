# getInstances

```ts
getInstances<T extends Base = Base>(name: string, root?: ParentNode): T[]
getInstances<T extends Base = Base>(el: Element): T[]
```

**Every instance that exists** for a component name, mounted or not, in DOM order — or every instance on one element, in mount order.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"29e48b5f5dec0ea5409fdafe0c497a0c46efed5a2494003931a6e2b2ebb18c3a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAOYw0ASTBw0zUfAA8AFV50aYKHF4AhLjF4BeY6fUm4MAAqkIWOAD5XjMMwC2MRL2VSdjBpCl4nCDQAfn97ZlIYMDQAOWgYbn9NZABdXkYAagBGXmIyVghmKG4AHTB2bywIUjQZOUVlVRF4ShAoCBEERBAAURJSDF5gjrVeACNBdlYW/ibeZl4RCAbJRJavXzDg3gARAHkAWRLSWFIw7whhGigr3kg0ADpa2s18Mzt4kT4DalUiGNC/XiwOBdfSqNCGCD8XgAAwiaGRa30rxgYxRaIx7HhMFY/DCcGCXVqhMmhnWyIAjoIyBgAMrEmBiJoAQVYrGR714XN4ACphbAVICYFBRTpWDBfEkabxwWQYCsErxhAlmIDmLM5bVZhNwexDOrvDoSFJwQ9pEDqcpFqwNvEgvBJvDJkoVDNACgEvCwXDBEPZCrQtTQEGVEJB5Uqc2JEAA7mFVoG4IZCYZxTrfs80WtDKiIJF+T0Os0kABOKhykLgpCFABMVBUpFkDCGHfaPq6CFrwVwiAADFRdaQdTRyIgqwBfCjobBDgggno0eh4TbegIc8SSfwACU05wAMsM5WHy23OwA2ACstcS0gbiAA7K34h28HYxBIwD0ODAIcWxAcdJzIJAb3nRccDwQgxjXXQ8CIeJIX6QQw38Y50MvKg+gGPBRWRJNgj6JN3nwjDdmRGUEjQQRSCUNZwjVVUZkjaMzEosNgSSZhB2eI4VV4Ej9GTT4wFqZBzmOZJeAAJVYhI1GyRh8DQNAXEQAB6bTYBIcocFId57gALydZh3iaaQ9P6OBtIAdRgWZtK5ex5Ec0jk1skQqKSbgr3iTtXwfEA62ffAkAADg/ds5DwbjdgAwckBAsCxAgxBCighdqCXODV1bJChkYXwbSqXg4mUlI0neRlmTZOVOVIdRqhAH890kkAPDsJrI1Bfw2o6v82oyXgj1Pc95V2XgAB9XkEXk8nyAAWEoxjjAwArwuy8EU+jGODMx+HYUEWlDGbwWYFpTWYqEYSgOESiRSBYGja7eG8a7JUMXrdyaOAJKkmS5MU/g2K6VT1M0uAdL0nFEyMkyIHM3lLOsnz7Kcly3I87DfLDbT6vGRr/tIbb2uvaKVsfetIqygBmWKvyGYnWXZZrkqA1Kx3weJwOnJs72gvLYKGeCIKKjcSrYTgeFaBRvU6DRbBgGxTEcZw3A8fY/ACNAghCMI0RiSr4l2VJYDG1X1bsTWXFcHJluKWMKiqKltmaBWe2V/tel2oZRmZL1pi6OYFiWARVnWTZtiAxVdcOKQzkuJobjuB4kilF43iBsAfj+GAASBTYxiOyF4AeuEESRYtS0xZ4gNxOv0Q9XrSQCCkYCpG7aRRNnSeank+QFIVRRzSVpWFWVpsVW6VQSdUzC1IvdX1buwCNaNbvNS1EmjW17RaR0lpEV12HdLMQ97Mx/XTcuLqSCMo2E1341mRMUxee+24riU83CCWFoXA8RALLFQCsnZCjNlphFRsIE2wsxAN2JWag/aASHDTUCfMJwZWnMOEWmAxYrgQlLTsIAWAcC4HwFBocVbWFVvbbWngfB60CMEUIgDIimyqhbNI1sGEaycA7J2BQXYbTdjUOonsWi0Jvn7fCgwRhjAmFMG+4dFjLGjsCOOM1E5ehOBcK46dPqZyeDnSIecC47mLsCMunEK7QkSI9JINdQH11UI3BGpB3GtyzMSDu5I1A9yVHSAeHN+rD35IKEUYo5C5ilDKR+vdOKLyaMvMA2o14Gk3safAO8mgWgRtaQggg7Qen1k6F0pA3SZk9Go5WvA75Bgcck5+Di37PA/uUL+aYWlXwngAgsICW7gMpkFRsN4YphSfC+GB1BPzxS7G0VBfYuZDlCulKcSACG5SIcuCW5AyGbkkMoHcv59zjWPGeC8SUIFUyylWQosCXzvgWXFchw1JDrKQJsnBAtUoM0IflcWhVqDFQobLah3tVn0LsLbBwwjmHEn8FNMMAj4WMKRY7XIYj1plEkR7RoXs5G+x6IovAQdxjX0aZIEoQEZ5hiTqYx4xiyAZ0eNnVYucvj5xDLcxUu954Qm1HAOlJoEQSPjHQU0noJwL3elIdYP5JBQFqHQYlaB/CzEiECVQcAkxkF4G1JM+TAQ0rQWsDUC9u6UAbg4z8fkWhYHYCIAA1kdWo0JnAwAFPIYBrAxW8DdTAGALgHHInkMkFkmguTJAAMLDBZBibUgkpA7ADKwHUMAwimtdUCL6GkyCGHuAkWokAkzvRaMJENqi+5wAwN4HVzpPGvCjOUEIRq4A4DRuvQsKJiTvAAPpDtmKYEd/JeUAFUwAcBDQ49hIQo6kAtNSPo7o3i8TgItatEIU5kijNSfVhrQTLrWLUQZ2dkn9tTYsCYID1TMS3EBDKzwdjvECpWRATYGahXCnMhBizyGkrQT8xAN5eb8zwTs4FxDDmIWlqBU5x9dx/kPNctFdzxlfqbCtaZ/76ZvMQUs9qqHvkDm5uByDuDtmM1nNkMcaQ8D1E1bwYAMK6GGFnAIJwFoADkAABZQggoASDKswbSAArOAABaSMEBWBusJDJogK0+MAG5eVbjOV8qQlhEpJDqkyEmESmiMD47pvj3AACEmnJKdsVpx8zxxODlGkFZ9TvBdJ72pS5tgEBpAGOEgZ8MDmfZoOc65gLfGyRkbANwTz3nvETD825jRkcjjrASNIEaYXYVwEYLphLXntI+YwCaJddKM3JJ6OJpAoBdCJHJN8oY8IQCzlnEAA==="}
import { getInstances } from '@studiometa/js-toolkit-v4';

const section = document.querySelector('section')!;

getInstances('Dialog'); // every Dialog in the document
getInstances('Dialog', section); // every Dialog built in a region
getInstances(section); // everything on one element
```

Reach for it when the result is **counted or inspected**. When it is going to be _used_, prefer [`getMountedInstances()`](./getMountedInstances.html) — every instance in that list has run `mounted()` and has not yet run `unmounted()`.

## The two overloads

```ts
(name: string, root?: ParentNode): T[]
(el: Element): T[]
```

- **The name form** searches the descendants of `root`, which defaults to the document. `root` is a `ParentNode` and the call is `querySelectorAll`, so it never matches `root` itself.
- **The element form** reads the element's instance map directly and never consults the DOM, so it answers for a **detached** element as readily as for a connected one. The name form cannot: `document.querySelectorAll()` does not see a detached element. Pass the detached root as `root` when a name lookup has to reach inside it.

## How the narrowing works

`selectorFor(name)` over-matches on purpose — it lists the responsive spellings of `data-component` too — and **the instance-map read is what removes an inactive declaration**, because a breakpoint-withdrawn component is destroyed _and_ deleted from the map.

A matching element with no instance is skipped, and that is the whole narrowing. There is no mount filter, because it never did that work.

## Where the instances live

An element publishes its instances under `Symbol.for('@studiometa/js-toolkit-v4/instances')`. That map is **not public API**; these four lookups are, and between them they express every read it answers. In a console:

```js
$0[Symbol.for('@studiometa/js-toolkit-v4/instances')];
```

The element overload exists rather than a second export because both forms answer "which instances are there" and the argument picks the scope — and it keeps the map read in one place, which matters more now that the key is a symbol and no longer spellable as `el.__base__`.
