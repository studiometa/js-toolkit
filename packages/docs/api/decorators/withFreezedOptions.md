---
outline: deep
---

# withFreezedOptions

Use this decorator to transfrom the `$options` property to be read only. This can help improve performance when accessing options in the [`ticked` service method](/api/methods-hooks-services.html#ticked).

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"d162b66715653d4fd1863bfd8e99b147b29beaabaa02811eddc136182f1fe966","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7s0+AGKkYMAF4woAeSzjJcADwBlXnRpgocXgCEuMAHyMbcGAGFWXOIl6YcEftdtuLycYABEYEQhSZjQo/QB1OUVlNQ1tXTA4AEkwGlJ+ZhEYCl5DOwAdMHYAWywotBkkpRV1LR0JTMoQKAgRBEQQZtTvfBheAAMAEgh2vXHeLFIZskxvCF4axeIxnHyo6uZRGAA6LrRmAHN+5GQQDjAAay78NDQsTwB6D4ArOABaWIQVgPOTHOBoQRQCTVGDnY6wIgfZhYdgfWCRaKxUhwD6yeRDVrpDpwY4vaqsEAAXUpVHBzFIDEQAE4qKwYGALvIkABGAAcVHOpAusLweOSLTSs06rPYYFwiAADFQRPh6YU8kgmQBfCjobDygjbcgC0xMNicHi8ETuOCWQwcWCkfQAFRM9HZFgCzgACkt3rwALxemC+mZwCpVWr1UoOshdHp9PD29iOq02klnS7XW73J5UF5vT4fQTsMEQqEQGFwhEfSJRuW5HHJx0fKkUW6xHpdZjc7kYKk0kB0hlIADsSru7M5+CQADYBfThYyQM24zK5TzlaromI48ydXqcHhCCRjdRTQNrR4YymyIl8SlCVKELTBYzuQAmAAsrKnXMQ34LkKIoDKupD3uKqRtBkL53LK8oAMxbmqu7kAB3IHtQ+rHkaZwXiALAcFwfBigSkowfoISUbYobvHYDghG4HheD4MB+MGQTBuEGIxHEEFkdBxI5HkBRFCUVEhLR4YRps0akY+5HEvGvT9IMCkjGMUwzDB8xbLsqyxBstRLCQCxkPw+yHEUpwLlcSA3HBjzPK87yIF8vwAhAQIgmgZaQtCsLMPCMCIsiqLolEvHYriTQKYJeikmg5IDq+9LvgArKOv4cv+fJAUuoqxRK8XSo5iHITuGqIOlX6YaxOGnnh9BmkRlpXraN6Oi6bpmJ6kl+pYQb9WGMlRgynVrt0KlJrGpBph4NnUFm9k5rKeYEC5RYln5FZVkFNZ1nUDZoE2s2tjSHbQBA3a9v21KpSOiDcqOLKTjlM6IPOS3AcuYFdPc8o/iAKooVVH5aoOkSwHgsnjcAjQPsVRJ6LwWoCEs1S8AA5AAAuC/mVoFPz/ICwJyFjADclSww08Ngaj6OVtjePlgF5zFuwlOVJUdB1ONsAFIIrANO1dqzfxcXI5kPUepY8lI8+jCVLwE2kBQlR8MAWpdHtSCgKY7JwB0eC/CAWpakAA="}
import { withFreezedOptions } from '@studiometa/js-toolkit';
import { Slider } from '@studiometa/ui';

export default class SliderWithFreezedOptions extends withFreezedOptions(
  Slider,
) {}
```

### Parameters

- `BaseClass` (`Base`): The class to use as parent.

### Return value

- `Base`: A child class of the given class with the `$options` property freezed.
