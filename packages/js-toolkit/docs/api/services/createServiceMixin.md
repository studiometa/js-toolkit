# createServiceMixin

```ts
createServiceMixin<Instance, Target, Options extends object = object>(
  definition: ServiceMixinDefinition<Target, Options>,
): ServiceMixin<Instance, Target, Options>
```

Builds the mixin-and-decorator pair over a service. Every built-in `with*` is one of these.

## The definition

```ts
interface ServiceMixinDefinition<Target, Options> {
  hook: string;
  target: (instance: Base) => Target;
  defaultImmediate?: boolean;
  use: (target: Target, options: Options) => Service<unknown, unknown>;
  handleResult?: (instance: Base, result: unknown) => void;
}
```

| Field              | Does                                                                      |
| ------------------ | ------------------------------------------------------------------------- |
| `hook`             | the one method name the service owns                                      |
| `target`           | the default target resolver                                               |
| `defaultImmediate` | whether the first delivery is asked for unless the caller says otherwise  |
| `use`              | calls the service factory                                                 |
| `handleResult`     | does something with what the hook returned — `withRaf` schedules a render |

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"5b60dd7abaa4f2919f4b11539750979201f1f64228805ba46caab19658f2bf74","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BLMG0gMwEMBjGAAgDEIXAK5wAEhAgBrSiDhoOpBogCMABioAbGGADmafEgCcVBaV0xlIQSPGSZW5rkQaQXfIu6sk6gL4V0bGcCYjJZGno8AAoAW0tCKABKASFRCWkAOjZUuBgoAH4orFIILDhEFNsABRKyxIqiCEYoWXlFZQAmABYtHX1DRAB2U0ULK2zbPNlNJx8qd08ub0QO/0CcPEISclM6KyLPONZk4tLyytEas9azZQBmO969AyQAVhHzSzxTsunZ1XmHlIXjCqhUa2oQU2oR21D2TBYZE4PAucCuvyobSUSC6rm0zwG6g+YzwNkutQQjjAzhUgMWyxUAA4IZgNogQttwvD2VwIGB5LwAO6MAxk84AZTIREYPAAsoxaMwADxi9JSCi8ACi2jiLA1EAARgArGBLAB8N3aSEG7xA+P6xmJX3ZwtFOT+1JxdOBS1BKjuLKh7K2YV2kXZUQ4Mw4cGSXFIMA4NElpGlcoVytV9g12pgurQ+uNprQZqisDYzBFjD5FRTaZg8sVYAAIjAK2Aq3ylbn84WTeb6rw6zKGxmwCqcmqczqdAXeIb+yWADodmJYCBKXjxxPJqUjxvMWRQIQIdkAIWEjE0UF4HF4MzYpowXG0AFoDRBhGAb7lUyPeDEY4ZLwACCwhoBAMRJjKvBwMIBpwPGjBYGg1b8veMZoLw2SkPO1IAZ+LBbs+2jAbKHBgMIUawfBiGkMhqF8nAt6aHAECwRBWB4bwX4xIRaAZOEHC6KeyDIHazAOAQaBoGUiAAPTyUacCvhBECaFIIqvkQXQZPIwhQNWRwcBksBEPJHBYIw8m/vWcDyduSYwMO6ZNhk+BoDEmggAAuj5mK3EgjLDHafQvKojJOlYjm7n+rmHlSzg9G4QIguQKyvIGbIcqGcLhiAzCsMifBZtIlrYqoagAGxPA6iAmNQozOtYk72B6SXemlOJdFlwQhrCERWIVSLcHwPazkeJ54AAVNNAAG40sHNs28IwzEGHwfEChY1LApovAGjGfAvjGzFsCUMRCvgMr4Cx+0wDORELsWzFRIwGQwBkfYvbwBhJrwCbFPAs68A9eazrGq1gLevDNqk+ZQ/gZAisBACSWF8poGC8B4zFHAkzEUTePxkKh8BbpBfHQxBd28Jp37MRAbCg49aBwGRG58HAOBcIwFZcFumineTzBI/RWHnZBWqsxkK4rsgsrNgAcrwABKbZkDoPA+VEHmyeUilmQ9pRkBkfEAF5XkLGQbro8nHlw9kAOowAa8kgVUqPyYtaCJOVygqCoIX2uFIVmCS7I++1XopfSoKvJlASQtl/VcvlRS1KTGDJC5o5Nq27aduOPvfea7n2BU8j0Xok2O3gBccMImhYfj0C8GAHBxBqn26MBc10ep2hQHNgkBVaqh3HiYUDMl4fNYQZWJW8nW+ulqxJ6yfUwmn+wk0o2dDnu8Utm2laMcXrOlyWGRz2gFRvfyChgDwFRnkdyQALxmtL4MsLXp4gAbk3LCt9u4ZF7r9JGQpmDHkFNhDckCubxkHrBI+n1/Y+C6A1EOAwaqNU+FYW+0dEB4IWD6ZY691hb05GGXehxLBkGSMwNoz8YCvyOkqN+uR0RwAtGPCqKhXiRVCgSIKUUEQsJ4MQ0hqVV4+HBBvIMOUBrchAAcYERxGFQ0kWw3gXCYCcKOjwvhchAqqEGLSERdVhFEPZMwp+Uil4kJXhQnqiiU7b1odEPemBkj6MMdwikZoMgABIHoVDEAAFVlAAGSjvwgOjIp6iMQI8fBEcQBhO8k4mRcd0oPF6tCGheVd6Z33jnNBB4T6F3Pt2S+84ixl1ELoqIt8Kgl3nChNC5xnpLE/t/XOSovxSEgIKMAGphmjLACYh2ADc6IIAvENucEEJIQNOTCCGpdCMBINTKBtl/weE0MzJmCzSjn3ZnLMAc0ADyXSmJzVWutfZaCADkjMxmdPPr9IIGpXSEHAgswCTZ3m8DmrfOaFAVxzSgpRKMjyiZgsYDEOIhknJzQqBtbGiguZoHolgHAN51k4T4BtLcUZ9qIo4AhWcK5JaXTJZvDUbF4GkEFIoQyegFmCkINoBpi5yVgEgFhLAgK7wPifC+GAK53BNBRIVdiZKDnytgCwEUGBZZgBXGeCABhUFxT4FgehrBCYJjBZMiAYzHliz4OsrgjdcgEQFMC5hrL2WkCgCuHlTltgLIXlIAGlhhCkHQv8z8WFND2GYLoW8WERS8EACgECzzqdy5mgp5iCVx8lJR4LCCYOBQGYijDBEVg7TyQGk2xIBmnEJCmQrqKxCnBk8SU7xxqtFtJ/vmEtKgjBpJwUgPBVaiFOLrbI5YzJ3HUNyoNPAvJH48VyGKe+nafb9MPgaic1QKQakaM0ExWJOhqGSgOxANimpWGaWKWtLi/RGCbconebaNEMNIMkVdrMS0dH9LVcKQ6L14BHRJT0Qxb1r2ZP5Nw0BgjDXYKNVEapeDABXLweBkwCgZzOBUMUPDBx7qgAAbhXL4K5dB1ybnnQKf5YpeAfy3Pm2K9YqlbrSNmLts5SzIehjjCuvBXkTGaVAV5ULuOdofjo9d9iKI8FCQ9ETqHmkroveuq9ORWnKZE74RIBHZDGSQKAPYOg4BoUAwgXwvggA"}
import { createService, createServiceMixin, perTarget } from '@studiometa/js-toolkit';

