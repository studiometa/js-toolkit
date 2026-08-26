# useMutation

```ts
useMutation(target: Node, init?: MutationObserverInit): Service<MutationProps>
```

A general `MutationObserver` as a service, for "tell me when anything under this node changes".

## Props

```ts
interface MutationProps {
  readonly records: readonly MutationRecord[];
}
```

The default observation is `{ childList: true, subtree: true }`.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"2877deb299305fa77c5a3e603225b1829c582dc824b9ee8284def183948ea209","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIBjVlzi8AQlxgAeACq86NMFBHi4MAAqkIWEQF4xEjVrgA+ADph2AWywRSafasogoEfgkQhp+GAKFwRMCSkGAIQ1hBgMGD28lFKAHROaMwA5u7IyCAcYADWTvhoaNqIAPQlAFZwALRoEBCsOexoVUQALPFwaACuUOxhMMnxsEQlzFjsJSAAulNUncx2SACcVKxRKWj4SK1UyaQpA3gquKvskUgADFT8+AvM/DTkiEsAvhTo2LgehEFJ8kxsTg8XgAMy6YAefTAvC6qgAsl1kmgoYw9gc0IheAA5aAwCi8M5NAD8mIRSKhAHkAEaqUhBACSFjQ3ExAGUyER2PwpGTmMiIoZtGYLOE7DD4Yi+VCnC43HhqbSSLwACIUuG8SyS/lgESbTRdFL4XgRHxCABeIUVXJ8OFIvDRA14zEUxppHKlEXi5nMXnYIj99u8vAOkVIbCqWC6pBsqldirImOdIUgsHxSd4AANedqFRyyIymhmKOZYBwgjAoMboZsbUI0CDbJYAOQiCAAd2rVjOKXivGkbYgvDAC00bbI9rqrBE/H6oPYpE6XrAGbbfJuAEFCqR2FTEfBGDBWPj+GxWFT7jluBneKQYDY7K3IqE2PBuZWbs6DrxbU6tzu9+YEAglWPiHjAlhRGgaYgo8oThJE0S8BwIIwPwGCCD4twiKohRrJWgAoBDeMD3EaDZ2k05htt4kRBIGPgAI5dPA2oEiIpggFRfK8L0labAGfJoNuu40LwVKof07G9l4Pi3ikfqCRgLbmGcjzDqwcZ5natyKGs05hDYCH2L0cAzkEITOpWsCCAsFbGlg2pwAA3EOEB8WAKTmN4t5EVgQjcv6UFOi6zC8HAXQ0vwQnjpsXGRBWupBiCYYQQOpA5C2xodsapCwNu7nmMwq5NCIK7UaqcLsrhFaMFeoKaJYBJoNOp7nvwOSJLsqTpJk2R5FQBRFHApQVNUtT1I0zRtB03S9P0gzDKM4wlFa/klLCMDZlC8QFJYrDTLMIDzIsiAAIwAKyrOsmxICdJ2dfshweOtm0RE42RfFcIAfmGDxkDdZ1vB8OB4D8f27P8HjWf4vAAMIQOCjxOEdDCIAAbAA7Jd7nXYgmPUAs6J4HDCNg1kZxfAATNctw/YjaOA9Qnwg8QpM0PQAIcFwfBQ8oEgyHI9BxLzqiCroDjqJoQrKaK9jHDKrjuJ4QY83IZlwQZkECwoCRJF1SAZGTuT5IUxRlJUNSThNLTtJ0PR9BB82BItEz7XMewowAHAAzFjGxbIgOz4w9KMgHLpznIgVNfTT9x0xTFMM5gwPfCz5Dg+zHiMFgktkJgfDE9EZDxDOYAguwKSYsA5i8DXQ7MBBmKdHlKSOdXte3iCQ2hYJ3bIFMrdgC8SPu8sKxZFd/uo/dhOQxEZcpG95NID70d3L9TyvO8jPJwQqd/BnIBZzndgYHww4N93zfDwsKO3Z9azY/7gcOiH58nIbXwr99sd/ZHFyJ0zFOvx04hyPloXOp8iKd0bj3dyfdr7HROhTPGD8/bbGno9EAHcEDh0/tTNedMvbowATvUGadqAQ0Pg7QgUB87w0LqQeIlh6E0CgDVTEABVHU4UTJRXlnKDwAAZdgKE0IYV4IQCAOR8QQWdPYWookfCp23FAWAYBexwmYCEW83RSDQhChhZ0XQsCgnBJCCI5hGC2CCk6UgYYQhATopYPgMV7CkHBI+OiQ55CZgACTgmYQjGq15CJwAwBCbKBUwkQkQN6aEtcuDhP4BqFh1U+BV3ibXUIOp7BwHLmpXgehCrMCaIGP08RfFnHKKhNAjBWT9DhoXeg3AB5ZJrjoqM0I8kpDUh0HhkUdwwEYIwIgbAmJ8B0MYXgwBeCADICXgLwWltxri8OJ651YmkQrERQ3YnQanYLQM4RFdE6l4JxewpTtlKCdKwCIKQzlNCNMVQCHZ8RHPTJETo3ZYlgGWSkkmbD0l/PaQMTpvBkBhVtEw1JgL8Q1UKVMmZ8yXj9z+UPN2N8bqtA9r7HGeMX54ECYXKAi8I4XVXrTX+Cct5Jy+LvYBFCD4sE5sCZ6WoUQv0xDiVMBImQkl4C9MAuY6T5iZCyXg7I6TWkkIK0WworD3nsGy8kr0qCykVsKpU5UNTsoiAlfUhoQJIWYBaUKHJrTfmigTR0FkNJ0g9OouJvp/QJR8CGMg4ZIzRggLGCAboRWkETGAZMuI0zBszIKzVorCzFkUIedg5ZKwRC8b5PkZFmytiysiSw3YpIDjrnY9s0VJx6QgnOBcaAlwrjXPgTcPdhL7kPMeFqF5aq3kVY+HwM4XwmVsh+dyNpxwCSEgBSAwETRyDWBBaI0FYIzngprZCqF0JrAkVwM1VUCJERIqCaxFEwBUSiIEaKQZGLMShKxXg7FzncXYLxfA/E/wNsUfOmAkk+xBlkvJYISkLAMIKX6+MWkLK6Q2YZW9JlU7mRdFZIQt4k32ShE5FybkPJgC8jJO8fl4CNTDZWEKYUIpRTtK47x8UvFJXrjAVK6VM3QlsLlbsBUipNUzIesA5VKpoDwsEuqYRGrNVYGeC8HV8ZpH1j1M4fUCAmyGmbUalsmjW2mnbOazAhhOzGBMFa8A1oShVeonae0ZgYsQejO649H43QswSp6+mHWkq+FPClP8ni3RIXSsh+9QHZ3ASfPgxxJDHDlRUw8mIAAS0g4SCIAKJTsggg2+HscWWbQYgFetmQC+MPI5pAznv7ryQBTD2HnmYMrZj54+ecBW6qFf6hkTJi4PtYFAYRnR+VUknMRaEAAfGEcay6RBJWqhWeBKoTntO4nwIidUGd1IOF+GUbjsBa7efR3kFFiTtSQKAonkY3SWOS1BOMx6ZeWy1trDBcF5fwZSp4XsAY0sAfS1mlDGDUOgHwSVnJuQytq6LfERAIB3uMH0ojgzGAniE61HIbJzXchhi2tqf2DMA94EDkH+ItAOX5ayfpUUKSIb1eKrhhHeGDP4YrPH4OtsKJrGaqV3J8TI12aUmbpTVwiEgG48Ef6ey63EygTIHS9E4JAKT/HgypJBh093IwDzNgCeNZ0UKkuxKMNdodEekcTqB2O/7U71qQ5k4GWJXLaNbuuaQGdVopWgGvaZVgO4DsyB8FvDOHKXdbzMBcGAVgIRBUACVxI5XgSNgRSsfDnjQDcLxgHNK8HKLCIy8bE1vPo/Vh12VcpLnMPSC5IhRkcErGRLxUAoxZ8cfTqH6kIj+8xPT2XUBJYBQKjBMgq5Pf4jEiedaeyMznda/Ja87uGMSPqNc+nKYcOlNvMwnbQUoDmB0SUvnXi/D2Gj7HgcXQWu8ByDAO8ezYDJBuLZQjglD83ITT4Uv9Ol2AWAvTp3BxewZmQPET/o/PdTGvAGQgbYvAGA8M++h+JiJoe22u8cKCE8SA+KRueA3+Sg5u+WMchWaMxCT2pCe8ICTAvmto1WgWwWLeoO2WrAEWUWsW8W0QiWRWNuuK/sGWCBHgZB5ueMBWdM7mWBnmOBjKlWfm1WkW0WFIpArIAAagAOJxbgSQRDB8gSAYgqhqisiwIpCaJYCU54DIBwjKhYi8DB4oRrbchTCMADSmwlDDCHh+bQpmgrZCDxC2ApAWEKwlAADqMAVIJQ64ag9IJQQhVBMh0QFh8hOE3AtBkcZ0KW+ucBGCIcUAIRhw12uMlu6B50duL25CFWTAZwsAtAfAnGqh6hEKqhUwMCzcvAfW4IsAg2FY4RFMqMzm0RiA5KZ2LCbBKRccXs6RXmuBHgoydoKhzcbIqhjSTcXQDwtgliReTE/KSYEyUyTc3YmhHg64Qm7YIglgzo7AkYdYF6tq6aAkuyVePiix7kIgtqJ+ZAOaw4LEtqtyJ4LEjiZOqhIgbYjyRypxaQkBmKkc6MeusBFuQcM8IAgxSxSR7BaBhCJ03RvBWRmc+BECAWfMxBRgpBYWvA/h0h06V2WuPxxWjRAJTBwceArB4JHRv8rQXR3BZWDu/BBBkCagNk0Q3KMATWK2zeUQFB0WcMQmNS0o4eisweJyrqAgzWlYYE2JcAueYA2huh+hMAhhUQxhphsmw0lhtyUKzCthQm6mjhzhbgbhHhXhPhJQyorgXQ2JJQg+a2YRpmKMFMSw98AJKWZ2Ypa27RLm6BrQmBQMPB5Wb2CJ/mGJlBPJaw5iYAxw8Q+umIYAFp6uyxkevAAAVEmRmP4aGXyZ6PrhmCmd+FVtoqCqLl4rGZYOrsaMBE0OBP6PosGdyfUGGdqNKbKXoQYWQEqTACYWYXJhYcehqUXFqXYbqfsPqXAIaZ4d4b4emfWZmWACUPrrabicdA6WPE0c5pltEWSZ6XTGdKjCitcLiHgAqrYPYDMscPiMqlni8Hxg1E2AAAK2yzQOzMAjQWzjRNBNgDzmAqwFywRXLCw+AZI1zzDIjJIlzzyFLTJ1wXxNg/lkBNj4jYKYjIBNgcCdBNhTALKfnxJEqsLwqAXtyFnQgXnaiogPpSlkH4gzKD6XYN5TYLLcBg7k5iTDIzJIEiCLIIrTLAplLkWHhyHJA4TFwsIQWgnuSkXlJkFsmrZRBRkTxLKZL0WtILLmDoogBPlICgDbJ5KvQeCVAgAvAvBAA"}
import { Base, useMutation } from '@studiometa/js-toolkit';

