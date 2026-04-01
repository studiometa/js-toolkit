# randomItem

Get a random item of an array or a random character of a string.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"a67655b18a9e259d8523c2d49874b8f493b5aa3a8f4e5bfab556606a9794dde2","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvUszBQIAWwCSNBQB4AKgD5G7VXES8NyALq8APrzhpS7MAHNuhjRas27918Nj87MKAA6YOwKWBCkaNKy8sqqlCDyIgiIIADiMJHMUXKKvHowCrwQ/LyypaQyGEWkpdkxvCL4zDJiZEUlWda2DvFozPbJyMggWM3MCvH5CnC8AIIVzFXhbt32ICYUw6QZgqRglGCCrKwbw2j4pBAA7ghUwACiFeEAvkYX1zNlZJc17CUABlM4P88jNIJkpM1KtVal0PAA6dabEAcMAAa3i+DQaCwBgA9HiAFZwAC0aAgEFYaL08OsgigEgUGWY8NgRDxgnErDgeJkOViBXhWIUrHWGxA1maDEQAE4qKwYA5zkgAIwABiofVI9gyeD5MRUBXiqNwiA1IEaY1a5Flzwo6GwpoIxDIvTo0otkmseX0hjhDlM8UlESQADZQ/LFfZlYgAKya5o6j1A41+JAAJiolpaNBtobtDpweEIJHImvdTDYnB4dUUhvU/vsOiBfvcDlcjdMThWHi8chgvjA/iCITCEVrAomVESyTSGVq+tyU3apUhCyWNSyi8K2eY1pXnTbawTAyQQxGYynICBc3XMMbSK2Oz2ByOJ2R50uN3iDyepFeGjvDcq68N8yx/LwgL6CC7BghAELlNCyyHqsiKnCidgYlQWI4viRKkuSlLUmgtJoPSjLMqyMDspy7Dcry0R1qoQpoCKYpUMG0rqhGKJRjG6oJtquopNu9apkOSAAMxZk0OaumaBbUI6xYumW1AVikIhepELY9gGJhBlqXEqgA7JGSr4Eg8bUImwnXvo4mmtJFqyXuuaqiqimYEWKQlq65b0HgWlgN6jaGAEIDMAARiIPgRYZUqqqGzkKhZYaCUmeAPvKaZxjJVruYg+b2kpPnOqWbqBSkLAcFwfCiaoaiyBgza+npniWM1XaGM1I6hOEkQNUa04QEkeDpJkE4+gUB5rkhm5Tbu+7FLCR69P0gzDKMMhXje8zze1j4gNsZEvhQhzHOhn4fD+jw/ABQGfFIYG/ACQIwXBCFQosMIoQiR2olhBDYriiAEsSZIUlSNJ0gyiiUWyHJcjyQ0KCxbEmOKnGqgAHJmvFpYgAk2UJHqo456UuQV8lql5ym+aplUesFoVHuFkUxXFIAJSGRMyilfGWUVGV2dlGEScLVNyTaKqeeKWmwHgo4DbwwATvWvCvPwlyFAA5AAArDFF9PhkNEXoSN0XAusANxBEELM6fovAALy8MguvMLrFC8LrUXe77IgB7rUDBzAwf8LrJh22AqO6Po3A27wBJFEOK7nDAvBEGwgiZ3YkHvfbojae1ru+9FsUDrbQRx42ifJ3iqeZytGe8Aq2JtPn/yNv88RMn0SCgO6ipwBI+wpMSIDPM8QA"}
import { randomItem } from '@studiometa/js-toolkit/utils';

const items = ['a', 'b', 'c', 'd', 'e', 'f'];
randomItem(items); // one of the value in `items`

const string = 'abcdef';
randomItem(string); // one of the letter in `string`
```

### Parameters

- `items` (`array|string`): array or string

### Return value

This function returns a random item of an array, a random character of a string or `undefined` if the array or string is empty.
