# importOnMediaQuery

Use this function to import components according to a specified [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media#media_features).

## Usage

```js {6} twoslash
// @twoslash-cache: {"v":1,"hash":"7c63cfc654c6a29339e88f1231bbd0bc527a08a6bea84bbe1c50d8253e5f87ba","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvdgFssEUmgDyYALIwonAIqCyGADwAVXnRpgocXgCEuMAMKS4aUoLELeAXmu2HYJy7dSAD5GfjBEXkY+DyDeAAVSCBl2OBgjXgAfXmAAHSleAth+ZkFWNAjDAG48gF8gil4ZDU4I/3YwAHNuCISklLTDILzZeUVpOQVlNWbmHT1KECgIEQREEABJCbHmXhEk+TAYMDReAHd8I94O9hIpJs0dgEddUgxpS2ddADoFtGYO1bIZDUGByVjMGgLYA2VK+fyuNAKGq8QwgAC6FGBWGYpGYMgWYQKKIu41GJyEonEkh+GKxOLxC3unCJhhJTKeLzeYDxMF4zHMvCIbF0kVSvPwaDQWDgiAA9LLYCRWBAcKQvjIIAAvdiscFfBQdWVHAC0AFUAMoK5ZwWUAdRgACNZXZzZaAALsgDE7IA+vwYBDBKR4Nx0ZiQMG0EGwJQwKVWLSQBwwABrBYSqUy+UAKzgxsREFYKfYaC+TkEmiSMD+X0VsuYWHYsourFVNpGkxU6gec1eXwlMlY6IxICcOIYiAAnFRWEcOmh8EgAIwADiof1IHWreA7ii7M17GAWydwiAADFQRPh6WIyEhJzUKOhsKeCMQ7+vTEw2JweKTO9MPacvo/IYCEYQRFEnixL0ySpCBYBgQ07KtM47RdD0iRwWkoFDGAu4nAR+5AfMVBLCseCbGSfK7PskhHCc5yXNctyNDMvDPHo7y8J8MA/Ou/yAsCNBghCuBUNCPiOJ8gTIqiibYri+JUISBSsryBECMIYgSGANLhopDJUOyLJsuxnGvLw3JNHyApCqwIqMGKvAZtKcoKjASoqmQ6pajqeoGkaYBmpa5E2vaTouu6Xq+v6gbBjwYbApG0axvGibJmmVCuVmsq5vmECFsWpblpWTQ1nWDZNi2baykRgHaJy/ZoIOw5UGOijLkuACsM5zguy5rtQOJbhOID1d2jWkUm7SngAzJe164re5DnjUI57LAO5bCcwD/nuDWzJyvDIvwWG8AA5G6pUSOVzB5XmBZFiWF3VGAeTyrwVGTLwDgTIcxxfLm0j8DxJKKuwIgaZY7S8GSuIll8ww7cRU2vIweQFFBMT7WgjAXV8sp7P9DE2n9BwMUDcAXdwFCY5djAKOwDEQrpETw8wJbcBddNgNwlSMtWzBIKAphHHAul4LmIA1DUQA="}
import { importOnMediaQuery } from '@studiometa/js-toolkit';

// Import Component.js if the device is in portrait.
importOnMediaQuery(
  () => import('./components/Component.js'),
  '(orientation: portrait)',
);
```

**Parameters**

- `importFn` (`() => Promise<Base>`): the function to import components
- `media` (`string`): a [media query](https://developer.mozilla.org/en-US/docs/Web/CSS/@media#media_features)

**Returns**

- `Promise<Base>`: a promise resolving to the the component's class

## Example

```js {1,7-8} twoslash
// @twoslash-cache: {"v":1,"hash":"bece8456e784c1f1becb770eb9e14169a152665fe5e14c0e60ae2b4016894452","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQgVMAULhwAdE5ozADm7sjIIBxgANZO+Gho2ogA9CkAVnAAtGgQEKwx7Gj+cGgArlDsEJYwwf6wRCnMWOwpIAC67VSlzHZIAJxUrDBgIWj4SAAsVMGkIbV4Xk7RuIgADFT8+L3M/DTkiP0AvhTo2KsExGRB8kxsnDy8AGZlYHtVYLxWNnYA8mAAWRglWYAEUymQMDI5PQRkoHDAAMIQMClUhlPa2Xh6LzI1FodGY0jGRhPMCIXiMPg6Yy8QyWdiqaEAH14wHMvE5vFgT2YZVYaAp0gA3OYjsYKLwaiCKWj2KNuBT6YypNIzBZrLZ7N8tf8gSDwZCnC43HgAJKauy8ZgCao2MAjewAd3wI14IXYJE+0s4vAAjhDSBgviICRDAjNQuFIjRrEIaE5gLiUWiMblSEdeNIOhRIlgdpYnGSudJXV9LfYXm80B9Al08wWnD6bZzS95m/7A8GwMwatbFLwiGwIZTVN4Ekk4KkUg0YKwtGR/JYIAAvdisIT+WwhFIjLIAVQAyjPXHAUgB1GAAIxSiMPx4AAs2AMTNgD6TxgzHKpHg3BzkS/j+YCUGA/KsPWUTynEVATskaSZDkeQFEUJTlJU1S1Mw9QwI0zStK6rA4KQZ46n8gLApwhpBv4CSWKwHRdCAPR9IgACMACsQwjGMEzsQAHJGcwLB4ZFoHqlFgl2yzyqsGwgFsOx7Nc7EcScZw4HghAkOQMy3B4gjCLwACCWBYE4LEMIgADs0xRDx4xIAAzEJ8xWSApnmUMslIAATJs2ykLs+xIAAbOp1DnFpVy6dQ+kgCwHBcHwhl+Ai0LyHCygGJo2jYgihjaOqYkIsap6LBIPjCBG1BRkgERQbE8SJPBGTZLk+SFMUpQVFUNR1A0TQtG0nTdLMVn8aF3GjI5iB2bMbkVY43kOn5AVKSFAkRZgmkeNp1x6fQTBYLlZCYHwnn+PwKJPOwIQUuynxcj2NSygS8ohKKT2ctdmoOmAaBTmyHJcqDyJ/Y6FJUtitLKkyzBgBgxhfaDRxfUcZWmh4eK3SENXBGE9WRNEMEEC1U4Ie1yFdWhvWYQNuFDa011gLjZRBTWKK0Wg9GMWNvRWWxaz+fZM18VNtXCe5LO4zJq2IC5CmBcFKnHKckW7ZcOk3EdHiMCdC52BgfAvTAb2kB9FnjUgbFsdZ028VMrkieAva4Ctqx2YpQXKQckzbVFe0xTr7n66dRspXaKKOkDj1g1H/2CpS1Kw5oDLw4jyNilbAs205dnDGLNvyQtLu/faMdy6sXFKxtKn++rO0XPtsU0LrCUG8R528ODFcA1DKd0mnKqSAjSM56xnEFw5fGDJLi3YwnjpV2F60+5t4WN4HWsHXF7eJQ8fBiRJBpdqPmekuSycw0P1Qj2PEpSpJ5sfYqt/p1ID/mCVx8UafRpUBNO4EAFofj2BtOXaOANeAujdB6L0T8QSdkhCGXgYYYD4zqigGMMA4zfndiAJMEg8SpiJJmbMkF8xBULFQYsrYywlSrO8LmAEQBUN7E2SSJYywdgDCg02/YoCDmHN4RgY5eBwQpjOXCc5DZLlXOuTc25dxgAPMeIBF5ry3nvCkJ8klXySQ/F+H8f5WFAXZiBCgYENyQRJs1Sc05EIdRQt1dCfUsI4TwsNQixFSIVhPlRLs3NeajWYtbdi1k56F0dgJZ27lf76kCQAxqqx7a13XipfiRwmLXVgHgEqwAESSgSZJaiwZMxPDTrwAA5A+HqGF+rMDakhTqRRqlfXMKlEQnkYQKHhF4YGT0eg1n4LaVmd18px2em7Ck1TPLVIoCDH6S8AaxyWVyXuUCk7QxpOs0GJT/5BkYHs0G18aTljAYwap/gUiQMTmeTZid/CZGqdwRZ31TmcmqYwWw7BHTfg+BSMBQUijcAWSczkbz1knBBmjbOVBGlIFAJlVEHw8CZBAEcI4QA"}
import { Base, importOnMediaQuery } from '@studiometa/js-toolkit';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      Component: () =>
        importOnMediaQuery(
          () => import('./components/Component.js'),
          '(orientation: portrait)',
        ),
    },
  };
}
```
