# randomInt

Get a random integer between bounds.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e039f29090462961e03b2bd9b7aba2dcec761460fdf41b944023b523905e2656","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvUszBQIAWwCSYNC0S8wghQCMyFXjoD8GrbrLdT2vaQA6YdgqwRSaabPnLVlEPJEJEEABxGDdmdzlFXnZVGABzMkNQgHcYGCkdCGEoBCo0ZjiA5GQQLGYZBR9wgDF2Ujg3TOyAOhAAXQoSsoqfHV4AZRgRSShDLLlWjpLSUMFSMB8AQSkYmgTSJLRU9N4AA2Zd3g89nV2AbnbOkA4wAGsffDQ0LDhEAHo3gCs4AFo0CAgrFu7DQzQagigEgUoWYzVgRDegnErDgbxkkS8oMeClY7Q6IAa5QYiAAnFRWOk4mh8EgydRygliSB0Z4VAxyTFcIgAAxUET4crMMRkWkAXwo6GwXIIxBFeToTJYHC4fBZijZ6k01n0hhMWvMpEs+ps9kczlcEVZ3iofgCwVCR0tUVW8USei2aQy4xyPnyhSQxVKgsqVBqdQaYxaly6wd6AyGI0jE2jzNm8yWK1i6022yk+0Ox12pwuU2uMXuVEez1eH2+fwBQJBYLQEKhMLhMARSPYKLRHnVqma2NxbXxhNcSAArHSKWAqTTSXkGaE8GrMT4blyAEx8gUyYXkHniyU4PCEEjkeX0JhsTg8J2YzVmGwGYxWA1G59kU1OFxuNdsj4tp4CEYQPtEWZuiknpJj6S7+igMY9KGvC1PUjTepMVzdMwIYgH0gzDHIsFYdMaYLFQywQWsUEejs+ZHMRRbnCmNwVgQTwvO8Xy/P8gLAqC4KQoo7bwoiyKogBg7DniVDjsSACM3KTuSlLUrSS6kIyq79uuHJgFyADMu6CgeSDcqK+LDLAeBmn+vDAA+bK8KKAikFEADkAACQltvkPH1vxILiT2cAeWc9j2FJahKdwZy8B8jHUa6GzurmvDcoxoxKVFukaluvK8LF8WJbIyXZmlMFKVlvAFT40L5EgoAKukcASAsgTfCAoqikAA="}
import { randomInt } from '@studiometa/js-toolkit/utils';

randomInt(10); // an integer between 0 and 10
randomInt(20, 10); // an integer between 10 and 20
```

### Parameters

- `a` (`number`): lower bound
- `b` (`number`): upper bound (default: `0`)

### Return value

This function returns a random `number` between the `a` and `b` values.
