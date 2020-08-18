---
sidebar: auto
sidebarDepth: 5
prev: /abstracts/BreakpointManager.html
next: /components/
---

# BreakpointObserver

A component based on this class will have the capacity to be mounted or destroyed when the current breakpoint changes.

## Examples

### Enable for the given breakpoints

In the following example, the `MobileComponent` class will self mount on devices matching any of the breakpoint defined in the `activeBreakpoint` property, and self destroy on all others:

```js{7}
import { BreakpointObserver } from '@studiometa/js-toolkit/abstracts';

export default class MobileComponent extends BreakpointObserver {
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

```js{7}
import { BreakpointObserver } from '@studiometa/js-toolkit/abstracts';

export default class MobileComponent extends BreakpointObserver {
  get config() {
    return {
      name: 'MobileComponent',
      inactiveBreakpoints: 'm l xl xxl',
    };
  }
}
```

:::tip
See the [`resize` service documentation on breakpoints](/services/resize.html#breakpoint) for a more comprehensive view of the potential values of the `activeBreakpoint` property.
:::
