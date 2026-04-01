# collideCircleRect

Test if a circle collides with a rectangle.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"970f918253964c29b598c07f7f8e71626a372c9f1ffb227a92ebd86b33ab3513","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvERFYdYAYXakRrGACUYYxiOWqYiXszAYKvUlrSHjGboYBGEWTGMAdMOwC2WCKTTTZeRglFTVNMUoQKAgRBEQQABV4f3Z+I2k9NQC5dlg4XgB3djR8dIsxYwBzNQA6dwBJMDgsZRgoXnsMXnw0NCxEAHoBgpGagCsYfn4LDBKIbzhJGt9KgZkcuAkwAFpYGjEttcyYbfK0Gqx8LEi0Zkq45GQQLGZSZk9I3VCYXhD9EAAuhQni83h8qGdeOFbmBqrggU8LGhBKQwJEAIIWXglH6bPK8CBpHEZb7YiCCET4diw7H4H5nKpZAD8gOBIA4YAA1pEen04IMBmM4Ns0E5WJzijU4MioBJPDBbjVYEQBoJxKw4GtAuxNpItTlFMdoTUep5WICgSBpa8GIgAJxUNSwkpIACMAHYqLdSJUFXh1kE/mFLJEObhEAAGKiU17MMRkJB2gC+FHQ2HDBGICa9dFtIBkTX8X30hmA7l4Fd4tEMYEEnnsZAA3OXKxga3WG6Rm1JK29ZYJ+bxa/Wm+4k5FrX4kO6AMyOmDO/BIABsXtevrzxbUoep4YATNH8LH4+REMuU2mcHhCCRyDn6EwsKQIDg/LYq+2R3erd7bQAOVd2QXSoXUQV01x9P14loHcwHDOd8yPN4TyQPcL2odNryzb8aAfeJGCfF8yEwPg2yHDtsx/G1EwAVnnRc3Qgjc8AwWDwwAFkPY8aFPNDUwwq94hvSjcLzAjn1fEjzGYftB2HTsJ1/N0I04oCGLPJioJAPt2AHNikDoxDuITRA+MvDNhJw3N/UkaVzEsUsWwratyK/btK14Mj5NHHsKyKKASk/Tt3MrOl2EqHogp88cqEnW1XT3QCnRApdEFU71mPiM59MQP8uOQniV3QzBBMzW8bms/DCMk98XO8784rdGdPTUlLGOodctJgx1d0TfK40K0ziswoTsIqvCQHEoi31IqKGqUsD2KS4DQPAjrILzVierg5T+pQob+JKiyxvvMTquI99/MC1yFNihbXRowzktAwyMq0q6l228NXTWmMCpMsyBOO8rTsfCSLr4MKIqsG7KMasDlzy1rQMAt68yhnocoSvbBsBo6sJB6hKsmthOB4bJAyNSwdGOawTDMM46dsBwxRcMB3C8Hw/Ap3JgipiIqGiWI8CSOzUnSLcfgDXn8iKEoyksRkYDqMBGmaVp2k6bpen6IYRgKcZJmmGBZkIBYlhWfUOF1HY9ksQ5JdOSwLiuG47geEFY3BfNjl+Y5WU9sFIkhaElYD7SFRRNEqExH5iTxeACSJOkSX0MkKSpGliQZWFmXDjluSoXksH5IYhRFMUJXOaVBFleYFWYJUYBVNV2A1K2dQd7VDW+Y1TXNAFLXh10/1U57Uo9TTN27vne5DL63UMv6BpMiNhtKyzxunwtU7URzfI/WGuyczy5pCisdIHM+x0U6jTIjA9kdS1HOs3f2F7ApekJX08R/X4GRLEwLHZRmvAywHzqhRY+B8vJQPPoUXI116rwIxjDZBN87p3z3K6KMT8kDpVfngbKH8Ho4wBueS0MhYB4E5r4fwwAeY930NCXgSYBDPk8LwAA5AAARrnXeUtxBTClFLIKuqp1RwC4d2dwwCiy+wALxgJbC5diUYWxkTURQFsl9BxaLHDI0Qtl/CQiUeA5yhh9E9k0eonsH1DDLlsRWVBDjbFJkMdLJhwZtCSwZpYbgjZeBDGxKQQQuAqCCOYEgUAuYFw2zwEKEASYkxAA=="}
import { collideCircleRect } from '@studiometa/js-toolkit/utils';

const circle = {
  x: 40,
  y: 40,
  radius: 40,
};

const rect = {
  x: 40,
  y: 40,
  width: 60,
  height: 60,
};

collideCircleRect(circle, rect); // true
```

### Parameters

- `circle` (`{ x: number, y: number, radius: number }`): the circle dimensions and position
- `rect` (`{ x: number, y: number, width: number, height: number }`): the rectangle dimensions and position

### Return value

- `boolean`: whether the circle and rectangle are colliding
