# ease

Functions to get the eased version of a progress value in the 0–1 range and helpers function to generate ease-out and ease-in-out functions.

## Usage

```js twoslash
// @twoslash-cache: {"v":1,"hash":"94f4e716cbc7d01caa8a73455c7e40407a2e374292ae700219a4747c4054a921","data":"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"}
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
