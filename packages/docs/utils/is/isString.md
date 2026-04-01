# isString

Test if a value is a string.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"dd61d6afdd85b2b3fe53afc33cb7837bf5c528de76568ed70a2ab8bb8c9e2c30","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjCGDhpe7OAGU0pdmADmiXoyJsArjEWqwAa0gB3MHwC8APl4rW6sXF4iZ8gDph2AWywRSo8VPtzKIKAh+BEQQABV4LwAzczUYa15mW2lZOQA6fzRmORDkZBAOHX98NDQsOEQAekqAKzgAWjQICFZtdjQ0kVUodggXGCy02CJK1TR2VjhK8WnJFPk0kpdWEABdVaoRZk8kAE4qVhh5NHwkAA4qLNI5Abxveb8D2VxEAAYqfnxt5n4ackRdgBfCjobAvAjEMiZOgMUIsDhcPj3XzKOKaHT6QyKCxWcTJXxOVzuTzWHypfyBYJ4CIiMQxHHxPFJOypDKXbK5fKFbTFUrlKq1BpNFptDpdHp9AbMIYwEZjCZTGbI1lLFbrTZXWEAVguBSOchO53Z11uoWV8n8hReACYPl9SD8/khXsDQTg8IQSORLjCmGxODxSQ9UZYNLwtLoIAZuNi4gkWY5nG4PF45r4KUEQuFInTYqGEsyHmzqBykHkCrIeVQSmUKtU6o1mq12p00N1ev1BsNRuNJrNZmSFqq1hsQFsdogzgBmA76w2T403WEgc2PCtgF4zkCfb6/KFvQGjwSwO7JknAIO+XiA3hRUh9XgAcgAAuKO1LBY2Re0ewrHwBuJxCTTVJGEfKJmkfbh/14apeGkdRgMHORGAARmtKdoNgypbzYOBcCoTtmCQUAYSOOBejAPA6hAQFASAA="}
import { isString } from '@studiometa/js-toolkit/utils';

isString('foo'); // true
isString(123); // false
```

### Parameters

- `value` (`any`): the value to test

### Return value

Returns `true` if the given value is a string, `false` otherwise.
