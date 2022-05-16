<template>
  <div class="space-x-4">
    <div style="min-width: 10rem" class="inline-block border py-4 px-8 rounded text-center">
      {{ count }}
    </div>
    <button
      type="button"
      class="py-4 px-8 text-white rounded bg-black focus:opacity-50"
      @click="count += 1">
      Add
    </button>
    <button
      type="button"
      class="py-4 px-8 text-white rounded bg-black focus:opacity-50"
      @click="count -= 1">
      Remove
    </button>
  </div>
</template>

<script>
  export default {
    name: 'CustomComponent',
    data: () => ({ count: 1 }),
  };
</script>
