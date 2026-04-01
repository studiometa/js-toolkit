# round

Round a number to the given decimals.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e40ac159dbb196c40ed3b374aa84396e4e8817c0a1dc00275c08b3b71af52988","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvUhGFRGRNoJiJeYQQFsARmQq9YI9hrZwA/KvXay3C5p2kAOmCNYIpNNNlgolEFAgiCIggAEpeULzMvIqsyrwA7uxo+JG8AObsJFKW9rwQ/PowhsascAB0vmjMaUHIyCBYzKTMGr4xcQAq+DBqdmS8aBCechUAuhT1jc2tVAZGJrxdPTn9+YXFC4O8ANYwMFhjEyCkMGiCpGC+AILD3jARK6QDQ8k9GVnr86W8rDBgaclDvUOGBtr58Gg0Fg4IgAPSwgBWcAAtIMIKxtkkynAzlAJBpTswyrAiLDBOJSrDjMlYTIRhCNKwQKNxiAcU0GIgAJxUX7/ZJIACsVCqpDSpzwdO8vhBuEQAAYqCJ8E1mGIyEguQBfCjobBygjEDUiuickAsDhcPhS+TtFS9KykPRzEpmWyOmwO+xOFxuDw23z+QJ4MJyVJ2hJJFJRd5/L2rAoukwVEXVWqTVUzEARpbxp5bG1AhqZwNFL5wRbdPN5RNl13PHZ7A7Mo4nM4Xa63WAPPr5l5V2NSJPfPkA/BFkFgqgQqEw+FI1EQdGYtDY3H4wnEmCk8nsSnU/C08JlBlMllUdnuIXCkCjgWIG+i8VmgO89hgOUAJiVKua6vICo6nqOB4IQJDkCa9BMGwnA8F2ChKPajzOnWJjmHmnqPD6GiuO4XaBgEQShOE4aIZGySpIO1ZrMO5SVGmSB1MW0xtGRuaPA2hYthmLGzKh3zsb2NafPWWy7PsRZtuclxUDcNr3NWWyvOkmRxrRPx/GOE7vlOBCQtCcKIiiaIYliOKCHiEAElUW47hScBUswNKFqezKspenIAOwACy8pp96Pk0z6SuEMrvnKADMP6qv+SDylqrIiNABq+nhwBdrwWoCDIGi8AA5AAAuZlnWcwRmLsuSRkvZeUANxOE4NqMAAjPKZSCtwtW8PCvCtY14QtW1greQAbHon6dd1sK9UNgq+KVSCgKafxwBIlzBEiIBalqQA"}
import { round } from '@studiometa/js-toolkit/utils';

round(10.5); // 10
round(10.546, 2); // 10.55
```

### Parameters

- `value` (`number`): The value to round.
- `decimals?` (`number`): The number of decimals to round to, defaults to `0`.

### Return value

- `number`: The rounded number.
