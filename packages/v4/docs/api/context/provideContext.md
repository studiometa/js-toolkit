# provideContext

```ts
provideContext<T>(el: Element, key: ContextKey<T>, value: T): { value: T; dispose: () => void }
```

Provides a value to the subtree of `el`.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"4cbc4d0b5f6bd3c2e8f041876704ef3af340888ca1a8a826e458902068ac81e0","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAiIEMAbAVxiJ2YPgFsARmUog2XUg0QAOKjxhgA5mnxIArFTRz1MBSG79cKgJZhciAAxVG+OV0Y1ySgL4V02WwWIpfToTZlYOKEs4LAg4QXYACgBKdgBeAD5OCEsoaVl5JABGPRBVDS0kAHZ9Q2M8SOjYi1LrWwcQJxc3KURi718cPEIScmD6PATeSy44FKxSYhyYAGEWGnoAHhEJMnSEmB4hAFFVUTU0CnYAaxgMIVWwdbQAaVutsUlSdMuzASFtz5JITAAA6YHYEM4vD+wg+ZAA3GDIewGjE4kJkmlMkRslBEWBPGDLKIYvJ2PNFrAHk9pFAIIwEIgQAAFBZEJbsLhQ8ycMjiLhoYnsABmEFInPYcD44jQpBgMAAdOwACr4GDCGByeAcCns2DigDu1jgCukBnUjOQyBaYCu0nwaDQWDgiAA9K6AFZwAC0aAgEB4V0saG9RAALAq2HxIhAzgYFbAiK6uFhLK6wk9XbqltSQgqHaIeCAALrFqj5BQAJmqpTUmm0vTDNVIRhM2apaxC0h4rSQ7U6pFc7iQ1f61D8Q0Co2oXaZYTY7AOQgAEsqALIAGROMDOjzyBgKiDDlZUdYqiBP1FqJgO3d79kczkH3Q8x7HmEGTOGQRn4znLAXV47nYXN6CA94di+fc5AUMMADZT3KBsAGZm1bPAgLvGw+0fLphyPODPDLDpoH8ecOGAbkBEuVEmnYTw0nJNkc07eh9h4S4gMuY8knhaQ4y4JBQBCNQ4EsFg8DQBBPE8IA=="}
import { createContext, provideContext } from '@studiometa/js-toolkit-v4';

const Key = createContext<number>('answer');
const el = document.body;
// ---cut---
const { value, dispose } = provideContext(el, Key, 42);
```

**Parameters**

- `el` — the element that owns the scope.
- `key` — a [`ContextKey`](./createContext.html).
- `value` — provided **as it is**. Nothing is wrapped.

**Return value**

- `value` — the value, so the call can be an expression.
- `dispose` — stops answering for this key on this element.

## From a component

`$provide()` is the same call with the element filled in, and it returns the value directly so it reads as a field initializer:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"c69b1959a8bf186bc1c5aeaa807f33ad83f1db4539f8fe34d53285c938ec43aa","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACAYQgFcwNclThpWpBogBsVZjDABzNPiQB2KmNIKYkkLwFDKIZgEswuRAAYqjfONaND0gL4V02CwWJkjNengAKVlN2AEpOFnYuACF2GAAeABVOOhowKBi4gAVSCCwuAF5OWLgYHLy4AD4AHTATAFssCAliuKMoCEYERBBE/BgItg4UklIMCIhGiHNBFPp5DIA6X1YFbuRkYzMAayN8NDR8xAB6Y4ArOABaNAgIZm2TNEuiABZF0T4oE0mdVkXYIjHVhYEzHEAAXXBIk0kgATLDZPIlCpEC8NOJtLoSrhZGYLNYQLZ7I4fIh4a53Dg8IRRr5UoEsLkcBIMOF9IIyItGNMAGYmBSITjAWqcUWcMCseowQWiUhmBQAblqziMonEkgAzAAORGKZRIGTUDE6Ji8/lGUzmJAARhsdlIDicAE4KdQPNTvMJqPSegFGXkyJhwhKpTK0HLFKqYUgXk7dciY+itCaeiGcVsrYhbYT7Y7SbDLK7MFSejSfBofSA/UzA6yePwOaQuQ20IKAMr8iXMeJgPj1ABGZEqUfVamzcj1KIArEnMaaDBa8UgNXbiU5YUX3aXPXT/L6pcpoOFsfFseV8pVFgASf1EEyweIdhRdnt9wekSqVALbGAYQW8Dl6AAaV/R9O2CV8ByHSoKE4Ihgj4aVOCfF9eygj9QnbcDuzQ99hyoDoujwco71gThWDghCBlGftWDQBpOBuRj+k4OA+H7cMYAGHlmnIrhmGmBQ+OYgYYDkKVZlMEg4EWWo+gGcxxHgNBOFve8yE4AB3MwZNqOSWLU2BSFYx4uGmESUnE+Q0FgyAVPM5QBnqFsIgwFgYFguAIE4R5yLAOBNLIOBamUXI+AUfARjIcYBGcgw/KgTg4sERZOAAOQgZR5U4UgxJgOIuF8/LSGYP9yImKYZjQWpNMIUpOFgSIHXo8yTC4bTlCgB1NLATgfxgfJVNyUjsoMExmB8tAuDyiSVIUCB4GWaFR0QLU0WMJF9VW2cUxAG9hvUxdMxXHM11Ja0p03EsvFpCs90JaZRHrAwAL8Vt60AtAQIwMDnwg3DoJHCQkCdE6JwTLMESNZNdHZNBXvpXFjtXB0SXIMkXiuzwyy9N7AmCEwwhMv6cLfIcAjMR5CeYAA1KjBQB0hMOQ7DILw2oGiaFo4Gw9pOm6PRcrogYKKFxwTBISjmEQ2SwFqAB1OUaC4UoDjkViMDAWxckgPg4FK1KAEEcq4wQHVmTSlYGNjmVKWAuEciI+FIXLZlgKTos87zIFY9i4EYOV304CB+1KUhpL84PmCMqXEPInkhHK8xAuM6YYCWo01iQDYM12Kh9kOOATnOK4bjuB4nled40E+b4Dz+AEgRBY5uU+44eZJxZ9nqZgIShEA1WBrNLHUDbJwNHbdA7rsjosE6iVRpxtWcfvuVgJghi4OGNNSBZMnq4VetYsR6MYCYwD5ISimAcVJSQgBybfSHvzhnCVOWj+5eKiiymT9uIdSAQ4YI3oJ5bCARLChFCO/FUVB65IFALvfy3wwB4CmiAZwzggA=="}
import { Base, createContext, signal, type Signal } from '@studiometa/js-toolkit-v4';

const CountContext = createContext<Signal<number>>('count');
// ---cut---
class Counter extends Base {
  static config = { name: 'Counter' };

  count = this.$provide(CountContext, signal(0));
}
```

::: tip `$provide()` is instance-scoped
It is never released, and it dies with the instance or its element. A component whose declaration is withdrawn keeps providing until its element goes — which is why the call belongs in the constructor or a field initializer, not in `mounted()`.
:::

## Nearest wins

The scope is the subtree, and a nearer provider shadows a further one by answering first and stopping propagation.

## It replays pending requests

A consumer that asked before any provider existed has a pending request with no first answer. `provideContext()` **replays those requests**, which is what makes mount order irrelevant: a child that mounts before its coordinator still gets its answer when the coordinator arrives.

Only a **mounted** provider answers.

## Page-wide

For state that belongs to the page rather than to a subtree, use [`provideRootContext()`](./provideRootContext.html).
