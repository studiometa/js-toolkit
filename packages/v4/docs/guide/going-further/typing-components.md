# TypeScript

`Base` takes an optional props type. It types `$refs` and `$options`, and it checks the event names and payloads of `$emit()`.

[[toc]]

## The props type

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"bf68bbb1189541be410c547bd2f54d205cec50e33cddddcc6dc17ccc0c27903a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0eILCvADKHLDkVC5u0QCsAOzevgFBiABsYW6R0SBN7C1OHElIAEzpmaTZuUhDRSU4eIQkrdTyTGycPAJCcMoSMnL0vkoO6pravHpxhtpmFta29nFO7XciG6SxAPn8gRCowiUTw/wS80QoIyWRylSRAEYttRSrsKgdqhNGFhnmRMHwACQwViIXgACWkAFkADIAEXYRAAoj5LL4GG1wtEABwYvoQwYAZmh4zwVNYs0SySlIBRqzReQW2MwOxie0qYSOMUSuQAZtkYPSmWyOdyYLywPyQFAIPwEDFpPgLQAqL0AAwZLPZXJ5fN9Pt4xrIZv4FpJxGm8F4cBw/E4rF4cZwdnYicYACMYBgIIpeIELaQYH4AK5CUiWlm2+32SOkaMW9j2NhwCC8TIiZhEZjsIR5nylnsd3h5jARsCe0gd5hgGN8E22XiWJfsLA15hoRJ+XiSKAc4xyEMOuAAOnM5mQjNZADleAAlGAmsi+GMAXUY+DQaDaIgAD0wGwCQrBaGQV6WBAABew5CFeth+GBLpwMBADqMB5sBACCagAJLAQG1rBnafLcACgpIEKIxgv0kKIBioTUGMsIxKRQaNnyCqIsqqprOi3Rariur4lUhogMSpJ2BglIViacC0sA5i8OpvBJPQtKkaIVYAcWPEOgA3GpGkdnayn1syRloMg36mWABTUR0SAYikrHggMSCdNKHEgBSikIAiySsYJ6qLKJOrlPskk1DEMlQXJfBaWgOlWnpBlgLZLlAhiGK9Ax4pQmxMITKlfHJL5KorEJeTBFFZR6gSUktm21mZWghkXo6zqungHren6un6V12U9WGXqzqa5oZpoRAJiImZkjm/YlrygTQCI+aFsWUClp6vAVtWtbWbZ01RrNk5dj2fa8AOQ4jmOXURvY06zvOi7LjAq7rpuFg7kI+7+EeeajcWZ7UhRl43mAd4Ps+b4fhW32/v+gHKaB4HUklMHwYhzDIREaGulhOH4URJEZeD43Q2gVECq5zELMqXlMQVfkTCNWU5SFPnLKi6zMSkjV4rFBrxdJy3Ja9lnpQ2PX2bl0QsfRbODNV4QykaNCWMFYKKhsAtqkLDXFDi0XNXFExtbNpG8066EDYdPr+latmTRdrazRWJLwHya0zqR5501ejQQLyIdNiIJ4VjkrAzlYWA9Qd7AiLbMYULwADu+DDhaEBlqQ6fWCnk4Lcw91gF77WBHuH1kB26doLD8NPq+76fqjf4AUBWMwBBuOwQhrBIShJMYdhuEEcR9s9Qzzg0cxnSs4xgz5ZzeBz3TlVGzVgvovlovieLhyS4lWbkrwFJaPuxZWap1cacmMAwFAtJgFWlgFqQjkabwkEtC0jzBACAPglyOWcozPK3Rqrq1opvGIN8sB3zAPrOYyQhTGzqpFc22omoSQlkSaWV8X5vw/l/H+ys3IeFFEVbyiBNbsQmGQqAu98jYIiogM22wCGn0JEwEh8kAGgKwMA0B4CwDUMxGkehTFWJa38oArA7D3KcNNsfGK+oz7ENklfKklgm4qTMupPwhcIDGKfv/dSiRYC0Aod/Mgf8NIFGcepFwQDeBEAgNMSB0iWagngcMRBAU7RN1UciWqXDNR4LElolq58hF8DMV1Sx/9bF0AcT/Px0DogLGCGrNeJVFETBSRAVRAkokaNiZbQhOjBF6OERk+xmlKHaMBHkzonkimMJCc0ip6jD4xN4WLbRAiEpJKTF1MRXifFsNyYsWBYoGEKOYXgDxKi+bMTClU9EPCLZ8LGVJC+ZJhFTBaFefgxYTTsD8GkjSYBmC8lpC4Bc/g3FHXfFZV5B57IfNvuwe+9zrFJhwOQ3gj8QUgvwbSR8bTSAAGF75oFIFWHItgPlQt4LAM0NY0qtMcb/Ex1jXHEv/so4FWLSylFpKICRMAlxIrQSitFXUiVWKpTi5geLxFgIZWATFLiPmkqctIiUKRCnFWCaVbWKprm3NUYVcKQtCg1MOQk3RSUr6POeVMt5fgxULDoUE1ZZU8A6viAbREGIsH7xNnszRVsiENK1cIoKLyUW/O/GK4IxqemmtlUFVRXg7U4O4Y6up4ypaNL4ACoFELiWsMpf/GFvA4WEqZa81lGKyUaS5Tygl2TiUivJaI5NGlU10r5Yy5FqL0Xsqxfm1g+KQHVoFcWnJi8mYShBMspihUSl4DjWg9hCxZHKodWq0ZGqXWX2EUmhNHLU3pp/pmll9aPlNvxZ/QlnaOlIAlEKENQSmFmpiKw0ddCJ15E2FOk+RzEkxupTgWF8K111rZWKjwtqTUhPwZewZeQMSdAjfwqSg46wrrIK+jNtbs0HD6m6EAeFq4QDzAAKxgDkA69dfYVlUJee6hayC8AgCaKuM4ADWtiw54VHrwAAUg9Bo/AFwoOI8Xe6FZeBDGCAAWjzJOE0kE9wHj4zYY0HHrzSOCB5Ptgx6KDpiFBg4GDFhXt2RqLEd74nW1nacvgW6sntKXr6wJPSB1rJiFugDobomqpGfemdEyn0UsXSmmlYh6U1uZR+nNHKjNTm8+20VCzuESnM1KgNSjRGjsiQfG9oGH2arnXwStwX33wZk7J+TxSrMHLi4Bty+z/1Ob0zECDXm220oy3B+t2XJUMMs2e2IwXCt2aFmOpLzno2usM++blzbeWSJk50OBFmQk2a2QseL9qNQOYK2V51CUNqECgHwc50FYJVgdG/Rg3BaTeOmE4RDeBmTsA/PwDAggLSEAgJRrOvIlz2BegWUj+wFxQFgGAMOjJmAzgrGgKspBq6Vxu0uKsWBeAmh2zkQFcMwCMHXEuLjqwZxkYOnaNLmR7CorQaR6uZZNLyF4L6CkO3tsOn276XggAUAiTBgZcpHSDmC4Iz/giBbwcrZ0zynNAoD7fc9Yq5zKky3MeemPQzBs5Dhe3na8FJEiYZyIwBoEcYBMsJNwQVgPgfVzgOLtgV44BVjzHAVj7ACyMEYIOVgVYfqvDPMAXggAyAl4AUbXxaud4QEBHGwSQHS3AUCeEGldDG0ESJ8oHIORC53rpOeQ9x+yQRBtnDs+BXpwHMBAbOYAs6R6XDOJILgDyc4R//Pne2+CQusbrkHvBkAm6zHjHb/P9tZ0FzoJ3rv3cOWLTJoUhUgnNdlZX+ZVrkgLHote3BjndPLd66lx4khndynlmRWyxlr7uohcT7SHUaab9lnrdftk/nu638g1BD9QWv3fhxrfbnW2SK3646+YS0A37KSpWcdjjO/wvymU8SOygFf1f2MCvECi+VpCRjgBX2JTX2sm4h6g+SgKUnLXUlSnX06m6jpkFRsV1ism3ibD+Q7QQOHQflzXcTBXvx3SLQ5VLU8Wf35WFVQI/0oIYI0m/yFypV/0yQfyoIv0EI2UOzmVYPMAKGMBOydhiHOxIC8RzGznexIyJyuR+ADzQAAHIRBfQoA9xmA+NFIacoZo5aQB4yAZxsgYxLhzAKxDCGUHgidWQAB5RkLObsT5ZOc0faTcUgSjSHCMJadgfgSjN+XgAItPQITSQuPOEGLqWw98fDfAK8aRToFIH9HpU9WVNA9BQ2JEJVTTTwbrcrRfAzPffFbmMaB2fdRhFiXLbhEJCqabAohLNyEDHTJ1epFzPrA/HmHqK8E8OAZgUccFZgpcaQ/qd0F2YaamPo0OQY4YnwKAT2IRX/YIvcRMXOKIecTHX3B0TQdMNObFNORYt+R7flA8HDZsewZ0RMSATsfgGMdjQvc4YIyja8Lne8duJGLuH8HuDGECMCcwyCZvYeAmImVCRDMmaeSmSo3ApsMCE4kY9bVIjEY9HpW1JTJ0JEpY0dFoubRYEWDoyNY5SZOIFfd/GkJAm0FA7faA3fLA3oqo2kiyE/M6RWByQAq/eHG/BdOgpxERJg4LMA9/QxT/H/bg53Zpf/EUkQ2ZXxQAyQyAnfWA+AjlRAriGkvAhAnfGvEFRkuE2mJsfA4/Ig92Dk8Q9UigjA2/cFfkhtKFJ/YUsg9U9gm0yUwQ9JRQfg+0k0ktKFOUkAy0yQiYpDOQi0BaGAJQ/EXYtQ/3PkbQ0nPQ1wewk0YwnqKycw0gSwx4+ALPMAOwisZgRww6FwtwpMHsX2IQGMHwtwfwqHI4rAN4sIiI9PaIwIS4+IgsxI+AZI1I4IcbKVLI/yHI0dW1GffIYohfE5GWVks0hWOmJWMLMbP1IcvpQgscorZeKcro0omWck1fakdfZAvAuk9Ahk+QbAw/Fkwg0/C0rk603fPk+FR/MtILNtEUgxIxXfSUvglpX0wAwMsQxUiA7k+NN8Ys4sBOSQZwlBHktU/+DUq0E840nU+kvU6xA02Y5k7UzggguWdkxcvvDlf09SMCtBG0583dQQp0j8l0xCt0ng6xD0vC6xaUgQ1i0i6xIC3xF0yQqQqgU7GICCqAPjKCmcSM6M/YWMv3YsBMnQ5Mgw4dPjP0e6ACBcMGGgKyFHYdcwI4lHRIHcNALOJIaSyuDxCsVuMAX0MGYcKAWC6/anbFd8RUEQLMmcVYyIjPSucYXIKufaSAJMKIXIdwiAcwInW3e3QI5yhcEgfaE0TQSwXYss/y3YySmwOwAnOQbIby3My4fy8we42Iw8I4rMnOBcACXwWcWjS4cXTsnsOSg6TQbOfsUnaQUoTkUgTQUgX0dwxIGMVnDcaAGsdsEQH5bDK5WALfInfBJMf7EQInIYyODs0PT0Ys0jcjGa/AZqqyn3OMuSwPXOYIjPSwKsFwAQTIfwC0SuSK9sXHBw3gUImAF4SuEkDkDY6HHMVgKAcwVQN+MIhKiOXY4dMOZwpIHOPODIDcflBa0s1w8cC6pcSIcqiyWGmAVndSy3fSGALOI6qGo4xap5C0doXWPkXY3w+sjcZgUIj4hHQaPYrNetaKonRqrwmMV6aK1QFuVI7oWRIJTE/Lci3IxEBYENCchbUrefXcmc0hGg//Hm9EtcmVfyC9abMWwo5iIUHcqNRgVbaAPgA8yk48rU40s8m/LClkHAo0vkLfOcu8oiz8x853Ki7JQUmZMYgVLkxi53X89igCt/Hi0AkCyAj/SQUwEAMpcO4wRgcwh0WkcOyOygDMf7ETe/DCv2l8iQg7XgBFM6rqSwTkEgB0BC8yb0/8zOpyASx2SYkAdkZMPcKGyuMGPMUcA8LOfgJcGMJ6C0WO+wLy3YrAFOiAdargJMqIR6X0FI0YPwN0ZAZAEAOvEdKgemwYwetADIMI3usOBFT0EIse3FZtDQXut+GnNcOsDu76UeUTYsFI78b8ZcjwQchhYciYL8x0NTRAcVLciWuJTonWyZDOwlaRIYDeORDWPpMu9hL+jrdEBYdoufP+45PW9bZfQ8qkzU8iU2nIn/C25kK2o/O2wikgzkt/IWn/F2gU2il/L2sUr/cxH/QB12gO6ZUQhUt/JUt+sOxeLQKOmOou/FcOjZcOrOQejAVOgAflYf2gAB9wjvSbkkh1taRc6PEC7+HJBP5R4q6hLa60417G6pxTdW7/B27O7qRTi5B+Gc42yidRHU77oFLx7hxJ6qhmAZ6kA56F6og9d9YV69GG7PR9ot6c7d7KN97Bs0Aj7+GT7od1wL6u6gZ4db776u0gQhgJRV4lasS36oGNNWjJyUnJqygk5fhd84h3dodEreBNCAABFwKsE8dXVwYCdDOAPjLqMBajNAPjIgYITQxycwOofKzbOsRPRQK4VQEupCwME2m2sybBpi3B/BlA4lQh4gvkUgp+f0shpiihh09SKhlgsybZ724lX2su//IQjlQO5xEVSQoXEm4IvYm5Q8PQDCi1WkTQkZzQigYlHfZATQ1KH56puc+yTQ++4lJ23NBdZ3ZdeFLOQLDEd3X5zgtzWFzzKtSRBFgbAtFlC0IoYtFF9SEVMyMfQXDCjshXIKK8VKAYnEsIvQPFj5Sl5Ur5K8UFlIYilNeXSAig43Gg5lnlt+xgTQspYFqUi53gJFj3QVtOEOsUkVjZTQz3LZiQpwDaZgJAUAMZg3YsPAT/EAAoAoIAA=="}
import { Base } from '@studiometa/js-toolkit-v4';

