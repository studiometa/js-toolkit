# @component

```ts
component(config: BaseConfig): (value, context) => void
```

Writes `static config` and calls [`registerComponent()`](/api/registry/registerComponent.html), in one step.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"8fe60bba874fd9ddd3af425620500846fe57ee0deb2b0b02fddbc27e91a24197","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGACENadvmiM/J2N7H6IDjAAwsOj3OMycvS+ShPTYC6kzTm2xoxEbM0w49IU3WDVaOOTQnBwACIwQ6TMaLZrFzLGfDrGvEQQ7Cg5isNjs3V6SXOTigEH4CBiAGUorxAjBwTZIfYhmARn5eMxFLxSDA/OwXGQUfg0YJhLwAO5Urrsexk3iwEZJKAAOicLjc0QAjABWby+AJBfJhNyRaIgIYQ/pODhJJBpOWZZ45SqIYVFEo4PCEEjkMLyWocLh8eUY/qDGZjVb2ua8BbyZbKCRrDZbV6kXb7ViHY6nbEXK43e6PWwvN6dD7SL68H5/AFAiy9MHWvpQqgwuF4JH2VHo7NY+34wnE0nk0iU6kR+mM3jM5sidmJGDc3nhaIANgAzKL/IFPFKIlE8FnMUqO0gAEzpDXZXJIAV66ilQ0VE3UM0xRhYTQ4OwYPhxNa4rlgZiWI68DaJPzd/lIADsr6H4pCY5leGvt5nFVEEHdUsi1PI53XTADRiI1KlNGp90PLQyEwM9PXtLliUaOAAH5xgffxkAAXV4AAfXhWnbTln3cfIRRAHxhwlUJqGlCcYmwhAEiA1iMjAldEEg4oNxg8pjSqPcQAPI9UNPR0cVGLktDQDp1nw3gACUo1IKBJEIvxTgAeSwVTOgeDlmTU34KKomAOU7WjBTnVimK/RAPzY8dZRUtTuMY2dEAY/jNUE4T9TKOCdwuJhkOPND7xwTtxmAcxeHSlFSnGAA5ZpLAAIzIL00E2bZSAAbjSjL2WYZpWEuXgwDywqKvMAonNXfsGLckcgp/DjnCSqBAOSYKl3AzqoM3WDt0kxDpLiuS+Ggu9coKorOm9MqOp1YJXLFXrWPCX8YhWkakDGgTtTncLRMi2aENlfZazWlqcuajb1hKn1bGhWF4RAABBLoIHygArR4i0yexiUPeB+hEZhGo+2sIEaCsMF4ABrRJuV4QHWFYXgAClmH2BF+FIdhTOR9bSER4leF7YIAFp8pbRpWAgF5HxZmxEnsJq6bgHkqD5OjhTVHqJV7frZVe+CAqAy7QuugAOKaxKiubZRklCTz4Gq6oaoWWp24U1c/XrPOOgajfq86+tA1W8n7XtNfuiTHsnBsEQ4WAd3FwU1ZA6WkFlryTpAP3AUV5Vkk8kLl21d2RLOmavd3eaWAtBoaVuCZXSWRQPVUQxtCTCZy5MYEM3sOJzY8S3GIOli5bwBueITxcrogtc0+m8TFZi/db0CaA+BjgPlLAbL5Gudh+CxxhnX+QEdrnFJPLDnUBXbmJOjn+gF6Xx3m6TiahIKYj0mgMoQVsexgAmEMehtc5eAKJpNEsXgAHIAACLhmhQA6GPZgAB6MGcAWavAgKwHGaAWZEGCH/SqYBzAAKnLaVKXRGo3jvH/KeZA/4UCqlxcYyA/5JHoKQ/+zIYCWDgCRP+N8qq+U2ilRKMBkq8Gfitd6dNTj2wagKT+n8yFgAKNwcw+cRDENrG6EuEw+HsNnvPDgS8V58IKG1Jw4CkCgCUXANSeA0AIAKAUIAA="}
import { Base, component } from '@studiometa/js-toolkit-v4';

