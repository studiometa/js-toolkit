---
outline: deep
---

# queryComponent

Use the `queryComponent` function to get the first instance of a component matching a given query. Use `queryComponentAll` to get all matching instances.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"ec5cdc11f21bc5719982a5a5219a4cfc620dd1fb2fe083119ff66584916f42e9","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAI6CyGAMIQAtlkkwwaADwAVXnRpgocXgCEuMXgF4zFrebgwACqQhY4APg+NZ8xLzg0UnYwAHMKXjdxSTgAfn8ARTlSDAB5LGiwHn89AB9eYVh+EJgoAB0wdlUIUjQZZMUVNTANBiooCBEERBAAcRg6tHxLYtJA3hDA5lFLCH5eESb1TV4Ad3Yh3iHLUPYSKV8UgDpKECnapABOKlYNUKGkAEYAFio0ZlJQgbxDxuqWzSnDgtJAABioInwH2YYjIVwAvhR0NhcD1CCRyG8DEw2JweAJhGIJAcGkp/q0AIKsVi6fT0DTGWyOaxMmD2CwuNyeby/fyBYJhCJRYlxRINdKZbK8HTIAC6FSqalq9XkZOalOppw6XTw/TqbFYEyy7xmJjmCyWALq602214u32KuOp3ODEQACYAKw3O4PRCPADsbw+XzdIF+auWaCprCBJTBEKhpBhNHIHs9iORODw6LhWPoeEWxoEEAg/gcbIrnPcHl4+UKMGKLSgLveF39nsePrCfoAzMHPt8evxS3GQYh+yBIdDYWmAGyZ6gonPEPPUbE9FgcLh8COW1rsxyH5yuGs8hp8oIhcKRDIi+K8JLyCUi7jluxV0+eOsFIyNkrlJU1TKnu5KAu0nTdH0AxbMMAjsGMdSTCaIizPMixgdaGz4LBOx7BoToYCcVCuk8npBiAtw9vgTyvNQIZDuGpL7uBlHxhOiYzqmTzuoumDZmiq6YuuBY9EW4wGgAYqWcDvken5ch4cqth8bpeuClG+jRiAUW2oZ4FJMljqic6ccms5IAuSJLgJBBCacNCiSAW54ruzGYTGx7HtW3I+BeARXoKt6Sg+T4pC+MRvqy3lfkp8pAUqdSgeqmgxlqkG6jBBpGlMpqROhLFYbacEOgRvzEWcbZqXOGlUfc2mBgO+k9MlUZpTc7GmVOSYpnC/oLrKELQKiICKjUdTAIRkZWhErVWjGvDwgIrjKLwADkAACgSCFAEjKAMzAAPQAFZwAAtGgpasAA1hsa0ANwVBUh2Hbweq4fBiE5ShaEWphazYbwAAGRbFKERxgMw+3WFYNhrdJEBrUDFTiXUI4QCyc2tIw8Olmt3CPWAz2ve92XIdMqFmgV/02jhIOSGDENQ5YsNwwjSMozE+rUgjJg2FjqXUjj7ME6c+3vEgoAGBocDEngp0gPC8JAA="}
import { queryComponent, queryComponentAll } from '@studiometa/js-toolkit';

// Get the first instance of component with `config.name === 'Foo'`
const foo = queryComponent('Foo');