class Slider extends Base<{
  $el: HTMLDivElement;
  $refs: {
    next: HTMLButtonElement;
    items: HTMLElement[];
  };
  $options: {
    speed: number;
    loop: boolean;
  };
  $emits: {
    goto: { index: number };
    stop: void;
  };
}> {
  static config = {
    name: 'Slider',
    refs: ['next', 'items[]'],
    options: {
      speed: { type: Number, default: 1 },
      loop: { type: Boolean, default: true },
    },
  };

  mounted() {
    this.$refs.next.disabled = true;
    this.$refs.items[0];
    this.$options.speed;
    this.$emit('goto', { index: 1 });
    this.$emit('stop');
  }
}
```

Four keys, all optional:

| Key        | Types                                                     |
| ---------- | --------------------------------------------------------- |
| `$el`      | the root element                                          |
| `$refs`    | each declared ref — an array for a list ref               |
| `$options` | each declared option                                      |
| `$emits`   | each event name to its payload object, or `void` for none |

`$emits` replaces the runtime `config.emits` of v3. **Nothing of it stays in the bundle.**

## Extending a component

A component can take a props parameter of its own. This is how one component extends another:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"3049fc55555ee63af62ce243ac68305a2d5ce88ebd8a6f514cde5fb5f1492a79","data":"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"}
import { Base, type BaseConfig, type BaseProps } from '@studiometa/js-toolkit-v4';

interface ActionProps extends BaseProps {
  $options: { target: string };
}

class Action<T extends BaseProps = BaseProps> extends Base<ActionProps & T> {
  // Annotated, so a subclass is free to declare a different config.
  static config: BaseConfig = {
    name: 'Action',
    options: { target: String },
  };

  mounted() {
    this.$options.target; // string
  }
}

class SafeAction extends Action<{ $options: { confirm: boolean } }> {
  static config = {
    name: 'SafeAction',
    options: { confirm: Boolean },
  };

  mounted() {
    this.$options.target; // still string
    this.$options.confirm; // boolean
  }
}
```