@component({
  name: 'Slider',
  refs: ['next', 'items[]'],
  options: { speed: { type: Number, default: 1 } },
})
class Slider extends Base {
  onNextClick() {}
}
```

The class is registered **as soon as it is defined**, so there is no separate registration line to forget.

## It merges with `static config`

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"1f66761ff5247a2369bbd71728cd58e12f5f436e7814e2532471ce6859397be9","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGACENadvmiM/J2N7H6IDjAAwsOj3OMycvS+ShPTYC6kzTm2xoxEbM0w49IU3WDVaOOTQnBwACIwQ6TMaLZrFzLGfDrGvEQQ7Cg5isNjs3V6SXOTigEH4CBiAGUorxAjBwTZIfYhmARn5eMxFLxSDA/OwXGQUfg0YJhLwAO5Urrsexk3iwEZJKAAOicLjc0QAjABWby+AJBfJhNyRaIgIYQ/pODhJJBpOWZZ45SqIYVFEo4PCEEjkMLyWocLh8eUY/qDGZjVb2ua8BbyZbKCRrDZbV6kXb7ViHY6nbEXK43e6PWwvN6dD7SL68H5/AFAiy9MHWvpQqgwuF4JH2VHo7NY+34wnE0nk0iU6kR+mM3jM5sidmJGDc3nhaIANgAzKL/IFPFKIlE8FnMUqO0gAEzpDXZXJIAV66ilQ0VE3UM0xRhYTQ4OwYPhxNa4rlgZiWI68DaJPzd/lIADsIpAPmHEtC1GlE5ia9bxnFVEAXdUsi1PIBX7ddMANGIjUqU0an3Q8tDITAz09e0uWJRo4AAfnGB9/GQABdXgAB9eFadtOWfdx8gFIdxRCMcZTwfCEASUDwIySCVzAwpig3BDymNKo9zlBsEQ4WAdz5JiBWFViR0QXsOIAkA5MBZDP1nRBBwgzUhN7ODN0Q7cpNQkAWAtBoaVuCZXSWRQPVUQxtCTCYvJMYEM3sOJGMFfs1S/NjEF/cJOJiYLeOSYyBNM7U5zXUT4LKJCdwuJh0OPLDeF0hSuWxXFxmAcxeGq3ggLvUi/AAbiqmqtDQDp1gqlqapquAcE7cYADlmksAAjMgvTQTZtlIZquhqgo5oKELV2CTTPzFdT1pi7SytGEDkl/ZLl21ET9Sy6yUNlA8j0w09apveqpsfFadSFV81J/LTZTqg72JMk68jnFILPE7KbOu/K7r4NqOrgLr5uqvqYAG3hhrGibOm9GaltegVX2MiL1I+v9x1lWGsb+qLF0E7V+3MjLLIk/TcrQ26Tz4ZHUfR8bSEm6bfTxgAOX8iYlD8dtlLmoCpo6lygkJX1Bi7JKuvB9lrHmyCGkbef5n1bGhWF4RAABBLoIFGgArR4i0yexiUPeB+hEZhat1ikIEaCsMF4ABrRJuV4U3WFYXgAClmH2BF+FIdgsHsMAPdIV3iV4XtggAWlGltGlYCAXkfTObESRPk7gHkqCUwUPBYjbvyQbb/1lLWd2VQ6aZSvIhWCApyPSaAyhBWx7GACYQx6G1zl4Aomk0SxeAAcgAARcZooA6W9XAAeituBM9eCBWADtBM6IYJF7m8xl6nW0x7q8ZF+KshF9ObjxmQReknoRfKIKbhzBOREM/Wsbp3ITF4JVeafJ2r8DOLiHy99HqPxAa/XgFNOqQPvP1KAOsMa1lnotcwy0qBb2YEgUAYC4AdTwGgBABQChAA="}
import { Base, component } from '@studiometa/js-toolkit-v4';

@component({ name: 'Slider', refs: ['next'] })
class Slider extends Base {
  static config = { name: 'Slider', options: { speed: Number } };
}
```

