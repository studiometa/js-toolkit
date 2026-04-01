# data-component

Use the `data-component` in HTML to bind a JavaScript class to an element.

:::tip READ MORE

- [Configuration: `config.components`](/api/configuration.html#config-components)
- [Guide: managing components](/guide/introduction/managing-components.html)

:::

## Simple usage

The framework will find and mount components on elements matching `[data-component="<Name>"]` where `<Name>` corresponds to the component's `config.name` or the name passed to `registerComponent`.

```js twoslash
// @twoslash-cache: {"v":1,"hash":"1866d71daf94f1b60754eafba07c6671c574d43767130b8da1e8ee0601f3172a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvUjADm7ODVIBhCAFsskmGDQAeACq86NMFDi8AQlxiqwi0oLERSvALyXrt+47TOAfIxOpIi8hgA+vAAKpOoKMAZ+FLxgzGowAPKkAMowrDBBAPwh9uxgstwh0bFw8QCCAO7M7DRQugCSdmjMojD62PH6fn7IALp+ADpg7BrOaNJyCkqqM2DaDFRQECIIiCAASguKZLyyrBAARmysGLzdULxqEMJzzCfsJFIi6pqrOknOt14WBiaji8zgEFYRFKsl4vkBXxWawAdJRqMxZDtkMgQBwwABrNH4NBoLBwRAAegpACs4ABaXyQ/HNZGKQRQCRpLrI2BECnMLDsCn4XI4UhwCkyeRHFTfLQ6ZHEtSsEAjCg4rDMUipNFBUIi3iIn5rQ2Sbx6gGvYHVGDgyHQspwiC8Fmq9UgTXatRolJpTI5PJ6/QG322gE1QO+FzwwQ1e78AFofAKU1IhVunEyNCCUhgNG1IEgsEyCFQmFO25SLXam4QfgPJ46GD3I3yualRTdETwVEjNUgTukBiIACcVDyZSTSAAjAB2KhdUiyGDDkBSxZkZbGnRovG4RAABioInwWuYYjISBHAF8KOh+nhCCRyAvjHhppoh7wt220YPhwAbPOuLaLIU6jguWrLquP6/OsuKlPu07Hqe2oXuQiCzre944I+xCXq+9DvjMX7pEmm5ynBf6LsO04HsBE5gfgM4ACyQUuK54GRIqymm8F7kgABMKFnuhSBYXe1APrsT4EdQb67CwHBcHw64yrBay6N0GABEEITaUkob+rk+RRkUvAlGUFRREWNRaWAGCjBMUwkXMalLJRaxops2x4Ac0pKCcZyXKw1yVvcjzPIC8gfKm25oP8LhWrZtolva5bwq8rZwaikGYkg2IIQSRIkmSlI0vSjKsMyaCstmHLqCuzA8jAfICkKIqsGKEruRRfGKmgyoZh6Z7eseUb6ra2Uml8nQOBaSWFjadplo68KumqGqjT6qQZNkJlBiGu28OGB0TTGcYCImybmNN6abWuK45nmVAFtaoI1CtDqwplVakDWJ31pFTYtp5Ogup0XY9qq/b/jOACsyEgZOzGIHO7HQXgvW8fFu6IUgbEgCeolKEgB7YVJuEyfhL7yURuwfrM35g/BcNowBY7I0xV4Y5xuwaTu4744ghPE2hpNowAHBTmBUwQNNojQ9MgEpnA8PMAV9fF9k6YEUb6Q5hm7cZkbOOZlnlJUKU605kyM1+2MC/BPk7PshyBacFxXDcdwNlFrwxdocVtolgLvcW8DpWtzpZSzuXovlKA4nihJUMSpLklStIMhATIsmyDVcs1vL8oKwqimQPXu1rbYDUND2ejq40AsGU0s6ac0+AClpLR9qWR6tP3Oht7qN2N4DG/tpsuK3yTHad08VrGzZXdGN3Bzlw1Zs9+a9xHpbfRW3S3P9zC1kDjYtBvJodl0PRwL2sM0TOktI4x4Ho+iHGro7LN46sSB4YiXFpeQ8MtpLy2fIrBSIB7ZzG4jXKiVA2bThHJzd+qNpyE0XJjXYCCca/iFgAxAQCiaoXPBLac0t+xfFgMRT8cxgAaw3AQuCvBrwCBBLwAA5AAAQLpyJqFUc55zQNwgA3HbVyzM+KcPUDw5EFInbIlpBIqRDDeD4KdnItQCiKRaLjqoyRYBJi/z4owJ23BjFmPiowAxfEkjcOULGXwagAByu1uFWLREXJAoBjDaDgBIPMuxaQgGvNeIAA=="}
import { registerComponent } from '@studiometa/js-toolkit';
import Component from './Component.js';
import OtherComponent from './OtherComponent.js';

registerComponent(Component);
registerComponent(OtherComponent, 'CustomName');
```

```html
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>App</title>
  </head>
  <body>
    <div data-component="Component"></div>
    <div data-component="CustomName"></div>
  </body>
</html>
```

## Prefixed HTML elements

In addition to resolving components with the `data-component` attribute, the framework will look for prefixed HTML elements (the default is `tk-`).

The previous HTML example can be rewritten to:

```html
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>App</title>
  </head>
  <body>
    <div data-component="Component"></div> // [!code --]
    <div data-component="CustomName"></div> // [!code --]
    <tk-component></tk-component> // [!code ++]
    <tk-custom-name></tk-custom-name> // [!code ++]
  </body>
</html>
```

## Multiple components on a single HTML element

Mutliptle components can be declared on a single HTMLElement by declaring multiple names in the `data-component` attribute separated by a whitespace.

In the following example, both components from our previous app will be mounted on the same element.

```html
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>App</title>
  </head>
  <body>
    <div data-component="Component CustomName"></div>

    <!-- Or with a prefixed element -->
    <tk-component data-component="CustomName"></tk-component>
  </body>
</html>
```
