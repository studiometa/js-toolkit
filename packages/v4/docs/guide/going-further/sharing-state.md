# Shared state

Two components that must agree on something share it through **provide/inject** — the shape of Vue's `provide`/`inject`, with the mechanics of the WICG context protocol.

[[toc]]

## A typed key

A key is a value, not a string, so keys cannot collide:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"b23865975d84fbae5e7d1d7ede9185602c0a475425895939188780bb34a59a1c","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEaRjMaAYUk16AHgAqvALy9hAa0gB3MAD5GsODPZZxkgPyJecNKXZgA5t0dKwKtAGkYDA0TAB0wdgBbLAhSNGlZeRgfP0oQKAgRBEQQBUSaXmZeTBwoaWU6eL0ggDo052Y4pABOKlYYDzR8JABGAGYqNEb3GAYcmTlFCvo0jjBcRAAGKhF8RuYxMhaAXwp0bAWCYi3ByqY2Th5eNxpSfg2YXgBldncwNg1tXTADCGMwiLRWLxF5vNhpDJZPAAQV4iTE7BIvCIbEEj0M7C6TgwonwpEkEEEcCcggARpZXDYJGA4HUqA0mogAEytEDtTrdRAANkGw1GeFB71YszcC2WIFW6025GZzV2+xweEIJHIpxmORuZHuIkeTw4sFI0Kw7HqQ0ZAA4BmyOu4ui1eaQRmMQHr2AajSa2qKkEyVmtSBtbr1FvLqAclcdVdQzjlGFh8Tg4hg+K73caag0aI5BR9gOFeAXrmBYLRHGBBJFSWQANz5wtoCBDVhlitV0i1sDbEymxpjZoAdjaNrtiAArA6nXhM7gvfMkFbJQHpT7QyVDsqTtH1SAWBwuHxNXcHs9XkLPjp9EZTOEojE4iewcKqJDsiBYfDxEiUaw0bwMVi4BxVZ8UgIkSXJKwqUkWke0ZHpFgAFiHDkkB5ag+WdHMnzZb1EAXf1Ay2RA5T2MNFRyDco1SWN4wgRNMAPYs6BbStNwZMYen6ZDbU5cd0MdfkNSY2gRTnPC/SlINEB6c1V3DCjIzSaid1o+jk2KRs2BYttYI4plzW4kc+LNSccgbJtRIWfDJKIvo+jk8ijhVJSYx3SJRkIKAU31MgPRqdwIAAOUqRgvGRCA3V03oEIM60UO5CdBJAALgpmWcFiQiUCOXZkHPXRS1WdERoJBHzSBSSpvGmAIglUVNfONbt6TNDjzXFdkeN6K0TKS+ryuqyykEHLKbJlfo8ojZzCvOPcrgmJIKrUPqPTMCxINsMAHCcFw3E8KrfEqQJgmWxqbyBe95qmA60vSTJXzySZHiKNcymK66qlqKLpOaNCOpHLj+NMiV8mSAb0qGiSlyklkJoUqat2dQ9tV1MqPS+pl4MMzlWR6zDUeNQbEGGxdCJlBD7IAXRWaBDlvYFeGABJHsWtAKGKA4HyFXhtgEfFIl4AByAABZxBCgCR3KGAB6AArOAAFoGwgVg9ExeWiAQgWOxvA6jx1Z58fYBm62nbNT1zIsS20msNKba3SG5kwOwLFKQrCogIqgDttnCcI6DveI3ucA23TIFmvku0H3rqw2zAFuAyoF7hqzSSXmCQUBKg6OBqTwNAEG2bYgA="}
import { createContext, type Signal } from '@studiometa/js-toolkit-v4';

interface SliderApi {
  state: Signal<{ index: number; total: number }>;
  goNext(): void;
}

export const SliderContext = createContext<SliderApi>('slider');
```

The description is for debugging only. The identity of the key is what resolves.

## Providing

The coordinator provides what a control can ask for. **The value is provided as it is** — nothing is wrapped, so the type of the key is the contract from end to end:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"f1b4137507e9928acf591f3838874a10b1095bc0ed30ea5f686b4e0b2d397570","data":"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"}
import { Base, createContext, signal, type Signal } from '@studiometa/js-toolkit-v4';

interface SliderApi {
  state: Signal<{ index: number; total: number }>;
  goNext(): void;
}
const SliderContext = createContext<SliderApi>('slider');
// ---cut---
class Slider extends Base {
  static config = { name: 'Slider' };

  api = this.$provide(SliderContext, {
    state: signal({ index: 0, total: 0 }), // what changes
    goNext: () => this.goNext(), // what a control can command
  });

  goNext() {
    this.api.state.value = {
      ...this.api.state.value,
      index: this.api.state.value.index + 1,
    };
  }
}
```