They merge in a **class initializer**, which runs after the fields and inside the class definition, so `registerComponent()` on the next line reads the finished config.

The rules are the rules of `$config`:

| Key                     | Merge rule     |
| ----------------------- | -------------- |
| `refs`                  | union          |
| `options`, `components` | entry by entry |
| a declared scalar       | overrides      |

A key both sides declare **differently** is reported as `component.config-conflict`.

## It is applied last

Among stacked class decorators, `@component` is applied last, so it registers a finished class. That is what lets a service mixin decorator sit under it:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"7dae950726f7a74a22ada827c1954464f93f4e4425e11e383c737575d3b1957a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGACENadvmiM/J2N7H6IDjAAwsOj3OMycvS+ShPTYC6kzTm2xoxEbM0w49IU3WDVaOOTQnBwACIwQ6TMaLZrFzLGfDrGvEQQ7Cg5isNjs3V6SXOTigEH4CBiAGUorxAjBwTZIfYhmARn5eMxFLxSDA/OwXGQUfg0YJhLwAO5Urrsexk3iwEZJKAAOicLjc0QAjABWby+AJBfJhNyRaIgIYQ/pODhJJBpOWZZ45SqIYVFEo4PCEEjkMLyWocLh8bEuenM/AI/iaViscZI0hEdj8GAAWXYtESkgdTtYAAkIBAANa8ABkvDdHq9IYJUB8cEkpmcjogzpgQJAxlOQezrGk0qipwgACMAFaPNBmCy9MF0u1F53Q2HwkAI5qVuCO9iVtEAA37wdzjG4w6atjk2XwvEsEFaWIwghgXN40iptsUEDpvFZqLZMEazGarHs4RlPKofPciAATAA2UX+QJIAVq69RPAtwJtqwSqJMkaoZFkWp5C+erUKUhoVCa1BmjELAWg08oYv0gwzGMqw4XMvALPIyzKBIawbFsrykLs+ysIcxynNiFxXDc9yPLYLxvJ0HzSF8vA/H8AJAo2oJYj0mFQlQMJwngSJXjuGF9OcZy4vihLEqS5KkJS1KsfSjKHiyIjsiB3K8uE0QAOwiiAPjvhKXjUGWsqKZiwEqk+6QatkuSfjBmAGjERqVKaNQoVgmg4HYGB8HEay4lyYDMJYRy8BsiR+OZ/JIAAHJZb7iiEUoRL+MRJSl7nJI+XkQb5OoAMz+XBQUIVUyEgKh9R8P+9pZs6jBaGgHTrAA/OMA01nWMZxmQCY+n6iQAPJYENnRpoBpYlWgpxxJIcSGNoxh8QAPrwrQmZyBGfHsBypScZzMbw1zCA8TycaQ7zyJ83y/L6tC5s9twyIWfWhuGUaxvGnowEmiipummbjnmR28IwADUAq8AhrAQMwUDcMCTb2D1gEdjJiK9mOg4jmOxYTlOM7aTA86Lsuyn8GuPibtuaItnuB5Hju7LnpeKLObezgWZ+KSvrZYofjq37OX+rag5VSD1TVmp1QKTWBeUxptWFcp6SGzOwIh96Co+Nl2YViCyz+spm3jIW2SBRXqrV2rPnrZTBYhFzml1Ah6btsjEYopGqAdugTLHDYgrY9hxFlD4CsEap2wroROVteCpwkHm5+B2vao+uvFLB+sB0bsqMClgTQHwLsW1ytM5lAk7jP8gJp4KwSOdnEo5cVMp4B3PhQOriA2aXPnlwUAC66TQGUSdgsAEyMeJSnbbaAGg7wBRNJoli8AA5AAAi4zRQB0jfMAA9NWcAALSvNmEbMm/RDBBfABucw5gr6uSwlvcqqUL6tzIBfY+BMwBXxJqDSc5gaS3F4DApmSwo4TF4MAcwvA0qg3pvggo5gChOEfkgUAkc4DDTwGgBABQChAA=="}
import { Base, component, withScroll } from '@studiometa/js-toolkit-v4';

