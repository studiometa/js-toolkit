# isFunction

Test if a value is a function.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"2b220ed2c9750a16ba155094da2d73d0a8bbd87a8b427a42a71bb8bd65b446fc","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpe7OADEArmH5p2QxL0ZE2UmEpkBrSAHcwfALwA+XqtbqxcXtNnyhAHTDsAtlgilR423IVhKIFAQ/AiIIAAq8F4AZrxo+DC8AObsJGBmaonivMy80TK+QgB0AWjMSaHIyCAcYFoB+GhoWHCIAPRtAFZwALRoEBCsWuxoRSJSUAouMGVFsERtUvKscG3ia5IF9mBFjS6sIAC6h1QizJ5IAJxUrDBgSfFIAIwADFRlpEkzeN5bfgG1XCIN4gfj4c7MORkK4AXwo6GwQIIxGh7zoDDCLA4XD4vzsfhUmU0dT0BiU5ks2R82ycrncnis1P+VCCITwkREYli8USKTSGQsWWsuXy+OKpXKlWqtXqVEazVaHW6fQGQxGYzQEymM2YcxgCyW7BWGw2TOKewOx1OHwxADYQbd7o9EK93ucvhiQHjCv4buwwECAExUMEQqHkYFwhE4PCEEjkNH0JhsTg8Rl/ISEwXEnQQfTccmZKw2DNgWluDxeTZi32BYKhCJRLlxBLJVJ3AWU4V5UslN0VJBVGr+2UEJotdpdXr9QbDUbjSYQaazeaLZardbe7a7ND7I4nEBnC6IS4AZhudwe+GeII+Hp+1Z9AP9QPPoPBpEhNAjLxhB8EsA/BWDLAOmNa8DCeSkEuvAAOQAAILtqZRTiqs4jGuRpwLBADcTi0o+2yMIwRimLB0QDLB3A4bwHRxKQ6gEWaYCMORlHUbRbR5GwcC4FQy7MEgoDonccD/GE3QgDCMJAA="}
import { isFunction } from '@studiometa/js-toolkit/utils';

isFunction(() => 'foo'); // true
isFunction('foo'); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is a function, `false` otherwise.
