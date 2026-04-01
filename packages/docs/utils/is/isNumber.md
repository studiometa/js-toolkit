# isNumber

Test if a value is a number.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"404edfa36f9400a7abb44a3a0986d2f7355b97c415b987cf114b9c32d423abe6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpe7OADkArgFsARmUS9GRNlJhKpYANaQA7mD4BeAHy9VrdWLi8wshaQA6YdjKwRSo8dPllKIKAh+BEQQABV4LwAzXmZeAHN2EjBzNRhrWNt7MgA6fzRmeJDkZBAOHX98NDQsOEQAenqAKzgAWjQICFZtdjQckSkodggZGAKc2CJ6qTR2Vjh68UXJbNIcqplWEABdbaoRZk8kAE4qVhgweLR8JAAOKgLSeLG8b1X/ctxEAAYqfnxDsx+DRyIhjgBfCjobBfAjEPwPOgMUIsDhcPhvXykFRpTQ6fSGJQWKziLJY5yudyeaw+Bz+QLBPARERiGJxRLJVKWdKkuJ2LF5B6FYqlcraSrVWoNZptDpdHp9AZDEZjZgTGBTGZzBZLTEOdZoTY7PYgA5HRAAVnuZQuVxuiGtj2eyJAeoRZXYYC+ACY/gDSECQUhvpDoTg8IQSOREfQmGxODwaascdy8boIAZuES0hl+Q4KW4PF4Vlj6UEQuFIqzMhyLlySTY+atBdRhUgSh6KlQqjU6o0Wu1Ot1ev00INhqNxpNprN5stlrTchstrt9o9kbdfjbLtc7kKni9Qm7o52vgBmP2A4F+H7gk2CWCvQvU4BJrG8cG8KKkEa8ADkAACSoTqqMqDvKvQztqf4ANzOBSJYOIwACM3zcDBvCNLwaCkOoCGLtif5RJ0f7oZh9RfmwcC4FQk7MEgoBIhccDDGAeAtCA4LgkAA="}
import { isNumber } from '@studiometa/js-toolkit/utils';

isNumber(10); // true
isNumber('foo'); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is a number, `false` otherwise.