// Get all instances of component with `config.name === 'Foo'`
const allFoos = queryComponentAll('Foo');
```

### CSS selector filtering

You can filter by CSS selector by appending it in parentheses:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"f3fd02d1e8ec769d0602c41c9d0aa7406462ba0c814fe9448373a473e4557cd8","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAI6CyGAMIQAtlkkwwaADwAVXnRpgocXgCEuMXgF4zFrebgwACqQhY4APg+NZ8xLzg0UnYwAHMKXjdxSTgAfn8ARTlSDAB5LGiwHn89AB9eYVh+EJgoAB0wdlUIUjQZZMUVNTANBiooCBEERBAAcRg6tHxLYtJA3hDA5lFLCH5eESb1TV4Ad3Yh3iHLUPYSKV8UgDpKECnapABOKlYNUKGkAEYAFio0ZlJQgbxDxuqWzSnDgtJAABioInwH2YYjIVwAvhR0NhcD1CCRyG8DHhFlk6nB2LAAEYfABiEAg/gcMHsFhcbk8vHyhRgxRaUFO5wYiEeACYAOw3O4PHng6gfL7cs6EmAk0jkiBAkpIADMEKhpBhNHIiAAbIjkTg8Oi4Vj6Ew2JwePV5Ep/q1aY5Hc5XO4vD4Gv5AsEwhEohIsvFeEl5OlMtlbE7qfS3UyCkZWSVypVqrUbSk7c1WqcOl08P1BsMBOwxnVJu8ZpF5ot7St1pttrxdvt0xgTlQuU9nmLbmERS83hLvj1fpnlm0QMDUWqQJDobCdY9LgbqCjjcRTdRsT1ceNlMwQgqqXZo67GcyE2zSpz3hdELyVa9J8L8EhBeLPsOQPvDxSlSC9XVedtSQfUkVXI00Q3TEt3NHoWA4Lg+FHJYAW0alnRjTxvF+L0ghCcJIgyAM4kSBowxI7hjyjOkzw8OMWSvZMqjUNMUNrCdc26PoBi2ItRnGctphEWZq1Q1o1g2fA+J2PYNFbdszlvbleWeJ9e3uV8eSfW9JR+BoxzQ/9UV1IDNQXJ59QAXQhaBURAFiajqYBW0MiT4QEVxlF4AByAABQJBCgCRlAGZgAHoACs4AAWjQClWAAaw2HyAG4KgqcLwt4AsZOLUsJjxYTRN8hUfMkzZmF4BQAGUaoWVguBMAADI4CWJD5moqXd8RlOUFWsVzxM0RgfIVRg2r6j5uB87h0rATLstyxsBLLIrKzmUqKXK+tpOmCYoF4ZqAGIfzALrRBiOozoGmx2KzEaxopRhToPMAZrm05QveJBQAMDQCUkPBopAeF4SAA"}
import { queryComponent } from '@studiometa/js-toolkit';

// Get the first instance of 'Foo' with a CSS class `.sidebar`
const sidebarFoo = queryComponent('Foo(.sidebar)');

// Get the first instance of 'Foo' with an id `#main`
const mainFoo = queryComponent('Foo(#main)');
```

### State filtering

You can filter by component state using `:mounted`, `:destroyed`, or `:terminated`:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"92768d4c989f3b43d7f831ca1550fbfc22577809646249dc946c34a91473d555","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAI6CyGAMIQAtlkkwwaADwAVXnRpgocXgCEuMXgF4zFrebgwACqQhY4APg+NZ8xLzg0UnYwAHMKXjdxSTgAfn8ARTlSDAB5LGiwHn89AB9eYVh+EJgoAB0wdlUIUjQZZMUVNTANBiooCBEERBAAcRg6tHxLYtJA3hDA5lFLCH5eESb1TV4Ad3Yh3iHLUPYSKV8UgDpKECnapABOKlYNUKGkAEYAFio0ZlJQgbxDxuqWzSnDgtJAABioInwH2YYjIVwAvhR0NhcD1CCRyG8DHhFlk6soIMIaFAAGIQCD+BwwewWFxuTy8fKFGDFFpQU7nBiIR6ggDsNzuD254OoHy+XJABKJpTJECBJSQAGYIVDSDCaOREAA2RHInB4dFwrH0JhsTg8eryJT/Vo0xx25yudxeHwNfyBYJhCJRCRZeK8JLydKZbK2e1UunOxkFIwskrlSrVWqWlLW5qtU4dLp4fqDYYCdhjOqTd4zSLzRY2lbrTbbXi7fYpjAnKicp4AJhFtzCQpebzF3x6vzTyzaIGBqOVIEh0Nhmsel111BRBuIRuo2J6uPGsA9EAwMvJlLsEadDKZsdZpQ57wuiE7U+793wHf7n0HIF3QX3h7lNwV2oqrOGpIDqSLLvqaJrpiG4mj0LAcFwfDDksALaFSDqRp43i/O6QQhOEkQZL6cSJA0wYkdwx7hrSZ4eNGzJXgmVRqMmKFVmOWbdH0AxbPmozjCW0wiLMFaoa0awbPgfE7HsGhNi2Zy3ly7aPAAHAKPYvtyryiu+ErsemgL/iCgHTqq6pwvejzwgAuhC0CoiALE1HUwBNiOaG8PCAiuMovAAOQAAKBIIUASMoAzMAA9AAVnAAC0aDkqwADWGwBQA3BUFTRdFvC5jJBZFrwUqaKUEx4sJomBbKAUVNu+KEuVpLktYHniZojABbKiBlcSAXcNlYC5flhV1gJdRfq4B5QJVUxlnMtXkvVogxFN8DfrNsrtYZo7db100/lAg2ZackXvEgoAGBocC+ng8UgPC8JAA==="}
import { queryComponent } from '@studiometa/js-toolkit';

// Get the first mounted instance of 'Foo'
const mountedFoo = queryComponent('Foo:mounted');

// Get the first destroyed instance of 'Foo'
const destroyedFoo = queryComponent('Foo:destroyed');
```

### Scoped search

By default, the search is performed on the entire document. Use the `from` option to limit the scope:

