# Components

A component is a class that extends `Base`, a name in the registry, and a `data-component` attribute in the markup. All three are needed, and nothing else is.

[[toc]]

## Declaring a component

```js twoslash
// @twoslash-cache: {"v":1,"hash":"10e36fe5935531f44a7fb904ae99b69e8fe7b9b1630ce8873f65221bb05a8f58","data":"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"}
import { Base, registerComponent } from '@studiometa/js-toolkit-v4';

class Counter extends Base {
  static config = {
    name: 'Counter',
    refs: ['output'],
    options: { step: { type: Number, default: 1 } },
  };

  count = 0;

  onClick() {
    this.count += this.$options.step;
    this.$refs.output.textContent = String(this.count);
  }
}

registerComponent(Counter);
```

```html
<button data-component="Counter" data-option-step="5">
  clicked
  <span data-ref="output">0</span>
  times
</button>
```

`config.name` is the name the registry uses and the token the markup writes. It is also what gives each instance its [`$id`](/api/instance-properties.html#id).

## Registering

`registerComponent(ComponentClass)` puts one name in the registry and scans the document for it. `registerComponents(...classes)` does the same for several:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"fd436762ed744f9a9f659fb20894e4bd04c260f2472bb4b082e155ca0bd4866e","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGC8pDB+7C5kAMIQ1p2+aHCMAHQzgsLwiA4ww2AupM05tsgAutyLRBDsUOZWNnbdvf25w6NJYBNOLm7RAIwArN6+AUGILwAcYTckWiIB6fQGpBuNjuDwSSSQaRAGSyOUqvzeRRKODwhBI5DC8jwczgIgAgvx+LYoB0wI9wtEAOwMz7+QKeQERKJ4cmU0jUzpODjwxAAJnSmVI2VySAAbJjqKUcRV8dRCTEWBwuHxicoJDI5PRfEoloZtLw9HFTSYTqNznE6c9PB8QD5WT9QtQgVyYva4ckxUiJVK0SLgvLMNiYrjKgSauqsJocHYMHweVSaVNKWBGuw/ItgOZeEXeGBmJYYIs1ok/ABucwFB3uX4vF4s76yjnAomdHN+QWJZIAZnFKOl+XDiqjyqqapAjATWjImD4pfLlbQpGrjdeIoDrvbiA94S7MVX8RdA6Qw8Do5DKQnkfKeJncaRQhJvAAyhxYCqnk33lbF0vjZRAZU7b0QG/I4YwvYVnWRSVUTyOVigVR9oxVaoQQ1eptXfXVVH1eQjUI9RE10E0KLMCxbXsX1nHpJAXhlcDgLdEIIJBBihWSBCg2QpARReB8ykwl8cIXJNly/H8yEzHtc3zQtizPddN38OswAbKh/1eP49xAn42OPSCs17fthTYxDgzyQo0IjMTp1jSTEyXFMSzLCteCrfxt2Yjxr33UCjy9EEz0s5JrIEscRXvBzJyfWDsNqTUGjBK4hhGaFxkmGZMwIhYlhWNYNjQLZdn2Q5jlos57AyiEoTGe4EF0pjRReD1gp+f4uLwBrrmy5rYTg5IvBvJCx3irEnOfFyiQI3g0z5Gl/NFQcgqM9lPU5EFlv5Wk/W2mzBN+eyZqVObVVfHVZJgv92tDLqtrAvqYmg39IuOmK0UHe9tnSaAylOWx7GAJYKAucFBtuXLeAKJpNEsXgAHIAAEXGafly1cAB6AArOAAFpyogVgAGt2DQImiGCFGtPMW79ppA0FGNOJeALLofNcNB2H4ARFL8c1Oc8tdUeZzoUfhrSCkZxaPrIVnSKWTmVKePmBfM3MRfBtTUcV0hpYKWXzHMAasthlrGElsBIcN7gaycHHmCQUASNWVaYkJkACgKIA==="}
import { Base, registerComponents } from '@studiometa/js-toolkit-v4';

class Accordion extends Base {
  static config = { name: 'Accordion' };
}
class Slider extends Base {
  static config = { name: 'Slider' };
}

registerComponents(Accordion, Slider);
```

::: tip There is no `createApp()`
v4 has no root component and no application object. A component is registered, not mounted by a parent, so nothing has to own the page. Register the components a page uses and the registry does the rest.
:::

**One name gives one entry**, as with `customElements.define()`. A second registration under a name already taken gives a `registry.conflict` warning and is ignored.

## Several components on one element

`data-component` holds a whitespace-separated token list, and each token gets its own instance:

```html
<a href="/next" data-component="Action Analytics Prefetch">Next</a>
```

The three instances are independent. They share the element and nothing else.

## Nesting

Children are not constructed by their parent. A nested `data-component` is discovered by the same registry, on its own:

```html
<div data-component="Accordion">
  <div data-component="AccordionItem">…</div>
  <div data-component="AccordionItem">…</div>