- The **scope is the subtree**, and the nearest provider wins.
- A reactive value is a provided `Signal`. A command surface is a provided object.
- `$provide()` in a field initializer is **instance-scoped**: it is never released and dies with the element. A component whose declaration is withdrawn keeps providing until its element goes.

## Injecting

| Form               | Resolves                          | When nothing provides                                 |
| ------------------ | --------------------------------- | ----------------------------------------------------- |
| `$inject(key)`     | a promise, awaited in `mounted()` | it never settles: a missing provider means "not yet". |
| `$injectSync(key)` | the value, synchronously          | `undefined`: the caller falls back or does nothing.   |

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"d5363623baaef7665c150a331b849ccda288146f0125d91281a9fec05fcf5f41","data":"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="}
import { Base, createContext, type Signal } from '@studiometa/js-toolkit-v4';

interface SliderApi {
  state: Signal<{ index: number; total: number }>;
  goNext(): void;
}
const SliderContext = createContext<SliderApi>('slider');
// ---cut---
class SliderNext extends Base {
  static config = { name: 'SliderNext' };

  async mounted() {
    const api = await this.$inject(SliderContext);
    return api.state.subscribe(({ index, total }) => {
      this.$el.toggleAttribute('disabled', index >= total - 1);
    });
  }
}
```

The pending request of the async form is **unmount-scoped**. A new mount runs `mounted()` again and asks again.

::: tip Which form to reach for
`$inject()` from `mounted()` is the default: it waits, so mount order does not matter. `$injectSync()` is for the case where the answer is optional and the caller has a fallback. The [`@inject`](/api/decorators/inject.html) field decorator asks once, at construction.
:::

## Page-wide state

`provideRootContext(key, create)` makes the page-wide case the outermost scope of the same mechanism. The value is provided on `document.documentElement`, so a request from anywhere reaches it by bubbling — and a nearer provider still wins:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"afeb817719aa7e3f9bc37167826440c48c8be5fb1417e0cbc247abbb548cfb98","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAkfwEMwwYANnETsAstywAeXhgrsZAPkog23Ug0QA2ABxUBMMAHM0+JLuprDMDSC69+Q5QICW/JAEYqd0t0Y1yWgC+FOjYuIgExGTKNPR4ABTcLtxwAJTsrgBWMH4AwiyxaADKGGCMkuJSbKSuhnIArmAA1pAA7mAKCvGCIgCi+gC2BmhyTTAYIvlghQDS4xUSktW1Dc1tHQqpIpVLaDVGqy0Q7QrsAD7sjbAAZq4wUAA6YM4DWBDqGWDZeQV0xaWMZRQCCMBARABK8AgAhI7BMMHY/DU8A4WFIxGcsCg7CISXqCLgAPw6Mg9TgAlk7He7FI1nqpDA7AABlcYLd+FAmQA6ZSqdRmTwgfRGEweADsVDQlmseCyOTQU0KJTKTjuSAATF4eD4/NFEOrgqEcHhCCRyJK/kwWGx2D12AAJAAqogAMv0YENprypfzEABOP16AzGUz6yXSmyCVVuMO2bW+fwagAMhuoYRNUXN1EtEWYrA4ABFuFLcjw+IJhOxFX85hgFlU9itLmtjhtvWoNO4kwBmIMi0PuTUWUhWGxFktlhwIPRq2PeBN69UAFlTmGNEVN0QtcQiiWSaXYaIxsHBEAgCt+9Hr0jAlMUXTGEyrl7QtevMjk97kjFpxZgInidIAF5Th2D95FvTZtkWcDFCeF43g+I8iExGBT3Pas4ioYFQTwAAFdEUNgeR2Bw+pPTQABaVpUJxPEER/GA/2xFhGARHBSHYR8uXYAA5JjaU45DUNIOAqTNGpiOcNAuSeJ50NRQiRLE5FD24KxKJca5rBeBFeGxRh7HPdgACMESgZw4DeOB7h5Kg+U7dUkz7EMPHMH1RzwYSTzPC9pktGcYyHeddQCJd3FXdMN0zGIc1sa1C2LbhS3sCtJhfN8dmWA5myOE4lHsn1O27QMhWDUVEEHcMRxlCJx2SycK2jcJgvjUKkE0FMQjTddIjNWKdxAXFOMqaCsCmap6j8d4nn4Vp2EA9gQLEGDb0/SCFoAam7cSyAECBuCgNJ219dxNF7Mr+yQC6PNqkBKmajUtTUBcAm0FcAF0vGgcIQAAej+9gimYHAWKE9SYGo1C5FpOBoRIbF4XYOBuCGdhWm4SkkVhjhblEmSnjzG07HLIQlqedhPm+PylQBboBDkeqUtJg8AH5WcPJSfIwl94iZxqhDkRblrmlasEA1IAG5lCGKUkFAP4DDgZwWDwNAEECQIgA"}
import { createContext, injectContextSync, provideRootContext } from '@studiometa/js-toolkit-v4';

const DataChannels = createContext<Map<string, unknown>>('channels');
const el = document.body;
// ---cut---
// Scoped or page-wide, resolved the same way, nearest first.
const channels =
  injectContextSync(el, DataChannels) ?? provideRootContext(DataChannels, () => new Map());
```