```js twoslash
// @twoslash-cache: {"v":1,"hash":"5b06779dc9684068e8f4b3a792f589956f66c8e4ef2935276ab6254c4e2806ed","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8kxsnDy8AGZlYHtVYLwAjmVkGADC1RsYBGaAAgqxWDI5PQRkoHN49F5JF5DNpjMZGD8/oheKVSOxRhReFo0B84AB+XEARV+pAwAHksGSIGAeLjpMh2uYrDY7N86QCgazQRDWE4XG48ABxWq8NisXiEnpveAkp4CYUgsD2ADuRXwvHG3hC7BIn2x9MC3VmDEQAEYAKxDEZjCYOgDsM168ztIEtQusIp1YuWhNWGxAWx2e2uDsdJzOODwhBI5Bmtw8gmEvDUvVBTh6fUQHoAzC7RuMkAA2b1zBYePOkAtDcNIABMm22pF2+xrieo5xTV3T1EzIBYHC4fGzfgR0PkcOUBk02l4SJXRjMFiD/KWVEl7k8Eh8wmt1FC4Ui0TiVASSTgqQy2Vy+UKxVKFSqNTqDSaLTaTobV6O0AA5QIrN0pjrX1FgkMMQQ7LsYz7RB23tAdMGTDxU2uDN6CYLBVzITA+CbUF/H4VknnYEJcWAcxeCY3gwGYGpcXxQkQgAbnMI4JVcI9ATAGiQnPYIwiQCIokJW8CESZI0kyHI8gKIoSnKSpqlqZh6hgRpmlaKiRNosoexZMB/ASSxxSAkAizte01mmKJXSrRBawves/WM0SENWcso27Xs42OU5B2wy40xuAiPEYIitBIjA+FY9i8TQAlRkLW0kHte1Blcyt3Rc2ZYI8VLcFbRDEBc6Me1jA5JkwoccJHGK/UYH9CCgMj8x1fxLAgV4aCgRhuFxIgIHYKBspA3LJkC4YiqQL0vLKkBBuGmAZqq1ZVrqkKDnbZrItw0caFiqNWVKZ48kfedUVXEwuVm4t23bValqgmqYIbEAnju/yBmQ+rUKck6LjO9q7inR4A0BINtXBSEUQkVHVDRExMQDDiMq44lSXJKleFpP4mQs9kHs3dEuR5Xd7HhrVRUhASpQ8WV7AVJU2WCVURAgDUqMR0FeH1cYjXwE0zRGAU/nPByO1LFyvvc+1VtKv7GeFkMWd24GgpQuM1Yh4dovwjqEpwOxkpJwVyfJfwnk0SxiYACWkABZAAZABRYYah1XgAB9eAAEVcMoA/sEPXlgGiQR2+ycrQ6t7Ug9ySp9P6neqIHDhBw6pia8KsMhtrzcI4jrb4ZFHq3fwABIYFYXF3e9v2YCj3gADJeAYz5mIAfUHgAjCRh+Jj3mkkTiiQRYPeFMMdSEsQlmBGpfjF4sB+IPQS8GkSXeE0CB7GbzuKKCS8pOvWT4gUx8lJfVT3w0r9tN/fT/1aZVef4GAsiWxIuweAVk0A2QAMTNw6F0JOc00Iek7IVb6gUNZ+ibuKPW+cDagzjI6BMsCqKwDwLyWw9hgAImJFrYEzNFRHGeM7XgAByAAAp+LSP5mDPhUm+IoTDt7mFnCIcigdFyKGXKoPujF0rr3YPwTUJkQjrikQPJiFVcRMJEWgJhFBpFHAEQPTaOptpjRUcxXgaReAMjAKwDAvBfS8AAGJ5G5iqf+IhlTTW8OMdgIghY0J1EwkQ58o7SKYsZG6AMIC6FlvSBGATkasEYEw5xEAdF9wYdUXEPiAgYN4Ecbg28mJHD4k4ThSBQBiLgB8PAmQQBHCOEAA"}
import { Base, queryComponentAll } from '@studiometa/js-toolkit';

class Parent extends Base {
  static config = {
    name: 'Parent',
  };

  mounted() {
    // Only get Foo instances inside this component's element
    const foos = queryComponentAll('Foo', { from: this.$el });
  }
}
```

## `queryComponent`

**Parameters**

- `query` (`string`): a query string in the format `ComponentName(.cssSelector):state`
- `options` (`{ from?: HTMLElement | Document }`): optional scope for the search (defaults to `document`)

**Return value**

- `Base | undefined`: the first matching instance, or `undefined` if none found

## `queryComponentAll`

**Parameters**

- `query` (`string`): a query string in the format `ComponentName(.cssSelector):state`
- `options` (`{ from?: HTMLElement | Document }`): optional scope for the search (defaults to `document`)

**Return value**

- `Base[]`: an array of all matching instances
