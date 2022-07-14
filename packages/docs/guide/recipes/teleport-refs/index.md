# Teleport refs

If a component teleports refs outside of its scope, these refs will not be found anymore and will not be accessible by using `this.$refs.<refName>`.

We can make sure that the moved refs are still accessible by saving the original ones before teleporting them and overwriting the `$refs` getter in the component.

### Modal component example

<script setup>
  const tabs = [
    {
      label: 'Modal.js',
    },
    {
      label: 'Modal.html',
    },
  ];
</script>

<Tabs :items="tabs">
  <template #content-1>

<<< ./guide/recipes/teleport-refs/Modal.js

  </template>
  <template #content-2>

<<< ./guide/recipes/teleport-refs/Modal.html

  </template>
</Tabs>
