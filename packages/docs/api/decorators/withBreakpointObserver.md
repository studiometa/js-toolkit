# withBreakpointObserver

Use this decorator to create a class that will have the capacity to be mounted or destroyed when the current breakpoint changes.

## Usage

<label><input type="checkbox">todo</label>

## Examples

### Enable for the given breakpoints

In the following example, the `MobileComponent` class will self mount on devices matching any of the breakpoint defined in the `activeBreakpoints` property, and self destroy on all others:

```js{1,3,7-10}
import { Base, withBreakpointObserver } from '@studiometa/js-toolkit';

export default class MobileComponent extends withBreakpointObserver(Base) {
  static config = {
    name: 'MobileComponent',
    options: {
      activeBreakpoints: {
        type: String,
        default: 'xxs xs s',
      },
    },
  };
}
```

### Disable for the given breakpoints

The same behaviour as before can be achieved by specifying all the other breakpoints in the `inactiveBreakpoints` property instead:

```js{1,3,7-10}
import { Base, withBreakpointObserver } from '@studiometa/js-toolkit';

export default class MobileComponent extends withBreakpointObserver(Base) {
  static config = {
    name: 'MobileComponent',
    options: {
      inactiveBreakpoints: {
        type: String,
        default: 'm l xl xxl',
      },
    },
  };
}
```

### Extend existing components

You can add the `BreakpointObserver` behaviour on an existing component by wrapping it with the `withBreakpointObserver` function:

```js{1,9}
import { Base, withBreakpointObserver } from '@studiometa/js-toolkit';
import Modal from '@studiometa/ui/Modal';

class App extends Base {
  staitc config = {
    name: 'App',
    components: {
      Modal,
      ResponsiveModal: withBreakpointObserver(Modal),
    },
  };
}
```

The `ResponsiveModal` registered component will have the capacity to use either one of the `activeBreakpoints` and `inactiveBreakpoints` configuration options by setting the `data-option-active-breakpoint` or the `data-option-inactive-breakpoint` attribute.

:::tip
See the [`resize` service documentation on breakpoints](/api/services/useResize.html#breakpoint) for a more comprehensive view of the potential values of the `activeBreakpoint` property.
:::
