# Services

Services will help you implement common tasks by abstracting their tedious parts. A service will always have the following signature:

```ts
interface ServiceProps {
  [key:string]: any;
}

interface Service {
  add: (key:string, fn: (props:ServiceProps) => void) => void;
  remove: (key:string) => void;
  has: (key:string) => boolean;
  props: () => ServiceProps;
}

useService(...args?):Service;
```

The following services are available:

- [useDrag](./useDrag.html) to implement drag features
- [useKey](./useKey.html) to implement keyboard features
- [useLoad](./useLoad.html) to implement window load features
- [usePointer](./usePointer.html) to implement mouse/touch features
- [useRaf](./useRaf.html) to implement `requestAnimationFrame` features
- [useResize](./useResize.html) to implement window resize features
- [useScroll](./useScroll.html) to implement scroll features