interface FocusProps {
  readonly hasFocus: boolean;
}
const useFocus = perTarget((target: Element) =>
  createService<FocusProps>({
    props: () => ({ hasFocus: target.contains(document.activeElement) }),
    start: () => () => {},
  }),
);
// ---cut---
interface FocusHook {
  focused?(props: FocusProps): void;
}

export const withFocus = createServiceMixin<FocusHook, Element>({
  hook: 'focused',
  target: (instance) => instance.$el,
  use: (target) => useFocus(target),
});
```

```js
class Field extends withFocus(Base) {
  focused({ hasFocus }) {}
}
```

## `use` receives the service's options only

`target`, `manual` and `immediate` are removed before `use` is called and they are absent from its `Options` type — which is why `use: (target, options) => useDrag(target, options)` is correct and needs no filtering.

## Override `$mount()`, not `mounted()`

`createServiceMixin()` overrides `$mount()` and `$unmount()`, which is what lets a component write its own `mounted()` without `super.mounted()` and still subscribe.

**The rule is about what a mixin overrides, not who wrote it.** A userland mixin that puts its work in `mounted()` needs its subclasses to call `super.mounted()`. The way not to need that is to override `$mount()` — or to use this function, which already does.

## What it gives the class

- the hook, bound for each mount cycle;
- `$services.<hook>` as a [`Toggle`](./toggle.html), typed through `ServiceHandles<'<hook>'>`;
- the two call forms, mixin and class decorator;
- the `service.missing-target` check on a caller-supplied resolver.

## One hook per class

A mixin names one hook and binds one subscription per cycle. That is its limit, and a component with a dynamic set of subscriptions calls `subscribe()` itself. See [Mixins](./mixins.html).
