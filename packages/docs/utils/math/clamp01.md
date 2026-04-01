# clamp01

Clamp a value in the 0–1 range.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"4a9ee952d1bd0200109d1ca9a86eeff80b3b1a233cf66287b0431ec875a73ee4","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEa2YBbLAAYAjIyJtBMRLzCC5AIzLdtug2QA6Ydgoik002QpWUQUCCISIQAYUdZezLzqrJq87FJo+DC8ioDIBMq8pMxgAOYwAHQuaMwpnsjIIBxgANYu+GhoWHCIAPQ1AFZwALRoEBCsxexo6XBoglAScjDZ6bBENYLirHA1csyRNTLySsrp5XKsIAC6W1S9zHZIAJxUrDCpkUgA7FTZpGkMXktOyi5FuIiKVCL4B8xiZGOAF8KOhsB8CMRAbc6I8QCwOFw+M8VmoNFodHpDKRjJizKRLNYsLZ7CjnFQ3B48L5lgEguiwhEojF4olkmlMrccnkCkVSlRypVqnVGi02h0uj0+gMIEMRmMJlMZnMFmTVutNjs9ndHgBWG6Fc4pS6IA13B54NVvcIfABM31+SQB5E+ILBODwhBI5Bh9CYbE4PAcyxUaJCGNM2NxkYsVhsdmDLxclM8Pj8dOCoXCvEi0TiCSSqQyWW5SHyhXC/IIFSqtQazVa7U63V6/UGw2Yoxg40m7Gms3m+EWfhUazQG22uxA+0OpoAHKcjSazQcLU8R69TjakABmB1/Z1IRRAqciaAQokk3jARMrXhAgSkWW8ADkAAFWzK5cx62Km11FT7OAXwAbksSw1UYRR0l1bgQN4OoYhgiCN0YVZYPgxDNxAb8kFAWFzjgCQwDwRoQCBIEgA=="}
import { clamp01 } from '@studiometa/js-toolkit/utils';

clamp01(0.5); // 0.5
clamp01(1.5); // 1
```

### Parameters

- `value` (`number`): The value to clamp between `0` and `1`.

### Return value

- `number`: The clamped between `0` and `1` value.
