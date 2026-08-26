# useWindowSize

```ts
useWindowSize(): Service<ResizeProps>
```

The viewport size. It names the default case of [`useResize()`](./useResize.html).

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"d809fbfc3d5ea5f72ee31c78051c84c9b2051d5d2b65b3b175db9c6d7f4be886","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvQXBgB1dmCgQA7gGV2ALxiNuiXmrJF2ImAB4ASvC0wACqQhY4APgA6YdgFssEUmmmyCkqqGtqUIMoiCIggAKqyvGj4MLyk1tq8sqTGpgK+icm8xjAqPn68gCgEvAAGMjBWcDa61bxgzJ4wUBQFKSrMGO4AaoIw8SlwWBxocDV1AKKsMB1gaKE6MKzcLfwOnrOBisrqTVsAdOFwaMx+SACcVItgAOZJSACMAMxUV6RPMAwxOpBI5rcIcMC4RAABioInw12YYjIdwAvhR0NhIQRiMjvnQASARJJLtIwHBBAAjOAiUjsCkwfSxMmU6m0+kXH4AgBsXIeMGer0Qbze32ufwJwnJVJpdNwD0UkIATLD4aRETRyIguWiMTg8IQSOQ8fQmGxODwAvJDiETvpDNkTOYGjZ7I4XO4vGV/EDrccwlRItE4gkkik0o0Mlkcil+PlQ0V2CUvZV9vV0jotq12p1uvG+gMwMNRgkJlMZrVZAslvzVk0NpmdhA9hWrcE/RnqucqJdrgCABwwkCPF74d5fahi/54H1t0HyiFIZWE1Xq5GIRVQnXUTH6nFG6j4pgdJLQPj26OWdOupzdIgQdhQZynKWs2WMERsVgUxEAaztRkdABhT9vxEH9LwjOwHBvIp70fbpHHEYkAH47RZGV6QAeSwJCyT0XgmRfDC5QiCAojwNR0LZFI0AgHpMgA0xuh7PxFCeXh2H8dh+A4/w+hmSB/FIYQPGeLsJyeaJkGQEA0jQQRSDJcJCKo2VTl4AAVQoo0dTJaKcXgVE4/BeJmVguH8IjqNIc4AF1bO7Tk7l5Id+RHO5RV+KcYis2UwQVRcVQRJFNQ+bV0W3PUYgNXEDxNGJGCwBFjzIPgjKgJJ9DAQRPHpfcWIBN4oXuVyBVHRAAFZPPFPB0teeclSCtUQqQAAWW4t0wKLsUNcIaHikBEuS/5Ut4ZJ2CefA0CynK8o5Xt3jeFzh0FFyfhq6KYAmqb/IXdcmtXTUKvC3UsRi/d+oJIa1RS0g+F8RMVmYXD9GdbRMNpGtnokMB5puIVFVavkysW6rvJAB6vtw3bGuXYKNSQLlWs6ndor3PrDxiIhrl4IkyQgRZ9EA4kCZIgr3la5a3MFAB2MGCTxuBSZhpBxzheG10VFHuvOjGBsYY9CCgPhifxxZTlYCAnkYU5ZagZ7mH0ZgwAwZBbPwu8H3CQM8C0lIACp9eqRnSYlqXmkNvTvpEXhBegXgIEENAsCdmZmFt+A4GYP5Ejo+MTfF9x3GQABZAARAA5XgrH4Mh+VMWzGCm524EQAB6NPYBISWcBszwIE0dhWHM05fCeTOyLgNO5BgCk04AQVsABJNOA5gNPJaeAB9HtxBEbg/sKiqgdK9zEHHdbwc7lnx4OlqhU3CKurO9HjSupKbpGu7DIfTLWlm2LyaFCq+2BseqonLyCTq0cGtZueEaFZGl9RnrYsupgN+zDU+HGybpv3rlQ+TkhRcgvitcqa1JwEj/jtO+s84bNUfoqN43MV69TXp/YaP8HafSei9aO6YPqPSuNDRyC0hQ03HBA0Gl8NoQzwaQn6M82YrnnoqDqDlCTQCxJ6Xw/hgCWmBDaDIKIBC7F4AAcgAAKXEEFACQx5mBpwAFZwAALS0QJj+Ti6iiCtUkQAbiDqIYk3pmTSmorwAAvEI30axdDPlUvSRgjBBE326LAtACFGHfUkLwFEfBrHOF4MAdwvBcYk3Fp3RgHixpbX/j4khfiwDcGMWAQJhjwhKKQKAfE/JGiSDwGokAKIURAA=="}
import { useWindowSize } from '@studiometa/js-toolkit-v4';

const unsubscribe = useWindowSize().subscribe(({ width, height, orientation }) => {
  console.log(width, height, orientation);
});
```

Props are [`useResize()`](./useResize.html)'s.

## The viewport is not an observed box

A `ResizeObserver` reports the box of the element it observes. For the root element, `clientWidth` and `clientHeight` report the **viewport** and are decoupled from that box, so this service keeps a `resize` listener beside the observer.

That is the difference between asking for the window and asking for an element that happens to be full-width.