Each prop is read as an intersection with its default, such as `T['$options'] & Record<string, unknown>`.

::: warning The price of the intersection
An option or a ref a component does **not** declare reads as `unknown`, or as `HTMLElement | HTMLElement[]`, rather than as an error. Declared props keep their exact types. This is the cost of making extension work, and it was chosen deliberately over a conditional type.
:::

`$options` is read through the same intersection and then mapped to `Readonly<…>`, which has one price of its own: a mapped type over a props parameter is deferred, so inside a class **generic in its props** a declared option is a usable value of its declared type rather than a type identical to it. Reading it, passing it and annotating it all work; asserting its identity, or assigning one option to a variable inferred from another, needs an annotation.

`src/props.spec.ts` holds the assertions, and `npm run lint:types` enforces them.

## Handler payloads

A method named by convention is **not typed by convention** — the name is resolved at runtime. Annotate the payload:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"8fb46a6401950bc407bcad04d23436b6283f7152c1c2b35a361ae809681bf185","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjAGwEM44ACABVdJjAMqcNHwaIAbFWYCA5mnxIp1PrJjiQvfoMohmASzC5EABiqN8fVoxrlJAXwrpsxgsTK6a9PAApWB9gBKThZ2LgAhdhgAHgAVTjoaMCgIqO5SCCwuAF5OSLgYdMy4AD4AHTB9AFssCFI0PKjdETEkACYARmk5BSQAFipRUjUNfNxpQ2MzEAsrGw9ETsdnHDxCEnJBxN8sDJx6jGCtATQAOkYIMAAzfVlETmAKzmfOMFYqmHuRUkNZAG4ni8LjVLic4PdHmAXtDOABhfD6ZhQe6YHAQK5whFIgFQl72HHQ/hXcGcb6/ZAAXRx9maQ3EAGYAOzdMDyRSSQaqdRMS43WS6AxGJBdGaWUjWWxIACcy2oLjW7k21G2iBAPl2mTImGCbw+XzQP1ZtNaiD6AA4WWz+pzhtzVbrxnpJsLzGKJQs2iZZajXOsPFtvKr1XstYcQhAQUZBCTIdD4YjkZwfejMQnqcb6koBnoeuyOtMhiMeZGwQLnYgRbNxfM7PSJN75aq/UqvBpg5qDsF40iUS4U92oBnxIyLTnWb1EABWG1F1UDstCiuuuaSqdepxy1ZNxWeFVqjX7bWcIkksmsylDpBm5ljq2mmd2kAnhfGStumtIScyjc+hUbXeBmqHwKNARx8CcpyXAOADyOBgD4wBJlyaAUJwWCsBgzAQKwUCcPY9wACIwDIsisDQUAAKIkII0QDqhZQgJqYAMSUgT3EQED6IOwh0sK+aWhOHQioWj5QViUCwQIL5IPSy7VqubQNlubj/gGbboeKwFkMEIloPc848SaHRtNmMjjuyyi6XgVkTIusmiiuCwdPWP6Nip/rKoB6pWFppDBOhmHYYmsYvPgMC3PgemvAArlUABGZDpoZmYVvSbQCeyN5WaqAVYTh0mIPZVbunYJlKb6O5qb4/j6EEnCGLYVzWDAnBESRZEwJR1FoHECT0AIKSNAUnC5GM0RjEUWQlKhADSfVJINZ6yCNpIGr85SVCC9StcRMCkeRVEnLoUAQIwCBzuJCTdWhGF5VApycAABrlQWPfVXAKC10VgLMrKdVdJycLAoiIqhPq4VcGRVEmYUhOJADkXCPQAJDAVT6GgcCPacl4Vn09lmXeHTZtlIBtXtHVdUdtnGEV76rvSk7lX+HmtkwbAcKmSK4x0k6joTE7TiotoaAZTp2XJJWfuuKwVapnltsBhBQGB2hnJcBEQJjsIGIwADWCFISLqGGLAtB4fcABKMBXIdNEABKxAAsgAMuE0VoGglwUTIHyCKx7GcdxIAtClHRmtMAt5sJyF4BrWtwDr+j6wVQvFR+izM9u8ts0GGnvOo2lGyM9yO677ue97vvUyHvEVlKpm5koD4aDZ4vGGn9NOS5sssy2e7eZphd+fVyR0PcYCxQlSqh+Inrpbegst3gpt0KnksZ2VrnKc2AFtjVdUNWQTWMC11u291vWJANXBly7Pto4DuR3w/ftoBt1S1Nt5920IIAnWdPAvBAo4U4LIfQ1EkwQCepcaI58SjRF/iUN6lhkgyFIHAB6j1V60DevoD6sMiSIzQhAOAGN9CXAqO8S4y1PqkgLgAWgdLhE8qE4DQNYJwAwIhOApjih7L2YAuCMFYFCBKUCkScFYBpM4uNOgiijleZeqof7dXXg5eSCx6T0izu5fugEj6kBPi1O+FdBGvxrgA86IBYiwwAFR2MeqYgRVdH6CEeg40ejVmpoQyEQLi8BfEdjQPoQJojcJK2gFwHwCUMCXFwnQ/gshopsFIJwF+1dBBeOPj4jGUjmDsM4JYLgrAiCsERKwOKMgoH1QaHFDAo8wo/FED9GAwQrh1E4FUUR+gsApLIr8Tg0R+GVzACUBImTManAqBUZATsCIADlODnzIAIU+FIfCRTQFkRAAB6XZsASBYX2KcKoEAABeiI2CQWGAc06cBdkAHUYBxV2QAQW4AASV2c40ZFjBCBDkZ6DKwosqx1VL88xkz1Hp1XH0RS285aswHpElWPBwKCEgmAR5psIAAHdrZkPOTAQ2MBupg2QhbTgABxLCcV/C/2iAAVU+UgtinAOJcTkX0ZQii8bKMYti3FBL4D6GJQVG8sKPS6N3lVPOPlh7BDJSce4LLf5yIkATJuU4BXKp0DTJAkqu52A6N+Xu2dkVeXzr5HSyF7g4uSPizgAAfVqp1Yo11nu0RkkdtWWXBcLIsBrEBGscqVHum4kX6P3gEOAwRDHGJpXShll94jX2SFwX+K0kEVE/nUBotKID0uYOqqgVi8CFuLUU8J6CbogNwhcQQ5TKishhi1Zhxd1BSOSGhNgaAOmkGhnq2RyU54RxBRWGOIsK3JpLWo4NobNG1gjb+C10aV6CByafTgar53/3uXgWxLUHGPV3ScDxdjslGJ8fwXY8AwSkk/tU6KBQ0kJp8cOzBnBPkNHwTdbaKY6Ess4L/LgHzPmoTxQiCwo8WDRVgFwMpPwIAvoBlkn0JSe3vtPlwfgfb/pe04C+sgV6JQUKEdM5iYA5mLOWTbVZrSNlbJ2fsw5xEOynIuVc1gNzZB3LOk8l57yvm7LPQCuRUoF58rBdO1UYm/6CmMIuqWpozT2ApOYaArhQic2OFk9Ng0xgPEBC0EJjBwzXFuCtRCDp7jwz02geGqFgS1CjJjCEXNcKOGPDbEkyB4YnUxpSeGFI8I4kBGJBMkl4KIV0qhF6oD8I7XagdS+dFODwyYvDViDx7AzNxPHbWusDaxeQibMe5skuqJONESFri345eAHlqjzxLgOpOiKolJLELDopSLKllaU01fk415rNIqDAVYEgUA6ayGXGsggew9ggA"}
import {
  Base,
  type DelegatedEvent,
  type GlobalEvent,
  type RefEvent,
} from '@studiometa/js-toolkit-v4';

