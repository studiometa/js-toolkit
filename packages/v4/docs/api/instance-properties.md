# Instance properties

[[toc]]

## `$el`

```ts
readonly $el: HTMLElement
```

The element the instance is bound to. Typed by the props type's `$el` key.

## `$id` {#id}

```ts
readonly $id: string
```

`<ComponentName>-<sequence>`, where the name comes from the resolved config and the sequence increases once for each constructed instance.

The id exists **before the field initializers of derived classes run**, and it does not change through unmount and mount cycles. Core never copies it to a DOM `id`.

```js
// 'Slider-3'
```

## `$refs`

```ts
readonly $refs: Refs<T>
```

A live view over the declared refs. **Each property reads the DOM on access**, so markup put into the component is found with no refresh and no detached element stays in a list. There is no `$update()`.

A single declaration gives the first match; a `name[]` declaration gives an array. The property name never carries the suffix.

Lookups are cached, and the cache is invalidated by a counter the framework's MutationObserver increases; reading that counter drains the pending records with `takeRecords()`. Detached elements are never cached.

See [Refs](/guide/introduction/managing-refs.html).

## `$options`

```ts
readonly $options: Readonly<Options<T>>
```

A **read-only view** over the declared options. Every property is defined with a getter and no setter, so the value is derived from the element and the viewport on each access, and an assignment throws:

```js
this.$options.open = true;
// TypeError: Cannot set property open of #<Object> which has only a getter
```

Every option is responsive, resolved by walking from the active breakpoint down to the base value.

The one exception to "nothing is stored": a **default** built by a factory lives on the instance, so mutating it sticks for that instance. Replacing the option itself still throws.

See [Options](/guide/introduction/managing-options.html).

## `$config`

```ts
get $config(): BaseConfig
```

The merged config, walked along the prototype chain. `refs`, `options` and `components` merge; scalar keys are the most derived class's.

See [Configuration](/api/configuration.html).

## `$isMounted`

```ts
get $isMounted(): boolean
```

`true` between `mounted()` and the next `$unmount()`.

There is deliberately no `getMountedInstance()`: a caller holding one instance reads this instead.

## `$services`

```ts
readonly $services: { readonly [K in Hook]: Toggle }
```

Present only on a class built with a [service mixin](/api/methods-hooks-services.html). One [`Toggle`](/api/services/toggle.html) per bound hook, which is what `{ manual: true }` is for. Stacked mixins accumulate their keys.

## Fixed, not fields

`$el`, `$id`, `$options` and `$refs` are **fixed properties**, defined non-writable in the constructor. An assignment throws in a module rather than replacing what every other part of the framework reads: the element, the id, and the two live views.

`readonly` states it for a reader with a build step; the property descriptor states it for everyone else. They stay enumerable, so an instance still reads as one in a console or a `JSON.stringify`.
