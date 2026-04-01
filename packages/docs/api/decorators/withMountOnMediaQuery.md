# withMountOnMediaQuery

Use this decorator to create a component which will mount and destroy itself based on a specified media query.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"192d1f062b9f4213150f7bcc2e527a7d3757dfa08a015c9511667a7e5726ab5b","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8kxsnDy8AGZlYHtVYLwA7kX4ALIQV5oADyYD+MEqzAAimUyBhJABlOT0EZKBzePReSReQzaYzGRheADCvjgiF4mBwECe6IovBqkPJzDAGG45K8ABEYPxbMxcqRJD9xgCgaDwZCYXCAJJgfZPXYwOkIulC/6A2ViiGcSWkDC4kzmKw2OzfX4ijVgrXQ2G6pwuNx4GX7VTvCBgYEAI1UpBIpF4sB5pD5H0CM1C4Ui0TiVASSTJaUyOTyBSKJXKlWqtWY9RgjWarQDvP5cBSqvNIMtEptGH8CUsrA6XRAPT6iAAjABWIYjMYTRAAJjbYbmCw8ZfVFfF2ury3YYFWGxAWx2e2u7Y7JzOODwhF9N3oeCNtnsROqNnnsqcLYYiAA7Lfu6NxgNh/MbyBT9Y3SMGEM56shyXbYg1XA5b03ahzh3K5yBmW4PBYDguD4cdRUrac4WxCQsNUfV8UJCQSWEclKRgalaXpK0mRZNl0S5QM+VsQUzQnTUq2lWUyHlfhFXRHD1E0PEVRYtCp2tOE8MNL8TVQi0xJ1DA7VcdwQCdMgXTQD5PW9X1/W5IsQyCcMkAiKI52jAhEmSBNslyfJCmKUoKiqGo6gaJoWhSQsg2LUsRLkq0FNrNB60bbpZhvNt+wANkfXskEHV9RxAWTJ0Cmc/3nJAAGZNmA3Z9iQTsINI6C9zgg8PCPE1P3PH8rwioqO0A4Ynz7QZqF6N88Fq79L0y1ZpiAldCoHI4mx5WBD2k+xgAo1K2Iw3VeCOZ5NEsXgAHIAAEnIzVzmAyWzkwczaAG4pONE8zz6+wnnWrb/BSXqL2KTJzvMcw6CuvT5TKVh7AW9DxN1RhzF4XgXp/Chwa2yB7EYLBSBgJ51KyZGoDKHioCySwIE0t1uE2mGwG4M6nAOpBQHkEY4A+PBMhAI4jiAA"}
import { Base, withMountOnMediaQuery } from '@studiometa/js-toolkit';
import Component from './Component.js';

