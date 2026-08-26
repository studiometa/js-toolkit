# TypeScript

`Base` takes an optional props type. It types `$refs` and `$options`, and it checks the event names and payloads of `$emit()`.

[[toc]]

## The props type

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"bf68bbb1189541be410c547bd2f54d205cec50e33cddddcc6dc17ccc0c27903a","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"3049fc55555ee63af62ce243ac68305a2d5ce88ebd8a6f514cde5fb5f1492a79","data":"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="}
import { Base, type BaseConfig, type BaseProps } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"8fb46a6401950bc407bcad04d23436b6283f7152c1c2b35a361ae809681bf185","data":"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="}
import {
  Base,
  type DelegatedEvent,
  type GlobalEvent,
  type RefEvent,
} from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"575371f7f00dc8586f215abf918bb212a0962a27d14c61309e84bc8aad72b0a0","data":"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="}
import { Base, component, on, type DelegatedEvent } from '@studiometa/js-toolkit-v4';

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
// @twoslash-cache: {"v":1,"hash":"ea49f1b17a0644249e77aa8bfc34eb7dc11dff42abfd65a1797fd82177f22b7d","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XhnR4AM3uPmOAGEImD2ClzFYbHYHDBYWB4SknPNFogAExXLLrTZIACMRL2BwYHhhcIRTmyXyJNzuDzISEJbw+ODwPw5u3+HkEwl4AEEAEadUj3NAYtCaVg4vY0gDsO2JYA2W0QZIArLsFtS8JLpbL5YrGWcvvjrrcZeyngA2bnUT584gC6hCkAsDhcPgi/xomRyehxZQGTTaXh6Y6GbRmCzhVHHJwuNx4Lw+IMBIIhfhhGyRaJhhQJJKpdKZbJ5KgFIpwUoVaq1eqNZptDrdXr9QbDUbjSYzOYq5YADlWJJ1Gqph1pEit5wJdrZjyQAGYLq7MLzvp7yIL6EwsNGyJg+KaFeaIgr6vFC5iEYg0RiscqFjSyWSNWstaTECdQ19nnEBH3fU5lw3VcHXXZ4d3dfdfiPGlfUBAMQWiMgIX4KEJDfBEkRTew6SfbFR0/cl8VtTVtXJSkjVA0iIKya1Nxg2UOV1VUEL3AgDz+Y8PEYU8tHPDA+GYhF4jAZhLBgF9pTOciQFxL9WjJKd/xnYDjQ8WT5KXL4NVZWCuNaXivn45DvSE31RJwOwJNfekUniUgYDBOAAH5FIVZTkCmXgAB9eC6RRPOtKAPzxMlVSJP86MQWdGNQjyvKMpADTA+1OKeCzZjA6ArORWx7GANEKF4Xc8NUAiUl4F5eDBTRLF4AByAABToej6eTkhbGo6gaJoWladqAG5zHMXNxSla8HgteoywjNFeGAcxeF4eY0HYfhQjIl8pIavQNrALatoMhSOqvWCltYdqKE2i70qbXhkHaiUukKCJ2tmZ6XimsAXicfrmCQUBYjAOA+jAPA0AQF4XiAA==="}
import { Base, type BaseConfig } from '@studiometa/js-toolkit-v4';

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
