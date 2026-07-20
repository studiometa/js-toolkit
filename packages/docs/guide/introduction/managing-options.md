# Options

Options let you pass configuration from HTML into your component. Each instance can receive different values via `data-option-*` attributes.

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

Define the type and default value of each option, so that if your component expects a `number` js-toolkit parses the value as a `number`.

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

You can also use a callback function for the default value, it will be called with the current instance as only parameter:

```js {9-18}
import { Base } from '@studiometa/js-toolkit';

class Player extends Base {
  static config = {
    name: 'Player',
    options: {
      type: {
        type: String,
        default(player) {
          switch (player.$el.constructor) {
            case HTMLVideoElement:
              return 'video';
            case HTMLAudioElement:
              return 'audio';
            default:
              return 'unknown';
          }
        },
      },
    },
  };
}
```

### Merging options

Merge the values from the `data-option-...` attribute with the default ones when the option type is `Array` or `Object`. Use the `merge` property to enable merge with [`deepmerge`](https://github.com/TehShrike/deepmerge):

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

Once the option is defined in the component, add the corresponding attribute to pass the data.

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

You can update an option by reassigning `this.$options.name = value`, but treat options as initialization parameters — updating them at runtime is not recommended.

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

---

See also: [`data-option-*`](/api/html/data-option.html) · [Configuration — options](/api/configuration.html#config-options) · [`$options`](/api/instance-properties.html#options)
