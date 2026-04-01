# withTrailingCharacters

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"33f88b6ace6394f7dea3fbb04f30cd9a7d6620c2a5951e749fd38f8920793edd","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvAO7s0+ACqlm7DmADmAYXzNlYsnEZw0pdhsS9jpjRV4idemqTgWrZ9d1cn3AHTDsAWywIUjQZOUVlVXdtXWZ9Z0oQKAgRBEQQAEEoKF55GF51dhIpeziEuDyIPPwCmDBciH4agqKSy28NADoktGZ1dORkECw4gKS3DV4FWo7rdSreAOh2fgwegF0KYdHlcaoyxwNp2cP4p0q0auYcxfzeeqhN7ZBSGDRBUjBKMEFWVi2wzUAGskvg0GgsC4APTQgBWcAAtFcIKxgXIusZBFAJAF3swurAiNDBOJWHBoZN1NDZPIlCo1FoHOcDF1wQFWCANlsQMZdAxEABOKiserqeRIABMkqofVI6neeFpkQZMWZFSSalwiAADAd1U4kIKAL4UdDYbUEYhkXp0AUgFgcLh8ZX06IaWJHZxGTrqLzzWxnCr+9yeOa+fxBEJhV1RRmelmJKgpNJ4bK5e5tep2A3HK4tB4NXhNAtZqRUnqy/qDHZjCa+k4FKmLZY4tbPWt7JJBi6NnPlXv5m4Z6r3R4d17vT7fCi/f6AkAgsEQqGIWEI5EQVHotCYj44iB4vqEmDE0mqClUmkRN3x3PONloDlcnl80JIADsMsXYoliGlVbyoqGSxqqHr3ggIpmNq349jauqmuaOB4IQJDkLKdpMGwnA8OEdJxmqA4GD68whjY/Zei44YaGGVJ+IEwShHhKrukyRFJskqTpFktyZsU2Zwc4dyzI8xbNHx7QVr01ZIEMIx1lQzYzE2Db5q2qzrFyLy7Mw+wgIJlTKRRiaXNcvGjiJDQTm8HxfD8fwAi8S5UOCkIwvCSIomiGJYgeR4EkSJJkpevrXvhYFsZRj7PtyilygKACMkoAGwir++BSt+coKvaoGsQmGpQWA2oAMz6uxSA6saPIiNAloMdGvDAMxt6EZRvDGgIpCHrwADkAACvm4viHmbtuchBRevUANx+H4eV3uxhi9VSvW2L1AD6G29dw028LCvA+LyvpbUd803gR4FLYwK0ndt61bTte0HUdVKnSAST+UgoB2vUcASN8GQIiAxrGkAA="}
import { withTrailingCharacters } from '@studiometa/js-toolkit/utils';

withTrailingCharacters('string', '__'); // "string__"
withTrailingCharacters('string__', '__'); // "string__"
```

### Parameters

- `string` (`string`): The string to modify.
- `characters` (`string`): The characters to add to the end of the string.

### Return value

- `string`: The modified string.