@component({ name: 'Header' })
@withScroll()
class Header extends Base {
  scrolled() {}
}
```

## The function form

```js twoslash
// @twoslash-cache: {"v":1,"hash":"135188b0a2b8753bcf7a917fde01427984d4371373b38629d0c99f9a99bcd9ec","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLwAZgCuYDnsEGC8pDB+7C5kAMIQ1p2+aIzDo0lgaINCcHCIDjDDYC6kzTm23MtEEOxQ5lY2dt29/blTNjMMVFAQ/AgxAEoXA6S8zAIjN+Nfil47DQIksZEiUCazEs7FYGAovECvl4cH4zC6lmYaAyiT8ch8YNmcAAdOZzNJ8DBeGBoVT+CN4E1NJZEZTeGCIjBIfSwI12H4ERwANZUpFA9auNowADkIgABgASQ5ygGQpHmOUASQAcgBlaQAQW1gwAorqVZisLwRRggfYsM0AEYcOCUkTA1SsRq8VqwUjLb5wJ2CYS8ADu+HYGTk9F8Si+5np03+YeB+BjaFI3x5fLx6MhjVskRBiIg5xpYPDEGarEhECRpFTqnOfQ+5l9ZF4co7fKSUBViQGzDr3vprA4UFx4bTrKpFapwPFlNIwK5xKcLjc0QAjABWby+AJBRDbgDsYTcxbwPVbV1+Y1mTg4SSQaRAGSyOUqJ93RRKODwQgSHIMJ5DwENFl4XUJ0qKhN3cRBTwANgPfxAiQFDqEvKI8Ggw5YJAZ9kgAJnSTIsy/PIkL/ahSkAioQOoMCYhYDguD4CDlAkGQMzjLjVEMbReD0OJBJMY5RjOOIN3CaIPG3VCjxCC9OWiWIJCfRISLIz9ciQYjtxozAAJiICCOqNTGCwTQcDsDA+Dwv1iRzfllmAcxeE86laWWDZcQAbg8ryekaJYUUzXFkAAXUCsAChkrckG3FJz0Iw90MQTDwivGIXL8TSX0QABmHSKL0/IjLo0yGKqZiQCsmyyEwPh518iL/AShDt23AAORSMtCLDVLwecCuSEr33I7JyuIlJKpM8pgNqmoWOsrQmvs85Qrald/GizqdyKwafDQ49BuynCYhChAEkKiaPzK78iuo4paIWszGIs2o2IaG9LiGe9bkmQHxnmYRljiNYNi2NAdj2A4jgsST7D+j5rgfO4QAeJ48DeW9O2zEHZlVO1QXBLkoRhOEESRLpUXRdksRxfx8RgQkQVJMByTZecfjBERGmZWd2XJ7lOlzQV2BFYXB0lfgZXlJV+xJ9UwC1PVDWNM0LWYK0bTtXgHWdfo3VJmAvR9RQyADFFgwWEQIyjdN5D4hM2iJ+xU0CDMsx+Xl+RJwtVJEWHy1pKsazrBsmypVHcnbK3Pm7K3ey5AcJRgYdeAgUcIHHQ4py99MxV5xdEmXVcoHXODZKS3d9zS06ktSi61LjgHk0fW7kkwh7pu/ObXuMsoPuWtTOKgmDGPgndTwmk6lMylScpARyCKIjDSv7vJeoKKL0mgMoTlsexgBWBF29IdHbl4AomRGXhpQAARcZpJwZVwAHoACs4AAWlhnnIUwI/5EGCNKWKiZ7aT3wp8F2ih+JUncl0cKWIox+1zMJXgZ9WqPzXqQaUF8YDbV4MgaUSR6DSiirfWKBQyRgEvtfcYjB8HcH8k4MErgkCgHgXADoYA8C/xAAUAoQA"}
import { Base, registerComponent } from '@studiometa/js-toolkit-v4';

class Slider extends Base {
  static config = { name: 'Slider', refs: ['next'] };
}

registerComponent(Slider);
```

Identical behaviour, no build step.
