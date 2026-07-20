# fold

Fold a value back and forth within a specified range, reflecting it at the bounds ping-pong style.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"c03acae9f4b53098912558e1bb2334a192ed0a3fb73d37a2fbe92d2f41b4bfa8","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwAiKyiMibQTES8wggLYAjMhV7r2YFWq069zWkY3bS3SydIAdMO3VYIpNNNmUQUCCIREEAAxGSheZl4FViVeTWYRAGsIsHD+dzR8XgNeTJg9HOZUs1peUiKAcxgAOh80ZgrA5GQQDjBEn3w0NCw4RAB6foArOABaNAgZRPY0arg0QSgJdRh66tgifsFxVjh+9WZM/vTZaq71VhAAXSuqeeYPJABOKlYYMArMpAAWKnrSKoMIInKA+Nq4RAABioInwDwSNHIiCeAF8KOhsBCCMQyHU6ECQCwOFw+CD5IplKorKZ9IYqfZdAcLPTrLYWWQnC43B4vKCqH4AnhQrIIlEKXEEskimkMlkcnkClJpSUypUanUGk0Wm0OlQuj0+oMRuNJqxprN5otlqtmOsYJttuxdvtDvhjmEzmgLtdbiB7o9EABWX6td6ffA/P4PQF4EFggwQgBMMLh5TEuKhaIxODwhBI5D++KYbE4PF55JilOM1kZBjsNZK9bIbOrHOcrgyvJ8AsCITCouisXiSRSMo8cqkCtpo5V5Q+6qjjSQzVaBl1BG6vQGwzGEymMzmCyWEBWaw2Wx2ewORxBnu9Nzu/yBAHYQ28Pl9ECH/jHgWF42AEIAMwpvC6ZIpCWbUJiuY4gW1BFkERKlqSYQVkoTakLWdKtlhjbsjYmGch2PJxvy/i9sK4SRIO+TDlKxTpOO2STvg+TTsqTKqvOtSLlqq7tJ0m6GjuJr7haR7Wme9oXk6V6uu6pznJcD5+k+zxvmGn7ftGqyxv+rwJpGICwmBiJIJBvoiNAWJcp2wC8rwKICKQJ68AA5AAApax6nswol7maMyybs7kANxOE4ZIAIy6NCvCJtwYW8IMvDRVFaEgbw8WJclqXpWAZKjLF2W6LlKX9GlPh+UgoD4u8cASGAeAjCAKIokAA=="}
import { fold } from '@studiometa/js-toolkit/utils';

fold(1, 0, 2); // 1
fold(3, 0, 2); // 1
fold(-1, 0, 2); // 1
```

### Parameters

- `value` (`number`): The value to fold
- `min` (`number`): The minimum value of the range
- `max` (`number`): The maximum value of the range

### Return value

- `number`: The folded value within the specified range

### Behavior

The `fold` function ensures that:

- Values above `max` are reflected back into the range
- Values below `min` are reflected back into the range
- Reflections repeat for values multiple cycles out of bounds
- If `min` equals `max`, the function returns `min`
- If the range is not finite (e.g. `max` is `Infinity`), the function returns `min`
- The result is always within `[min, max]` (inclusive of both bounds)

### Types

```ts
function fold(value: number, min: number, max: number): number;
```

## Examples

### Ping-pong index navigation

```js twoslash
// @twoslash-cache: {"v":1,"hash":"3c6f53b994544b5e90793b9e6eb693e6ef0d6614829781f17c9c1a43f7ca9243","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwAiKyiMibQTES8wggLYAjMhV7r2YFWq069zWkY3bS3SydIAdMO3VYIpNNNmUQUCCIREEAAxGSheZl4FViVeTWYRAGsIsHD+dzR8XgNeTJg9HOZUs1peUiKAcxgAOh80ZgrA5GQQDjBEn3w0NCw4RAB6foArOABaNAgZRPY0arg0QSgJdRh66tgifsFxVjh+9WZM/vTZaq71VhAAXSuqeeYPJABOKlYYMArMpAAWKnrSKoMIInKA+Nq4RAABioInwDwSNHIiCeAF8KOhsBCCMQyHU6EDWqteCJBKRSO80ABJVJ0OzWHz3R6IACsAA5Xu9PvgkABGABMfwegLwJLJFOpsFoYIMEIFIFh8LEuMQ3zRGJweEIJHIf3xIsk814rC4VJpFl43wZ/yBrLlbw+X2RgoBqzwxvmEro0rAEIAzDC4eUlUiAGxq6iYzU4nXUPVBN6eUXksCmyV03F3a2830vQkO7mIfnO4VBJPis3eiEhgOKxFISHhzAaoJajOx+hMNicHheOTRJTp0i6fSGVRWUwHc3Gay2Mf2JwuNweXs+PwBPChWQRKKKfLxJIpNIZLI5PIFKRFcKTsqVGp1BpNFptDpULo9PqDEbjSasaazeaLMsqzMOsMCbNs7C7Pshz4McYRnGgFzXLcICMkCPLMr8eZcj8xausCYSVkg1byoGCLKhhjaRi20Z4h28ZEmWKaelO44xmhvLMrm9o4YWcr/CW8qksmqZeq8MrETWQZ1ogfINuiEbNti2p0QSIgGp47qiealqZg86GstC2GOrmAn4a0JosURiAkQq0nKt8PJUUprYxjQ9GEomwnlmmc70npTJ8iGRk8Y6RbUEK5lMdp1m5nZ5FIvJ6pYq5qmdhwXB8CC8i7oOw4GHlJSDrO05kAurgZCuVBroEIRhNu/Z7gkySXtIHgnlIZ4joeJQ3h8d6Co0SDNK0BgvgQ3S9AMwxjBMUwzHMCxLBAKxrBsWw7HsBxHCCCFITcAVAnyADszIcvmuERS6BIgrFUkJZxzkpbRuoeQmxLecxZqDla+lIHyhnnbx4VmWpn0xeJPrPPdwb/UlinPSpr1qRpRqWd9Fq/UyvqQjyQMmXhBJaVZkMQnFZGwyqTkoepsB4IulXAL2vAogIpArbwADkAACAHLatzAzd+81oBtkFwJzADcThOO90UsbwAC8vCQtLoio8TZpKxaatOIMvAAHLMEQ7AVIc+TpKQADuDxQLomgQMIIgGBUESeGe7xQE48ta8r2U+5KvAANS8HjKu6JrkrcJLvD62HAq8P6Fq6EnfLVOnMtgPrRsm2bNBxM1NukHbcSO6ILtu7k+D5Gh3vgwrfthIwAd0Lwoyh7o0Jox6ZrR7H/Qd+Hg8J766e1FQAtIKA+LvHAEhgHgIwgCiKJAA="}
import { fold } from '@studiometa/js-toolkit/utils';