class Child extends Base<{ $emits: { open: { height: number } } }> {
  static config = { name: 'Child' };
}
// ---cut---
class Parent extends Base {
  static config = { name: 'Parent', components: { Child }, refs: ['dots[]'] };

  onChildOpen({ target, payload }: DelegatedEvent<Child, 'open'>) {}

  onDotsClick({ target, index }: RefEvent<HTMLButtonElement>) {}

  onWindowResize({ event, target }: GlobalEvent<UIEvent>) {}
}
```

The [`@on` decorator](/api/decorators/on.html) does not remove the annotation — it **checks** it. The decorator derives the payload type its target implies and the method signature has to match, so a wrong annotation is a type error rather than a silent mismatch:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"575371f7f00dc8586f215abf918bb212a0962a27d14c61309e84bc8aad72b0a0","data":"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"}
import { Base, component, on, type DelegatedEvent } from '@studiometa/js-toolkit-v4';

class Child extends Base<{ $emits: { open: { height: number } } }> {
  static config = { name: 'Child' };
}
// ---cut---
@component({ name: 'Parent', components: { Child } })
class Parent extends Base {
  @on(Child, 'open')
  onOpen({ payload }: DelegatedEvent<Child, 'open'>) {
    payload.height; // number
  }
}
```

A decorator cannot infer a method's own parameters — the method signature is checked _against_ what the decorator expects, not derived from it. Annotate the payload either way; with `@on` the annotation is verified against a real target.

