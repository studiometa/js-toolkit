# clamp

Clamp a value in a given range.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"e17d46c4a2209c6834d9004d3885dbb37c5e484fb930f4a290df7b396150973a","data":"N4Igdg9gJgpgziAXAbVAFwJ4AcZJACwgDcYAnEAGhDRgA808AKAQwBsBLZuASgAIAzAK5gAxmnYQwvEa2YBbLIyJtBMRLzCC5AIzIVec9mHWadeg81omtu0t2tnSAHTDsFEUmmmyFlEFAgRBEQQAGEfLF5mXmVWVV4jKN4Ac3YSKVJmMGSYADo/NGZk4ORkEA4wAGs/fDQ0LDhEAHomgCs4AFo0CAhWSvY0XLg0QSgJORhC3NgiJsFxVjgmuWY0fCaZeSxc2rlWEABdA6ph5k8kAE4qVhhstaQAVipC0hyGEM3fa6NcRAAGKgifBnZhiMiXAC+FHQ2F+BGI4OedHeIBYHC4fE+iliqgctn0hmMGhs5hWVmJjnsFNsLjcWA8XixfgCQTw4S2SRxMASUmiqXSvEy2TyBSKJTKFWqVFq9UaLXaXR6fQGQxGYwgEymMzmCyWKzWGwiOzQe0OxxAp3OiAeT3Kt2S92tzzObzwTO+YF+ACZAcDMmDyP8oTCcHhCCRyEj6Ew2JweN4tkoVGpqaSjHjSZYM3Zs7T3J4E19/IFgmEIpzkzykvzboKsjl8s7ikhSuUjFKCHUGs02p1ur1+oNhqNxpNmNMYLN5uxFstVusscbTUcTi93gB2dfXe2O20vV0fCJ+Cq/ADMvpBAaQf2D1FhYYRkeoyJj6PjWKTcRTpnxBnTqdIAkswAqkfzIPN6QLd1i1ZEJ2QUCsvyrPk0lrIUG1FZsUAldsai7OVe0VAcVWHdVNXHbVp1nfUFyNXZ9hXC01yQABGP4WO3O58EeZ1XkmN0jw9X4ABYL39GhAxvc0RGgOE6QZXhgELSIIQEUgNV4AByAABUjR0KQj+2VNAdRnOBNIAbhcFwPyeXgAV4NjuAs3gWl4B4bIiRgWLshynJcty2M8xMOl8/R/Ncpp7L8cikFAZFbjgCQwDwdoQAhCEgA=="}
import { clamp } from '@studiometa/js-toolkit/utils';

clamp(5, 0, 10); // 5
clamp(15, 0, 10); // 10
clamp(-5, 0, 10); // 0
```

### Parameters

- `value` (`number`): The value to clamp.
- `min` (`number`): The range minimum value.
- `max` (`number`): The rande maximum value.

### Return value

- `number`: The clamped value.