export default withMountOnMediaQuery(
  Component,
  'not (prefers-reduced-motion)',
);
```

### Parameters

- `Base` (`BaseConstructor`): The `Base` class or a class extending it.
- `media` (`string`): a [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media#media_features)

### Return value

- `BaseConstructor`: A child class of the given class which will be mounted when the media query matches.

## API

This decorator does not expose a specific API.

## Examples

### Simple usage

```js {1,3-6,13,17} twoslash
// @twoslash-cache: {"v":1,"hash":"acbd1404ac3ffba6e354e71aee4bc60180d0df840af387d01f78df0e25adf04e","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8kxsnDy8AGZlYHtVYLwA7kX4ALIQV5oADyYD+MEqzAAimUyBhJABlOT0EZKBzePReSReQzaYzGRheADCvjgiF4mBwECe6IovBqkPJzDAGG45K8ABEYPxbMxcqRJD9xgCgaDwZCYXCAJJgfZPXYwOkIulC/6A2ViiGcSWkDC4kzmKw2OzfX4ijVgrXQ2G6pwuNx4GX7VTvCBgYEAI1UpBIpF4sB5pD5H0CM1C4Ui0TiVASSTJaUyOTyBSKJXKlWqtWY9RgjWarQDvP5cBSqvNIMtEptGH8CUsrA6XRAPT6iAAjABWIYjMYTRAAJjbYbmCw8ZfVFfF2ury3YYFWGxAWx2e2u7Y7JzOODwhF9N3oeEEwl4ROqNnnsqcLYYh373dG4wGw/mN5Ap+sbpGDCGc9Wd6X2xBquByDpu1DnDuVzkDMtweCwHBcHw46ipW05wtiEgYao+r4oSEgksI5KUjA1K0vSVpMiybLolygZ8rYgpmhOmpVtKspkPK/CKuiWHqJoeIqkxKFTtacI4YaH4mshFoiTqGB2q47ggE6ZAumgHyet6vr+tyRYhkE4ZIBEURztGBCJMkCbZLk+SFMUpQVFUNR1A0TQtCkhZBsWpZCTJVpybWaD1o23SzDebZtouwwPn2g7PqOIDSZO/kzj+85IP+y5AfsSAAMzHKc4Hbh4u7XDBB5wfciE+MeWKyPIqLKAY/G6Oi4kWJJ9hLFQ9pKV4NV+KG1CGSgkamfEFnxhk1nJnZaaOZmLm5m5rQhc2YVIG2uVdlEPaPog0zDSOr7dSZ6WILlmyAbsOUDmBxGQXu5WvowWD8WQmB8O+55fv4PJgE87AhOSwDmLw4O8GAzA1OSpSkHOIQANxgxDrAQMDvAesmMDMsjYBHFeG3tgAHMT969kgABs8Wvv9gMhLO53UwBK63QVW4XKV0HULBICve9dispD0MwLDaDw6MhO9De/ZrJdu0xVMNN4FDNSM6sADsV2s2ukz3RBJVQfuL1vVoH1C2jGNY/kONgFLrb9v2zPRRTF3Kx4lvq0gZMs9luv68VlxPTzFV885hBQF9Z6frK/iWBOEKMNRRAQOwUAKQ6HjlhCvCEBAMRDcEYRGWNsQTXGqTTUmtmpg5GbOdmrn5ik4fQNkecxNkHBPNyGCCDAgX1gAxPHQIQmt14ZZMO0u/tWtHS+eCj+x6dpasEXa37IEB5zRvPUwps4ILfB1ciChojiLW8JizVGMY/gACSW+SjD+G/vRhOSrwxJAXxgMg7Q+A6GMLwFOacM5KQRJYNgrBc4wFYEfCkEBeCW14A5J4TxC4jWMlGculkq42RTPZdMTksw5jzO5OcPQ3gwCyK3JQg9WBD0tlkf6CgGCdFCtLDKlNnZ7T7IdWYi8PBP3Rl7dsmVrrAQGDvR6ZUQ4vXoVHD8F5iiwDhhADAidk6p1Xs4RSeAuQaK0VAXOeQC4GWLqNM6ZlYz4MTIQuaddSFLQoa0eh7dzFd3YD3fgfdhiMKHuo8Wmjx6cPWtwgc/Qfazz7IMBeCVgmaBMeIzsm8bprn7LIw2wcaCh35mbY+PF6ookUE1bCV8b4VLvo/Z+vBX7vzmGSXg39f7/0AdfEBYC9G9TwFAmBcCEFkCQSg9GaDygYKwVYnB40YyTUrg42atcSGLUbstZuVDgg0LobUCOAQ6xMJYWwr8E8ia5TigrV2giP4JVEQzNem1mZZQyQcY4TYeSwDwEaWw9hgBkSSixNCupeBHGeJoSwvAADkAABZxqyCFLLQJCvG5g6DGnsLAeUZRWD2CPH4E80dVFn0aqaYUzFUKiV1IwFGXgKAo0hZAew/MYA91INkUgEIyhcSgHQiA6k3TcEhXSsAfBQafHGcGfgAg3T02vrwMVENhYwyhd9GOSLhWKrqeLWEGqQUovFcvGgUAk7ypRuDcY7AAh3MYJCgAgvwLiWA0AiHjvysAABCSF3A8bgyOOYFGSTQnGtFWaik+BLW1PRjagAqt6OQUMPTDFMRyqAXKc6uo+LwZgTx9j0gnP4L1PqQXmAJlQBuSBQANTAHAD4eBMggCOEcIAA==="}
import { Base, withMountOnMediaQuery } from '@studiometa/js-toolkit';

export default class Component extends withMountOnMediaQuery(
  Base,
  'not (prefers-reduced-motion)',
) {
  static config = {
    name: 'Component',
    log: true,
  };

  mounted() {
    this.$log('Accepts motion!');
  }

  destroyed() {
    this.$log('User enabled reduced motion after mount.');
  }
}
```

### With data option

```html {3}
<div
  data-component="Component"
  data-option-media="not (prefers-reduced-motion)">
  ...
</div>
```
