# objectToURLSearchParams

Transform an object into an URLSearchParams instance to match with PHP implementation of the `$_GET` variable.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c6d0114bbdc7c5f157512cfc917450bbf5c2947619f81f6330974c76819de654","data":"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"}
import { objectToURLSearchParams } from '@studiometa/js-toolkit/utils';

const params = {
  str: 'str',
  num: 1,
  bool1: true,
  bool2: false,
  null: null,
  undefined: undefined,
  arr: [1, 2],
  obj: {
    one: 1,
    two: 2,
  },
};

objectToURLSearchParams(params).toString();
// str=str&num=1&bool1=true&bool2=false&arr[0]=1&arr[1]=2&obj[one]=1&obj[two]=2
```

### Parameters

- `obj` (`Record<string,any>`): the object to convert
- `initialSearch` (`URLSearchParams`): the initial `URLSearchParams` instance to use, defaults to `window.location.search`

### Return value

- `URLSearchParams`: an instanc of URLSearchParams with the object's values as entries
