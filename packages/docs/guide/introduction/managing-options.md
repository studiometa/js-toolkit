# Managing options

## What are options?

An option is a way to pass data to a component from the HTML template.

Options are also a way to configure a component's behaviour at the instance level, since they are specific to each instance.

```js {12-13}
class Foo extends Base {
  static config = {
    name: 'Foo',
    options: {
      isActive: Boolean,
    },
  };

  isOpen = false;

  mounted() {
    this.isOpen; // ← instance level but shared by all instances
    this.$options.isActive; // ← instance level, can differ for each instance depending on the HTML
  }
}
```

## Defining options

The [`options` property](/api/configuration.html#config-options) of the static `config` object should be used to define what options will be available in the component.

It is possible to define the type and the default value of the option, so that if your component expects a `number` it will automatically be parsed as a `number`.

### Available types

- `Boolean`: `data-option-bool` and `data-option-no-bool`, defaults to `false`
- `Number`: parsed as number, defaults to `0`
- `String`: parsed as a string, defaults to `''`
- `Array`: parsed as an array, defaults to `[]`, default value must be defined with a function
- `Object`: parsed as an object, defaults to `{}`, default value must be defined with a function

### Defining options without a default value

```js {6-9}
import { Base } from '@studiometa/js-toolkit';

class VideoPlayer extends Base {
  static config = {
    name: 'VideoPlayer',
    options: {
      videoId: String,
      muted: Boolean,
    },
  };
}
```

### Add a default value

```js {6-11}
import { Base } from '@studiometa/js-toolkit';

class VideoPlayer extends Base {
  static config = {
    name: 'VideoPlayer',
    options: {
      videoId: {
        type: String,
        default: 'dQw4w9WgXcQ',
      },
    },
  };
}
```

### Merging options

When working with `Array` or `Object` as option type, it can be useful to merge the values from the `data-option-...` attribute with the default ones. You can use the `merge` property to enable merge with [`deepmerge`](https://github.com/TehShrike/deepmerge):

```js {10}
import { Base } from '@studiometa/js-toolkit';

class VideoPlayer extends Base {
  static config = {
    name: 'VideoPlayer',
    options: {
      styles: {
        type: Object,
        default: () => ({ display: 'none' }),
        merge: {
          isMergeableObject: (object) => object[display] === 'none',
        },
      },
      array: {
        type: Object,
        default: () => [1, 2],
        merge: true,
      },
    },
  };
}
```

The `merge` property can either be a `boolean` or an [option object for the `deepmerge`](https://github.com/TehShrike/deepmerge#options) function.

::: warning
The `merge` property will only have effect on options whose type is `Array` or `Object`.
:::

## Using options

Once it is defined in the component, it is possible to add the corresponding attribute to pass the data.

- The format of the attribute is as follow: `data-option-<option-name>`. the `<option-name>` should be in kebab-case.
- The variable name will automatically be converted in `camelCase` in the component. (`optionName`)

```html {2}
<div data-component="VideoPlayer" data-option-video-id="dQw4w9WgXcQ">...</div>
```

```js {15}
import { Base } from '@studiometa/js-toolkit';

class VideoPlayer extends Base {
  static config = {
    name: 'VideoPlayer',
    options: {
      videoId: {
        type: String,
        default: 'dQw4w9WgXcQ',
      },
    },
  };

  mounted() {
    this.$options.videoId; // 'dQw4w9WgXcQ'
  }
}
```

## Updating options

It is possible to update an option by reassigning its value but it is not recommended as they should be used as initialization parameters.

```js {15}
import { Base } from '@studiometa/js-toolkit';

class VideoPlayer extends Base {
  static config = {
    name: 'VideoPlayer',
    options: {
      videoId: {
        type: String,
        default: 'dQw4w9WgXcQ',
      },
    },
  };

  mounted() {
    this.$options.videoId = 'foo';
  }
}
```
