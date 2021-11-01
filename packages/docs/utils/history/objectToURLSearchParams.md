# objectToURLSearchParams

Transform an object into an URLSearchParams instance to match with PHP implementation of the `$_GET` variable.

## Usage

```js
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
