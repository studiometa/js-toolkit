# memoize

Memorize the output of a function in the memory cache.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"6888b90ca2c1d1e5f64bd1daf95a296a31bdcb2b387f8bc87d48e165100c7589","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvALYxpEdgC8YAHgAqvOjTBQ4vRgDojzUgHM4iXsIDWkAO5hkAXT4BeAHxWwtiA/eN+MEs1Cl5gGWZaAEFTGFCRZhF8GABpGAx4xOTQgF8AfksAWTkFZQB5LHFJOBUAJRg0QVIwNWxVNXd3bktDYzMLXgAFE2ZZGlIajrdPesbm1px1dwAdMHZpLAhSNBkSpVwqKAgRBEQQYvl93jRk3ghBNCwHu/5eZgFhMQkwA0pqZnMSGQyBAHG8f3waEeFgA9DCAFZwAC0aAgEFY1nYaAMcEaUAkY2YBlgRBhD3YrDgMNkl2UBkh0lYICcTiouJMDEQAE4qKwYGBTDckAB2KhoEyxTkgGmlA6g9hgXCIAAMVCSIzEZCQXJyFHQbTwhBI5DFWjwQlEVSkyWYRAwADFPlbGFgRtJLMwwBhurwwIJpAAjLVs8XbJAANnDvP5gvwSAAjABmMUShqGmC2h1O75/MFKgBMavwGvG2t1+pwhuIweoZrOLrdDTIfFdpFGHq9f3ZYcQAA5VaCY0LEABWFNmNNnVujXMKgtFktaxD5xPl6gGs5Gms0ehMadjZu8fcdjBd0Ocrm96MC4dj/4TqX72eKpDJkDqtua8jcteYSub6sTVrXd633JtSBbN0TzPDkE2VUVBxvONR3HSU8CfXk51fBdP1LRB417X8NwIQC/h3KURGqHYZX2KAAAkMztR1LW+Hp9wKN4vWmX1/SDIDu05eMV2vWMkHzeNUMnaU9mUejGKzFjJGfJUo3fYtcKXcMiP/EjjTIusQBYDguD4GjlBUBs23dTjvV4DweMDMh/ECNioJs7i/Uc0hQnCaRIhiOJeASJJUnSTIQtyDiLllCorRqTy+K6VyrI4z1bPshKyFWdZNm2XZaTlI4TjwaKrhuGA7geJ4dggV53gtL5JF+FNARQEEwWsCEoSwWEEWRVF0UxbFcUEfEIEJYkYFJclKWpGSYHpNBGWZVkQAEhMABYEL5JCRUkqUzLlPMIxwxI8MTZVtKVXTtwMhqrV4G0mOzSRLPbdzLEy/jzwTEc7x20T8LfUM0M3eTmMasBlJOtTF2/RNCL1dcdK3IDyLwSiwFxfLZTkzMIatZLRlSri7M8L6YJ7eNhULRDAfE/a8EOvHnsUqHMJfPtTq/JBLtWyjYDwHKth2Xz5t4HIBFIcbeAAcgAARGsbCT6lE0QxLEyXESlZYAblWVZ7u+R7wZesA3ukPhgFWXheFIBomikfdeAAKhdo83X1sAcgN0QqJx2iGPxs27ID5RGCehTIe4L3VmZoPWchxh8xj3g4V4Da/kJJBQC0fk4BzM5ERAHIciAA=="}
import { memoize } from '@studiometa/js-toolkit/utils';

function heavyFunction(param) {
  return param ** param;
}

const memoizedHeavyFunction = memoize(heavyFunction);

memoizedHeavyFunction(2); // 4
```

### Parameters

- `fn` (`Function`): the function to memorize
- `options` (`{ maxAge?: number, cacheKey?: (...args:any) => string, cache?: Map }`): options on on how to memorize the output of the function

### Return value

This function returns a new function which will cache the first function results.