`create` runs at most once per key, and nothing is created at import time. A root provider cannot be disposed and it outlives the instance that asked first, because it is page state.

`withGroup` is not ported.

## `Signal`

`signal(initialValue)` is a factory over a closure. The accessor is `.value`:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"38b47f286972f1a87179f3dca19535cc14f9e6155e020b6c24fb9e7dac70f70a","data":"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="}
import { signal } from '@studiometa/js-toolkit-v4';

const count = signal(0);

const unsubscribe = count.subscribe((value) => console.log(value), { immediate: true });

count.value = 1;
count.value += 1;

unsubscribe();
```

**A write settles synchronously and the newest value wins.** The delivery loop re-reads the value after each callback; if the value moved, the loop abandons the round and starts again on the new value, so a subscriber not reached yet skips the old value. Delivery stays in the same task.

::: warning A subscriber that writes on every delivery live-locks the loop
Guard the write, or move it out of the subscriber.
:::

## Reacting to a provider that appears later

`subscribeContext(el, key, onProvide)` is the subscription behaviour of the WICG protocol. The callback runs synchronously for each answer and receives the value and the same unsubscribe function the helper returns:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"9230445941c4fd997e548a4e932ab7796760fecc9850971bf6860fe017ac2dec","data":"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="}
import { Base, createContext, subscribeContext } from '@studiometa/js-toolkit-v4';

interface GroupApi {
  join(peer: Base): () => void;
}
const DisclosureGroupContext = createContext<GroupApi>('disclosure-group');
// ---cut---
class Disclosure extends Base {
  static config = { name: 'Disclosure' };

  group?: GroupApi;

  mounted() {
    return subscribeContext(this.$el, DisclosureGroupContext, (group) => {
      this.group = group;
      const leave = group.join(this);
      // The teardown for *this* value.
      return () => {
        leave();
        this.group = undefined;
      };
    });
  }
}
```

- **The trigger is the mount announcement**, not a broadcast from the provider, and it runs after `mounted()`.
- **A new answer replaces; it never accumulates.** The teardown runs before the next _different_ value and on unsubscribe. An identical value is not an answer.
- **The registry holds nothing.** A subscription is anchored on its consumer element through a `WeakMap`, and the iterable index holds `WeakRef`s that the sweep prunes.
- Callback and teardown failures are isolated, so one consumer cannot stop the shared sweep.
- Two `contains()` calls bound the cost per mount. A mount that changes nothing checks nothing.

## Groups of peers

`createGroup()` holds a `Set` and a `Signal`. It names no group and resolves no scope — the coordinator owns the membership and gives out the ways in:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"0e595cb5eb1e0cfefe19b5a3bf39bc4836f096b709c1d901ccde076efa7470fb","data":"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="}
import { Base, createContext, createGroup, type Signal } from '@studiometa/js-toolkit-v4';

interface GroupApi {
  members: Signal<readonly Base[]>;
  join(peer: Base): () => void;
  open(peer: Base): void;
}
const DisclosureGroupContext = createContext<GroupApi>('disclosure-group');
// ---cut---
class DisclosureGroup extends Base {
  static config = { name: 'DisclosureGroup' };

  #peers = createGroup<Base>();

  api = this.$provide(DisclosureGroupContext, {
    members: this.#peers.members, // the members to read, in document order
    join: (peer: Base) => this.#peers.join(peer), // returns the leave function
    open: (peer: Base) => this.open(peer), // the invariant stays here
  });