class Counter extends Base {
  static config = { name: 'Counter', refs: ['list'] };

  mounted() {
    return useMutation(this.$el, { childList: true }).subscribe(({ records }) => {
      this.$el.dataset.count = String(this.$el.children.length);
    });
  }
}
```

## Reach for something narrower first

| Want                                         | Use                                                                  |
| -------------------------------------------- | -------------------------------------------------------------------- |
| one attribute of one element                 | [`watchAttributes()`](/api/dom/watchAttributes.html)                 |
| a whole namespace of attributes              | [`watchAttributeNamespace()`](/api/dom/watchAttributeNamespace.html) |
| what the framework already reconciles        | the registry — it is already watching                                |
| a subtree, character data, or a foreign node | **this**                                                             |

## It keeps nothing after the delivery

`props()` is **empty between deliveries**, so `{ immediate: true }` waits for a real batch rather than inventing one. That is the honest answer for a service whose value _is_ a batch.

## Platform timing, not framework order

This service delivers on the **platform's** timing. A subscriber that needs the framework's order awaits `whenDOMSettled()` in its callback:

```js
useMutation(el).subscribe(async () => {
  await whenDOMSettled();
  // the new components have mounted
});
```

## Keying

Its key is a **canonical init**, through `resolveInit()`, which keeps the DOM contract rather than sorting the object blindly. See [`perTarget()`](./perTarget.html).

## Mixin

```js
class Counter extends withMutation(Base, { childList: true }) {
  mutated({ records }) {}
}
```
