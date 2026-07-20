# Services

::: tip See also
For an introduction to using services in components, see the [Services guide](/guide/introduction/using-services.html). For architecture details, see [Service Architecture](/guide/concepts/service-architecture.html).
:::

Services implement common tasks and hide their repetitive parts. A service always has the following signature:

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
- [useMutation](./useMutation.html) to implement DOM mutation features
- [usePointer](./usePointer.html) to implement mouse/touch features
- [useRaf](./useRaf.html) to implement `requestAnimationFrame` features
- [useResize](./useResize.html) to implement window resize features
- [useScroll](./useScroll.html) to implement scroll features
