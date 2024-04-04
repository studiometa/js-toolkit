# ease

Functions to get the eased version of a progress value in the 0–1 range and helpers function to generate ease-out and ease-in-out functions.

## Usage

```js
import {
  // linear
  easeLinear,
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
  import { ref, unref, computed, onMounted } from 'vue';

  const easingFunctions = ref({});
  const names = computed(() =>
    Object.keys(easingFunctions.value).filter((name) => name.startsWith('ease'))
  );
  const easeLinear = computed(() =>
    unref(names).filter((name) => name === 'easeLinear')
  );
  const easeIn = computed(() =>
    unref(names).filter((name) => name.startsWith('easeIn') && !name.startsWith('easeInOut'))
  );
  const easeOut = computed(() => unref(names).filter((name) => name.startsWith('easeOut')));
  const easeInOut = computed(() => unref(names).filter((name) => name.startsWith('easeInOut')));
  const name = ref('easeLinear');

  const fn = computed(() => easingFunctions.value[name.value] ??((v) => v));
  const count = 90;

  onMounted(() => {
    import('@studiometa/js-toolkit/utils').then((mod) => {
      for (const [key, value] of Object.entries(mod.ease)) {
        easingFunctions.value[key] = value;
      }
    });
  })
</script>

<div class="p-10 rounded" style="background-color: var(--vp-sidebar-bg-color);">
  <select v-model="name" class="mb-10 p-2 rounded">
    <option value="easeLinear">easeLinear</option>
    <option :value="name" v-for="name in easeIn">{{ name }}</option>
    <option :value="name" v-for="name in easeOut">{{ name }}</option>
    <option :value="name" v-for="name in easeInOut">{{ name }}</option>
  </select>
  <div class="relative w-full h-48 pointer-events-none">
    <div
      class="absolute top-0 left-0 flex flex-col items-end justify-between w-px h-full bg-gray-400 text-xs opacity-80"
    >
      <div class="mr-2">1</div>
      <div class="mr-1 transform -rotate-180" style="writing-mode: vertical-lr">progress</div>
      <div class="mr-2">0</div>
    </div>
    <div
      class="absolute bottom-0 left-0 flex items-start justify-between w-full h-px bg-gray-400 text-xs opacity-80"
    >
      <div class="mt-2">0</div>
      <div class="mt-2">time</div>
      <div class="mt-2">{{ count }}</div>
    </div>
    <div
      v-for="i in count"
      :key="`${i}`"
      :data-key="i"
      class="absolute bottom-0 flex items-end h-full transition"
      :style="{ left: `${((i - 1) / count) * 100}%`, transform: `translateY(${fn((i - 1) / count) * -192}px` }"
    >
      <div class="w-0.5 h-0.5 bg-current rounded-full" />
    </div>
  </div>
</div>
