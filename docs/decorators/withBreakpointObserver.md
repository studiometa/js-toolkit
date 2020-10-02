---
sidebar: auto
sidebarDepth: 5
prev: /decorators/withBreakpointManager.html
next: /decorators/withIntersectionObserver.html
---

# withBreakpointObserver

Use this decorator to create a class that will have the capacity to be mounted or destroyed when the current breakpoint changes.

## Examples

### Enable for the given breakpoints

In the following example, the `MobileComponent` class will self mount on devices matching any of the breakpoint defined in the `activeBreakpoints` property, and self destroy on all others:

```js{4,8}
import Base from '@studiometa/js-toolkit';
import withBreakpointObserver from '@studiometa/js-toolkit/decorators/withBreakpointObserver';

export default class MobileComponent extends withBreakpointObserver(Base) {
  get config() {
    return {
      name: 'MobileComponent',
      activeBreakpoints: 'xxs xs s'
    };
  }
}
```

### Disable for the given breakpoints

The same behaviour as before can be achieved by specifying all the other breakpoints in the `inactiveBreakpoints` property instead:

```js{4,8}
import Base from '@studiometa/js-toolkit';
import withBreakpointObserver from '@studiometa/js-toolkit/decorators/withBreakpointObserver';

export default class MobileComponent extends withBreakpointObserver(Base) {
  get config() {
    return {
      name: 'MobileComponent',
      inactiveBreakpoints: 'm l xl xxl',
    };
  }
}
```

### Extend existing components

You can add the `BreakpointObserver` behaviour on an existing component by wrapping it with the `withBreakpointObserver` function:

```js{10}
import Base from '@studiometa/js-toolkit';
import Modal from '@studiometa/js-toolkit/components/Modal';
import withBreakpointObserver from '@studiometa/js-toolkit/decorators/withBreakpointObserver';

class App extends Base {
  get config() {
    return {
      name: 'App',
      components: {
        Modal,
        ResponsiveModal: withBreakpointObserver(Modal),
      },
    };
  }
}
```

The `ResponsiveModal` registered component will have the capacity to use either one of the `activeBreakpoints` and `inactiveBreakpoints` configuration options.

:::tip
See the [`resize` service documentation on breakpoints](/services/resize.html#breakpoint) for a more comprehensive view of the potential values of the `activeBreakpoint` property.
:::
