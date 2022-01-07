<script setup>
  const { type, text, vertical } = defineProps({
    type: {
      type: String,
      default: 'tip'
    },
    text: String,
    vertical: {
      type: String,
      default: 'top'
    }
  });
</script>

<template>
  <span :class="type" class="badge" :style="{ verticalAlign: vertical }">
    <slot>{{ text }}</slot>
  </span>
</template>

<style scoped>
  .badge {
    display: inline-block;
    font-size: 14px;
    font-weight: bold;
    height: 18px;
    line-height: 18px;
    border-radius: 3px;
    padding: 0 6px;
    color: #fff;
    background-color: #42b983;
  }

  .badge.tip {
    background-color: #3f9ee3;
  }

  .badge.green {
    background-color: #42b983;
  }
  .badge.error {
    background-color: #da5961;
  }
  .badge.warning,
  .badge.warn,
  .badge.yellow {
    background-color: #e7c000;
  }
  .badge + .badge {
    margin-left: 5px;
  }

</style>
