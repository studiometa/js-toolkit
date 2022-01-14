# ease

Functions to get the eased version of a progress value in the 0–1 range and helpers function to generate ease-out and ease-in-out functions.

## Usage

```js
import {
  // in
  easeInCirc,
  easeInCubic,
  easeInExpo,
  easeInQuad,
  easeInQuart,
  easeInQuint,
  easeInSine,
  // out
  easeOutCirc,
  easeOutCubic,
  easeOutExpo,
  easeOutQuad,
  easeOutQuart,
  easeOutQuint,
  easeOutSine,
  // in-out
  easeInOutCirc,
  easeInOutCubic,
  easeInOutExpo,
  easeInOutQuad,
  easeInOutQuart,
  easeInOutQuint,
  easeInOutSine,
} from '@studiometa/js-toolkit/utils';

easeInCirc(0); // 0
easeInCirc(0.25); // 0.031754163448145745
easeInCirc(0.5); // 0.1339745962155614
easeInCirc(0.55); // 0.16483534557549673
easeInCirc(0.9); // 0.5641101056459328
easeInCirc(0.95); // 0.6877501000800801
easeInCirc(0.99); // 0.858932640203341
easeInCirc(1); // 1
```

### Parameters

- `progress` (`number`): a progress value betwen 0 and 1.

### Return value

- `number`: eased progress value between 0 and 1.

## Examples

Select an easing function below to see how it will transform the given progress over time.

<script setup>
  import { ref, unref, computed } from 'vue';

  const easingFunctions = ref({});
  const names = computed(() =>
    Object.keys(easingFunctions.value).filter((name) => name.startsWith('ease'))
  );
  const easeIn = computed(() =>
    unref(names).filter((name) => name.startsWith('easeIn') && !name.startsWith('easeInOut'))
  );
  const easeOut = computed(() => unref(names).filter((name) => name.startsWith('easeOut')));
  const easeInOut = computed(() => unref(names).filter((name) => name.startsWith('easeInOut')));
  const name = ref('linear');
  const linear = (progress) => progress;
  const fn = computed(() => (name.value === 'linear' ? linear : easingFunctions.value[name.value]));
  const count = 100;

  import('@studiometa/js-toolkit/utils/math/ease.js').then((mod) => {
    easingFunctions.value = mod;
  });
</script>

<div class="p-10 rounded bg-gray-100">
  <select v-model="name" class="mb-10">
    <option value="linear">linear</option>
    <option :value="name" v-for="name in easeIn">{{ name }}</option>
    <option :value="name" v-for="name in easeOut">{{ name }}</option>
    <option :value="name" v-for="name in easeInOut">{{ name }}</option>
  </select>
  <div class="relative w-full h-48 pointer-events-none">
    <div
      class="absolute top-0 left-0 flex flex-col items-end justify-between w-px h-full bg-gray-400 text-xs"
    >
      <div class="mr-2">1</div>
      <div class="mr-1 transform rotate-180" style="writing-mode: vertical-lr">progress</div>
      <div class="mr-2">0</div>
    </div>
    <div
      class="absolute bottom-0 left-0 flex items-start justify-between w-full h-px bg-gray-400 text-xs"
    >
      <div class="mt-2">0</div>
      <div class="mt-2">time</div>
      <div class="mt-2">{{ count }}</div>
    </div>
    <div
      v-for="i in count"
      :key="i"
      class="absolute top-full h-full -mt-1 -ml-1 transform transition"
      :style="{ left: (i / count) * 100 + '%', '--tw-translate-y': fn(i / count) * -100 + '%' }"
    >
      <div class="w-0.5 h-0.5 bg-black rounded-full" />
    </div>
  </div>
</div>