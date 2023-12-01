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

::: code-group

<<< ./Modal.js

<<< ./Modal.html

:::