</div>
```

What the parent declares in `config.components` is a **family**, and it does two jobs:

1. registering that family when the parent registers, so one `registerComponent()` call covers a whole tree;
2. giving the name set that [`on<Child><Event>`](/guide/introduction/working-with-events.html#child-events) resolution needs.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"def6ae07ca251473b051c8707384c919307afc9eee5a3f23112c7e80bd3d0cc5","data":"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"}
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

// Registers `Accordion` *and* `AccordionItem`.
registerComponent(Accordion);
```

A value can also be a thunk, which makes the child its own chunk:

```js
static config = {
  name: 'Accordion',
  components: {
    AccordionItem: () => import('./AccordionItem.js'),
  },
};
```

The key supplies the name, so the registry knows `AccordionItem` with nothing downloaded. See [Autoloading](/guide/going-further/autoloading.html).

::: warning `config.components` is not ownership
Declaring a child does not make the parent construct it, does not make the parent's unmount unmount it, and does not restrict where the child may appear. Nesting is DOM ancestry, always.
:::

## Finding other components

There is no `$parent` and no `$children`. A component that needs to reach another one has four channels, in order of preference:

| Direction               | Use                                                                              |
| ----------------------- | -------------------------------------------------------------------------------- |
| parent → children       | [`$watchChildren()`](/api/instance-methods.html#watchchildren) or `$query(name)` |
| child → parent          | [`$emit()`](/api/instance-methods.html#emit) and the parent's `on<Child><Event>` |
| ancestor lookup, ad hoc | [`$closest(name)`](/api/instance-methods.html#closest) — guard the result        |
| shared state either way | [provide/inject](/guide/going-further/sharing-state.html)                        |

```js twoslash
// @twoslash-cache: {"v":1,"hash":"385947c5edee282add9a0c472aa88b832bcb242b77a59d65e5c5d34f467b6e2d","data":"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"}
import { Base } from '@studiometa/js-toolkit-v4';

class Accordion extends Base {
  static config = { name: 'Accordion', components: {} };

  // A live collection, in document order, kept for the life of this instance.
  items = this.$watchChildren('AccordionItem');

  closeAll() {
    for (const item of this.items) item.$el.removeAttribute('data-option-open');
  }
}
```

## Page-wide lookups

Outside a component, four functions answer from the DOM. They keep no registry of instances:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"e4dda62159b29f618bed79b002219d3282d60dcc7d41bbf6e254893a67450aa5","data":"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="}
import {
  getInstance,
  getInstances,
  getMountedInstances,
  getUnmountedInstances,
} from '@studiometa/js-toolkit-v4';

const section = document.querySelector('section')!;

getMountedInstances('Dialog'); // the live ones — safe to call a method on
getInstances('Dialog', section); // every one built in a region
getUnmountedInstances('Dialog'); // built, then stood down
getInstance(section, 'Dialog'); // the one on this element, mounted or not
getInstances(section); // everything on one element
```

See the [Registry reference](/api/registry/) for the full contract of each.

## Extending a component

There is no `withExtraConfig()`. To extend a component with a different config, declare a class. `$config` walks the prototype chain, so `refs`, `options` and `components` merge:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"f3e279681bea01ebf1769b0de3f40b389df85ba57455a22ef4d0a77c669ef905","data":"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A==="}
import { Base, registerComponent } from '@studiometa/js-toolkit-v4';

class AbstractControl extends Base {
  static config = {
    name: 'AbstractControl',
    refs: ['button'],
  };
}

class NavigationControl extends AbstractControl {
  static config = {
    name: 'NavigationControl',
    // `refs` merges: ['button', 'compass']
    refs: ['compass'],
    options: { showCompass: Boolean },
  };
}

registerComponent(NavigationControl);
```

To extend a class you cannot edit, do it in expression position:

```js
registerComponent(
  class extends Vendor {
    static config = { name: 'CompactVendor', options: { compact: Boolean } };
  },
);
```

## When a component mounts

By default an instance mounts as soon as its element enters the document. `config.mountStrategy` and the `data-mount` attribute change that:

```html
<div data-component="Map" data-mount="visible"></div>
<div data-component="Chat" data-mount="interaction:page"></div>
```

A component that waits has **no instance**: it is invisible to `$query()`, `$closest()`, `$watchChildren()` and `getInstances()`, and it announces nothing. See [Mount strategies](/guide/going-further/mount-strategies.html).

## Responsive declarations

`data-component` takes one breakpoint-scoped companion, so a component can exist at some widths and not others:

```html
<div
  data-component="Action Analytics"
  data-component:xxs="MobileMenu"
  data-component:m="DesktopMenu"></div>
```

The unconditional set is always active. The scoped set is resolved by walking from the widest active suffix down to the first attribute present, and it **replaces** rather than merges. A name that stops being declared is unmounted and dropped from the element; a crossing back builds a new instance. See [`data-component`](/api/html/data-component.html).
