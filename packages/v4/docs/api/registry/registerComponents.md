# registerComponents

```ts
registerComponents(...classes: BaseConstructor[]): void
```

[`registerComponent()`](./registerComponent.html) for several classes, in order.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"a8556d85559b7d1a9feb10198ce54f9115fdf688c5db73c1d627bce51c528d71","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGC8pDB+7C5kAMIQ1p2+aHCMAHQzgsLwiA4ww2AupM05tsgAutyLRBDsUOZWNnbdvf25w6NJYBNOLm7RAIwArN6+AUGILwAcYTckWiIB6fQGpBuNjuDwSSSQaRAGSyOUqvzeRRKODwhBI5DC8jwczgIgAgvx+LYoB0wI9wtEAOwMz7+QKeQERKJ4cmU0jUzpODjwxAAJnSmVI2VySAAbJjqKUcRV8dRCTEWBwuHxicoJDI5PRfEoloZtLw9HFTSYTqNznE6c9PB8QD5WT9QtQgVyYva4ckxUiJVK0SLgvLMNiYrjKgSauqsJocHYMHweVSaVNKWBGuw/ItgOZeEXeGBmJYYIs1ok/ABucwFB3uX4vF4s76yjnAomdHN+QWJZIAZnFKOl+XDiqjyqqapAjATWjImD4pfLlbQpGrjdeIoDrvbiA94S7MVX8RdA6Qw8Do5DKQnkfKeJncaRQhJvAAyhxYCqnk33lbF0vjZRAZU7b0QG/I4YwvYVnWRSVUTyOVigVR9oxVaoQQ1eptXfXVVH1eQjUI9RE10E0KLMCxbXsX1nHpJAXhlcDgLdEIIJBBihWSBCg2QpARReB8ykwl8cIXJNly/H8yEzHtc3zQtizPddN38OswAbKh/1eP49xAn42OPSCs17fthTYxDgzyQo0IjMTp1jSTEyXFMSzLCteCrfxt2Yjxr33UCjy9EEz0s5JrIEscRXvBzJyfWDsKJAjeGkaAIAAGSufzRReLx2IPAFPU5EEMqgbLcr9JASpswSwNEpVnxc2pNQaHUlmIw1FDIq1zSoowaNOWx6IkPKRUHNjgvdLi8B4y9EDqmKQ0HJqpxa1VX3nNzkz4CqqpcBTsyU3gCy6VSvPU6stJ0xjHVFN5DI4sC5piczc0i9kbyQsd7KxJzNpS+NdpktSfI3LddKY0UZSCozONKk9wC8r78hHX673WpKsNnXCtQucFrhGaFxkmGZMwIhYlhWNYNjQLZdn2Q5jlos57DBK4hhJsZ7gQaGHpFP5poR34StMkFOYhKFedhODkheAN6rHeKAea5LZ06tM+RpPLBxSZ0Zu+iXuQpdMBRq34lZWvICux8TWvetLoN/PWWLbUCTLCvAXdg3jmOt288n1+3nK2kFOoOnKXD10MPZ+cXvZiKPqvlgOMdsq8/gKbZ0mgMoRvOYAlgoQmuchHmYREAomk0SxeAAcgAARcZp+XLVwAHoACs4AAWgZiBWAAa3YNA+6IYIG608wtbNnXOgNBRjTiM6VKeNB2H4ARFL8Abi/Bhvtf5MAG94Apbtn525NIJfSKWNeLo3red5Ove9APq7G990gz4v+sr7CHSplaO9gSK9QfudIsz9t4fXfmdTya5G4pxcH/S+YBzBS2JrcMmjBj40lLj/UuKC0DcBrE4DuzAkCgHAXAXWMRe4gAKAUIAA"}
import { Base, registerComponents } from '@studiometa/js-toolkit-v4';

class Accordion extends Base {
  static config = { name: 'Accordion' };
}
class Slider extends Base {
  static config = { name: 'Slider' };
}
class TodoList extends Base {
  static config = { name: 'TodoList' };
}

registerComponents(Accordion, Slider, TodoList);
```

This is the whole bootstrap of a page. There is no `createApp()` and no root component: each of these registers its own declared family, and every registered name auto-mounts through the single MutationObserver.

**Parameters**

- `...classes` — classes extending `Base`.

**Return value**

- `void`.

Order matters only for collisions: the first registration of a name wins and the second gives a `registry.conflict` warning.