## Config typing

`$config` walks the prototype chain and merges every config it finds, so an intermediate class must not narrow the type its subclasses need.

Left alone, `static config = { … }` infers a **literal** type, and every subclass has to match it — a subclass that adds an option gets `Class static side 'typeof SafeAction' incorrectly extends base class static side 'typeof Action'`. Annotate the intermediate class instead:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"ea49f1b17a0644249e77aa8bfc34eb7dc11dff42abfd65a1797fd82177f22b7d","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasog4aZnaQBOKqxhgA5mj4SAAsVK6kfjAMiCAquN7sYLiIAAxU/PhuzPw05IgeAL4U6NjJBMRkTjT0TGycPLyJuQBm2TAOMADCEGDN7H7mVjZ2Hd29/U4ubtEATGkgPv6BSACM8+GR0bESY31+ThxJSPMZWTmViHNFJTh4hCTkYfJ4gsK8AIIARi6k2WhjaE0rEm4WiAHZQgtfAEgogVgBWMJuTZ4L4/P4AoEHRLJGbpTK/c55ABs12opTuFUe1GeMRYHC4fFecGUEhkcnoviUHUM2l4ejivJMg2stnscRB008AA5vNDlohIRsongJQkjpd8WdckgAMwpMmYW4xe6VJ41OlYTQ4OwYPhowEYnqAiCsAB0/B6e0Qoy9EyoU3ccJWkMWMKQxKRERVMU94326uSuq1hJ1+UNFJNVKqtJA9PqfCaZFa/HacV2/RFw3FOz9CecoNWMzxUKWsLWUZRMXLdexGuTIFOqYuKzBGeN5QeOYteatWjImD4PfjbrAzEsMB9P0S9cD0RDKzlbZCnZj4HX8QWOJPg4JfwuwXHZVN1OqW0Yc5ti99K9IMGacAAPxboCO7IAAurwAA+vAAK6KP+OJQJKQajvMYYKkqyJnn+AF9skiK3tqD4FOB6TQGUQxirwwAdBQvBGmWtbxrwBS8M0miWLwADkAACLiwVA7AQBurgAPQAFZwAAtGgECugA1uwaDSUQwTcQA3OY5jMiIDqppirocgo3JxDR5i8LwUxoOw/ACHWPrLns/LmWAlmWWuG4+tx+lOmALqsNxFAWe5uFwD6yDcZ8sFoHJYDcWRIUFFpYAFE4onMEgoDyL4cDCWAeBoAgBQFEAA==="}
import { Base, type BaseConfig } from '@studiometa/js-toolkit-v4';

class AbstractControl extends Base {
  static config: BaseConfig = {
    name: 'AbstractControl',
    refs: ['button'],
  };
}
```

## Compiler options

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Preserve",
    "moduleResolution": "bundler",
    "experimentalDecorators": false,
    "useDefineForClassFields": true,
    "strict": true
  }
}
```

Stage-3 decorators need no flag on TypeScript 5. `experimentalDecorators` must be **off**.

## JSDoc

The props type works from JSDoc too, for a project with no `.ts` files:

```js
/**
 * @extends {Base<{ $refs: { output: HTMLElement }, $options: { step: number } }>}
 */
class Counter extends Base {
  static config = {
    name: 'Counter',
    refs: ['output'],
    options: { step: { type: Number, default: 1 } },
  };
}
```
