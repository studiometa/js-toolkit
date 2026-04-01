# isEmptyString

Test if a value is an empty string.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"7c80e212bedb926934886d0d593a612182611e2f10853a016b50d5ddffd5c92d","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpe7OAFEAtlkwBlNKXZgA5ol6MibAK4wA/Ou1gA1pADuYPgF4AfLwBGECKxjMwAHTDsZEUqPHSshgKSqqUIFAQ/AiIIAAq8P4AZrzMvCrsJGC8Wqy6YnCp2TAymLwioSoAdOFozCoxyMggHCbh+GhoWHCIAPS9AFZwALRoTqzG7GhVItpQ7BBSMHVVsES92mjsrHC94nuSpcGKytUdUqwgALpXVCLMfkgAnFQuqmj4SACMAMxUdaQVMs8AEjiFTuFWrhEAAGKj8fAPZj8GjkRBPAC+FHQ2GhBGIZFqdAYsRYHC4fFBQXBqk0On0hhM5ks6kczlcHi8Pj8BUC8hOYSokWieASIjEKTSGSyOXpBSKvBKQXKAuqtXqjWarWM7U63T6gxGY2ck2ms3mi2WzFWMHWm22u32VP5lSq50uNzuAJJADY/i0YO9Pohfv8HkCSSBncdKpDlNCAEzwxGkZGopAwrE4nB4Qgkcj/YlMNicHi8sGqul5Bm8IymCAWbis8YczzeLC+fyHamq8LCmLxRIS1LpTKB2XV+VuRVHFWu9UNJBNFrKHVUDpdHr9IajcammZoOYLJYrNYbLY7A4HPkx05utAXa63ED3R7ouEBoPff0AiMg7suhCrzxkg/oIkiKKErCWbULiuYEgW1BFqSJYUuWPaVFWugGLWTINiyDgtm4bbcl2N40iofZRAOYrJCO0rjrk+TiAqSplBUd4LpqK5tOuepboau4mlMB5Hpap62ueDpXtGFH3o+novt63wJl8ryBioHzfmGgLArEsm9sBYDQgALMmEHptB2KwTmsR5oShb0MW5JlgZmFMTWdbMk2hHssRXIdjyblARE1GikO7CSqOMoeVOxSzhxqg1GGi4oFqq66puBo7saEwieax5WjadoXo6ZXkaq8kes+r4kl8JkAOzqV+IY/uGelRgBt6Cjx0IAKzmamkFopmz6CLAIKkbwwDoYBqi8BivBJKQiy8AA5AAAgV4nMIJuWmlJOxrQA3J4bZdRRjBrWt3DHbw/S8IoujnRVmFrUkTg3XdD1JGwcAwC9FaYbd929Etf0A14F2VsgVwgz9EPhCezBIKAxKBnACxgHgQwgBiGJAA"}
import { isEmptyString } from '@studiometa/js-toolkit/utils';

isEmptyString(''); // true
isEmptyString('foo'); // false
isEmptyString(); // false
isEmptyString([]); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is an empty string, `false` otherwise.