let currentIndex = 0;
const lastIndex = 4;

// Navigate forward, bouncing at the end
currentIndex = fold(currentIndex + 1, 0, lastIndex); // 1, 2, 3, 4, 3, 2...

// Navigate backward, bouncing at the start
currentIndex = fold(currentIndex - 1, 0, lastIndex); // 1, 0, 1, 2, 3...
```

### Sprite sheet scrubbing

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e4d5290ec89d817bd7bc18663bcd1c721d11118fdf053eef33c10484d5a1a26a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwAiKyiMibQTES8wggLYAjMhV7r2YFWq069zWkY3bS3SydIAdMO3VYIpNNNmUQUCCIREEAAxGSheZl4FViVeTWYRAGsIsHD+dzR8XgNeTJg9HOZUs1peUiKAcxgAOh80ZgrA5GQQDjBEn3w0NCw4RAB6foArOABaNAgZRPY0arg0QSgJdRh66tgifsFxVjh+9WZM/vTZaq71VhAAXSuqeeYPJABOKlYYMArMpAAWKnrSKoMIInKA+Nq4RAABioInwDwSNHIiCeAF8KOhsBCCMQyHU6ECQCJJPMBOUVgBhCDCNAqAAcPnuj0QADZoa13p98EgAIxs/6AvD8MkwSnUsEGCEAJhhcPKYlxLLRGJweEIJHIf3xeDennESTs1gZ/yB3IAzGy3h8vohftQHgKgnqOq8JUgAKwy+HypGo9HUTGqnEa6haoI63LsfWqKy4u7GnnfC0c622/mrPBO8VgCEewmyhEK7m+5VYtWxkP0bWrCNR4yGuMPE1u7mvZNcm1/e3px2R52tV2IXOwr2IpDmpX+lVBMvBmiVoJEsAkoXMFYG8uMk0Adml7Kt7dzaYJK5WWYhzM9ctHiFpE8wU+x6rx85ALA4XD4IPkimU0fsun0Qw/2sADzHXGxwKcFw3A8LxQSoPwAjwUJZAiKIfziBJkiKNIMiyHI8gKKQcJKMpKhqOoGiaFo2j7Loej6QYRnGSZWGmWZ5kWZZVmYdYYE2bZ2F2fZDnwY4wjONALmuW4QE3HlaSTfcfk7AFuxAEEzyQC88xHQtmTvANpyDZ8CXDJ1wKNRsFNzS1ORUu01IJTMXWzbTLwLJFJW5QyHxnUy8EXZdhVFMAaV4ekGyZItbTs61eVUh0NJCqkwq0lkPO9MdIRRWSiVgPBoIyXhgDg3gUVJCB1F4AByAABTiliqnjhjGCYphmLYdjgGqAG4nCcILPBPEVUs8ABeCL+rAJxBl4AB5OARCE1hDnyTJSCpCoshGvpeEhXhACTCXgtyO/azq3QAyAicdJSF4RhzN7XhJshXqa2SAAeXhJVe97eAAakm7k+GAJxeF4IbSVXfJJq/J1dGhKGKTG3hRl4YG3rmxGW14S7dC3XQL1xhHdG5a6wBRHwVnqJBQHxd44AkMA8BGEAURRIA="}
import { fold } from '@studiometa/js-toolkit/utils';

const frameCount = 8;

// Oscillate through frames: 0 → 7 → 0 → 7…
for (let tick = 0; tick < 20; tick += 1) {
  const frame = fold(tick, 0, frameCount - 1); // 0, 1, …, 7, 6, …, 0, 1…
}
```