  open(peer: Base) {}
}
```

- `join()` returns its own `leave`, so a member that moves to a nearer group leaves the old one first.
- Scope comes from nearest-provider-wins, so a nested group takes its own members only.
- **The membership is a value.** A coordinator subscribes to it and re-checks its invariant on each change.
- **Document order is the tie-breaker**, so the markup decides which peer keeps its state.
- Nothing sweeps disconnected members. The teardown of the member removes it.

## How the mechanics work

The consumer dispatches a bubbling, **module-private** `js-toolkit:context:request` event carrying a key, a callback and a subscription marker. It is deliberately not part of public `EVENTS`. The nearest mounted provider answers and stops propagation. `provideContext()` replays the requests that have no first answer yet, which is what makes mount order irrelevant. `injectContext()` and `$inject()` are one-shot.

Outside a component the same three functions work on a bare element:

```ts twoslash
// @twoslash-cache: {"v":1,"hash":"3bd44c32e6abe04e5632ae4b4ea8a642dc9706becf2412946d8bace948176f61","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808BjCMONAAiIEMAbAVxiJ2YPgFsARmUog2XUg0QAOKjxhgA5mnxIArFTRz1MBSG79cKgJZhciAAxVG+OV0Y1ySgL4V02WwWIpfToTZlYOKEs4LAg4QXYACgBKdgBeAD5OCEsoaVl5JABGPRBVDS0kAHZ9Q2M8SOjYi1LrWwcQJxc3KURi718cPEIScmD6PATeSy44FKxSYhyYAGEWGnoAHhEJMnSEmB4hAFFVUTU0CnYAaxgMIVWwdbQAaVutsUlSdMuzASFtz5JITAAA6YHYEM4vD+wg+ZAA3GDIewGjE4kJkmlMkRslBEWBPGDLKIYvJ2PNFrAHk9pFAIIwEIgQAAFBZEJbsLhQ8ycMjiLhoYnsABmEFInPYcD44jQpBgMAAdOwACr4GDCGByeAcCns2DigDu1jgCryBgKiAATNVSmpNNpegAWGqkIwmXVLakhaQ8VpIdqdUiudxIa39ah+IaBUbUb1MsJsdgHIQACWVAFkADInGBnR5muQKR2WlR2ipWl1uvAHH1++yOZxB7oeYvhzCDJnDIKx8bxliJ153dhe+iD947L4Fi2OgBspfKDoAzJW6kzB7WbP6G10Q4hZ23I53o9IaX3wuSFqIovFWRAr3Fx590lOFDPnbaF1UV+7L9eN7ZCm3Jtd0UA8OwCEYTzjDp+w4RguDARhk0SFIMiyHIXyqZcP3tJA52oWpQgQpCeH/IogODHpCkqMD/C7GNTxASZfRmFJrAAKxgNwRzQR9dn2Q52BzPMLmuW57jWEIxwBXYgXYUFwUhCl7xvX8Hxkr58WReDEOQzE0JxHJ8UJMBiVJDgOK4tAeNpelGRAAAleAIB4Eh2C0dUbC1RMPVgKBuQEEUxXYAADG4MBCy5IANdhgoNNVwS5XyyDBLgsBwOQTRVfAonYOUAEcBETXKWBgABaOBCDQIQPJFSxSETBC4ANMhJWMNBVDgdy1QvO9r05MAoDBOVRECLraoKoq0AVMEwVVdVlP62QMC6nBBusdR2HiyxVGECBer1Vq6CiNAspCnSSOSEK8tzMbuoFME1siDQbsK7UBv8ul4D2rQNs5YV3AGgbmrIU0qHyBRFHfMpcN6bDzSrJlLO4yTxisTdego5tQ1AnwI3A+ioN7GDz2QtMs2E85MMQABOZQcPLEsCNdVcQBrdGAKx3dWzx9s6OPMZQlg9hBwkx4pLeDTn3B80FEKOwmZh8t4cIvB1w58iOkbSiWxnWio0gwWmGF0QuAwSR/jhcUAB92D4QaYGFVpchlwsikKaGywdEoEdZ03zeaX0MaZwMdbw/Wj0NnsTGY6ZZnYZHrNRtAAGUMEQvivgE45TnOS5wrFp5pKt9I5I09hbft2AnZsIbTJJMULLATiUfF+g08Q2yGTwJy4Bctzaq8uUfLZJZ/N+dU4HTpwFkgPg4B4DBLmCuU0D4UhwRCqvHedkKwZkWWiktRWvaKG1fZMROeI7xgyIrLWdyox0I4g7tGITDgyYzbNc/zV2LQ9u0JWDomYX2rKRDW99Q7Y0QIuS0L9CZGzPAOcSw5k7FwnNLA+bsnSe0/LA78atbh3xDtrGBi49YAF1HDQH8B/eSAUYCXFRE0dgng0gHU9MnASlxByXGLEkfE9DgC9RUpcC6Bw2EcKvtwg4vDbiCLBPQ/2khpHNystfaePCRYKPhNIM4BgkCgBCGoOAlgWB4FOiATwnggA==="}
import {
  createContext,
  injectContext,
  injectContextSync,
  provideContext,
} from '@studiometa/js-toolkit-v4';

const Key = createContext<number>('key');
const el = document.body;
// ---cut---
const { value, dispose } = provideContext(el, Key, 42);
const { promise, cancel } = injectContext(el, Key);
const maybe = injectContextSync(el, Key);
```
