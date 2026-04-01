# lerp

Interpolate a ratio between a given interval.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"cdbc493a131354bb999ec0b36d2f1214802746ec64ed2a8346eb119435e86b00","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvVmSyMAtuzCJeYQfIBGZCr3nNaKtZu29SzcREPqtpbleOkAOmHbysEUmmmzKIKBBEERBAASTAaUndWcxheNHxYswteLTQAdxgYKWZeAHN2EiklCKI2ADpfNGZcoORkECxmM3lfRSkAFQTeYrJS1l0lV3VePsEYCoBdCnrG5tb9Xk7YpRJSPt19IfkRtjHJ6Yam5haqJIlFrrOIOOvcmDR9+tJ7wVIwXyWd1jGU+4ysgbZMBQDa0XgiDzPODuYFKXI3UzmCSPEAcMAAa18+DQaCwcEQAHoCQArOAAWjQEAgrHR7AecDQgigEnk92YZVgRAJgnErDgBL08QJMkiZWx8lYIAmUxADKaDEQAE4qDIwLl4kgACxUKqkO4K1E+FVKXCIAAMVBE+COYjISEVAF8KOhsKaCMQ7Tq6AaWBwuHwRXI2vYbDo9AZVNYTFcQ2Q7JGHM5XO5PN5Ir5/IE8GEIlEYnFLkjrql/tk8gUAT01uVKtVajMjicQG0Lstwr02ICtl89lKDrNjvMwZ8Vh3+uHu6Nxn2G3NTkXW4jkpS8vcUc9GW8Pl0p790pkpC3mMDQeDIfAYcy1Qirii0ZiqNjcfiiaSKVSaXSygymSy2RyYC5Hl2D5AVzHwYVZDFNAJSlGU5U8JAAFZtUNNUNUQVDdX1PBA18NFTQAJkta0zFtchzQdGUIVgPBkw8LxgDTLBeAdARSAgbYAHIAAEf2ZTi2RJclKWpWk0G5Xk4C4gBuZxnEDRgLV4ABGZSzTKJDuBk3giV4JDWjZJBQG9LI4Akd5glJEAHQdIA==="}
import { lerp } from '@studiometa/js-toolkit/utils';

lerp(0, 10, 0.5); // 5
```

### Parameters

- `min` (`number`): The interval minimum value.
- `max` (`number`): The interval maximum value.
- `ratio` (`number`): The ratio to get.

### Return value

- `number`: The lerped value
