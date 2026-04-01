# endsWith

A [more performant](https://jsbench.me/1hlkqqd0ff/1) way than `String.prototype.endsWith` to test if a string ends with another string.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"47cc641d171c3407479bbf69ff76ce54e199bc21f3321efb2aa0965073f44375","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvGGChwA6uzT5GcNKXZgA5ol5qN2inpjNSI/Lv2at3XQCMIEVibAAdMOwC2WCKTTTZBSV8ShAoCBEERBAAFXh/dn5eZj11a1TTNDheAHdg5MhlMlSDLQA6d3cY/HZs2uTeT18YXhxSfl9PZjB/ElI4CSkIJKLeAAMAZTTtMqxSCDQF7BgymTlFZTHGmGVoMtC0Zi0o5GQQDjAAa1D8NDQsOEQAeieAKzg7GXMyzxgngEZ8KxLgBHEFQAAM/H4TwATCAALoUM4Xa5UW73R4vd4AWkWTkuSjKakEUAkv0OZVgRCegnErDgTys2ieayCyjKt08rERSJAakySAAnFRnNplEgABxUQ6kLQ7PBsjYhUWaXCICFUcymZhiMjCgC+FHQyzwhD6BzoDGiLA4XD4SuCqmmOhK1iMcBMZgsbu0tl4DicLncXh8fgC62CoXCkTwcTUvESDWZWgyfmyeWUBQW+GKKYqbjA1Xq9RSTVILTaHVIXR6vD6A0kvGGvFGkxds3mi0wOFWgWVWwphCg+xlRxOKM0aIIdwezzeHy++B+f0BwLBkOhcMRyPOU5us6xC7xjmBRJJZIgFOYVJgNLp7AZTJdrP7wU5aG5vKoAr8SAArNK5wyFoEqIEBsrytaICOhKqpgOqsJavgOp6uQGpGiaOBmsQ+oylaTBsJwPARuyKgppYLoel65iUaU/qBs43Qht4vj+LBKphBEUSxPEiZJCkKZplkuT5N0OZ5h2lRFjUdTZGWzStGQ1a1r0ZCNkMIy5uMUylJ2CxLL2HGDjsw6jtQ45IKce5XAemLzu8nyiMuvwAkCoLglCMLwkik62eih4OXAJ4EueaCkuSOw3tStL0oyKavpGHJcjyCJ8r+1pCgAzKKIFgRBphQYqb5wTZ6o5SA2qkLqNDoRCBp8iI0DqiAoZsbwwCkcqvAGgI8yeLwADkAACF6RYcx74meaCxY+cCDQA3NJHGMINKaDUYg3WIN3ALbwLytqQggwO4K1rS6G1DZAO17Qd/BsJ6oTXkgoBWjIGl4O8IAGgaQA"}
import { endsWith } from '@studiometa/js-toolkit/utils';

endsWith('string', 'ing'); // true
endsWith('string', 'no'); // false
```

### Params

- `string` (`string`): The string to test.
- `search` (`string`): The string to search for at the end.

### Return value

- `boolean`: whether the string ends with search or not.
