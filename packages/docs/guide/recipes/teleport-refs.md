# Teleport refs

If a component teleports refs outside of its scope, these refs will not be found anymore and will not be accessible by using `this.$refs.<refName>`.

We can make sure that the moved refs are still accessible by saving the original ones before teleporting them and overwriting the `$refs` getter in the component.

### Modal component example

<script setup>
  import ModalRaw from './Modal.js?raw';
  import ModalHtmlRaw from './Modal.html?raw';

  const tabs = [
    {
      label: 'Modal.js',
      lang: 'js',
      content: ModalRaw,
    },
    {
      label: 'Modal.html',
      lang: 'html',
      content: ModalHtmlRaw,
    },
  ];
</script>

<Tabs :items="tabs" />
