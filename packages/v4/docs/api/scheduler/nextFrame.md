# nextFrame

```ts
nextFrame(): Promise<void>
```

Resolves on the next animation frame.

## Usage

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"5bd2ea2df537fbd4d8e30b8937c4d42a0f3e9e731289603f06d930da45cbd2e6","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvMHTQAxUswC2MRt0S8ACqQhL2cGAB4iEdlAB8AHTDslWCKTTTZC5bipQIIhIhABBAHdmdic0fBhnel5mGyVmcUkBRRUAOkpqZgBzH2RkEA4wAGt0/DQ0LDhEAHoqgCs4AFo0CAhWQpCGogAWFLg0QSgJFTRmFNgiKuYsdiq4EXCoQVYyKpl6V1TSpVYQAF1dqj7mRyQATiplsEyws6oR0kyYBl81+WT3fPYZJAAGKnnjswxGQzgBfCjobC4XyEEjkO6yPBCUQJKTMfg0UgAeRkG1UMFYGgAEgAVACyABkAKLLFRgNDqLQ6PQGYymCzpI4nRAAdgAjBcYFcbog+QBmO7HR7PEDozE4mB49IFaEAJn++EBwPIooArODITg8LCQQj6EwsIDhmQ+ATieTqbShQxDvdngAOXWC4X4JDqjIPJ54AnKr5qjVazF+04G6hQ43EU3URG+L6Y/hAiKkyk0mB0l0gTzePAk8K8ABU5YABtnHXnnVXK7w02QMyIIqQYFhOwZ6XBomAMLxa7wCfX6SleABlXQRMf5/uDTtiVhD2xYJ303hhfTN+mtzMUXgBfDsZa8CBhMj99ebpwhXhETgDvfpzPbzX3sDhUghG9oFJrGsZAyQAEQAOV4AAlGB+DIIV212RhSnKSoanGAkIBwUgUiUCAAC8z1YUYHEyKoizgKoAHUYAAIyqPxNAASSqWtc3zbhOTdJB3XOfIhWuX1RQFANpTwNi71Db5EH9AFFG1JAxTFWNMCNGFE3hZNzV8RhLXeTFbUJYcHXY50uOOZ4+R+AA2b1BL9SVAxlEMLjDRSI3kqMZJU+N1LhdIaG0kBdJ0bDMD4UyJxEYi4DgCl9DQDRQKxMkSQgQohXivp0goksy07ZgoAaSRVwratoq4OKEsbcteG7LCyEwC9+A/CJIq/N9214ERJBGL5+2YXgOBIXhktS9LMoS7rWmWMQJCkTtu3gZ0vkyVrupigayl/WjBBoZr1vnZ1J1LXcRBiVqpFoiJBAMKBtwgXg4hsLAlniCIrw2yqhoSwCwGAsDIJguDO1EGAkJQipqnImASFYBqcLwwjWGIlJSPIrxKJo+jGJY9qqgq2KsoZczuSsvjLnsxA+PuMTfEJqrstc6SJRAOSgS8/UITjNSCA0gKU2C4ZCCgPgxrSjKwGJlJCqgRgUgV5pJcqXg+l/K5kF2RkTDMHLMbyiJKyrWW1Bqp6nhFg7PvFiapamltSDbCJZf7T7MnYEgpCVoVXcez6OD6I9dBCcQrgHIcwniaJO2iVgCqgIclt7ACgLAECIOg2D4LBiGyih9DYcw7DcIIoiSIeDHvGouiGOYqobcl4nJigUXScsvkKYEkVWdpoNfFlqToVZ9mFL1HzeZNTTAplFgOC4PhXjxNQNG0YPWR1ixrHXBwnEX949eLXxAmCUIy1eAdbHieakjcNJJWyJBck+IoSjztC6kaZpWnaNBOh6PoBhDCeKMcYkxpizHmDARYyxSCrBcO8FIWwdj7FdBZJAfIug8jsiKGmUo+7gHgW4QeSAugeQ5iCRA7px7Qj5v5M0M89JuAMqOIyElxwFi5JZay/pKYin9L3ZyOxmbQi9GzTUnkKGqmoQmOhWkGGhUahgCKd4UgM2JklFKEtJpM0LPrXwpYOwwEKsVMApUjZqOqk2eqYUhwQBap9dqr4DxdR6vSYIYABo/RGg3bRTgeooxgHNRIi0ewrTDp9Bm0RtrsF2vtOxh0VG8FOv2c6XtwhXRundB6T0YjsFesRfaETNo/T6H9AGGdgbZ0QshN+0MMLw2LkjMuaMK4UWrjjOu+MLF9E4qgsm1lRG8KErgpyeBukFhVEgURI9ObSL8kmaeTBhbQDFpo220sTYKxSN7DxGg1arU1trdkB8fAgAMWVY2LdTZNmWfdeJ1s1mN3tvuR274XbrXdp7B6ytsn+wSkHPQZRVrhw/FHY4zs45GITnVUJE5U7pyBlnUG1TIbv3qQjEuyNUbozadjWuLEfF2z6M3VufTLI8kGV3ISPc8EygHsIqZZDR58n1AcNm0AaHb0cLwYAkQ3huF4KCJIuheAAHIAACADBizhGB/JoLQ2gdG6KKgA3KnLgGBRACGEEEtEGIyAKiXnaYyOY7x8GANYXgLDVGbQ2Vc0V+gGjOjIKtUV3A1VSGiEEB8e83BqA9VagkNrKp2rlg6xoHMPYwDdR60E6RhjMCQKAWQPt5p4DQAgUEoIgA=="}
import { nextFrame } from '@studiometa/js-toolkit-v4';

async function afterOneFrame(el: HTMLElement) {
  el.classList.add('is-entering');
  await nextFrame();
  el.classList.add('is-active');
}
```

## What it is for

Letting the browser see a style before the next one is applied — the two-step every CSS transition needs. `transition()`, `enterTransition()` and `leaveTransition()` are built on exactly this.

## What it is not

It does **not** mean "after paint". rAF callbacks run **before** style, layout and paint, so no phase inside a frame can read post-layout geometry. `afterWrite` is removed for that reason.

To measure after a layout has happened, measure in the `read` phase of the next frame — [`defaultScheduler.read()`](./defaultScheduler.html) or `$read()` — or use a `ResizeObserver`.

For a test that needs several frames, [`frames(count?)`](/api/test/) is the same idea with a count.
