# Scroll linked animation

This example demonstrate the usage of the [`scrolled` service](/api/methods-hooks-services.html#scrolled) and the [`ticked` service](/api/methods-hooks-services.html#ticked) to simply add some scroll-linked animations.

<script setup>
  const tabs = [
    {
      label: 'ScrollLinkedAnimation.js',
    },
    {
      label: 'ScrollLinkedAnimation.html',
    },
    {
      label: 'app.js',
    },
  ];
</script>

<PreviewIframe src="./ScrollLinkedAnimation.story.html" />

<Tabs :items="tabs">
  <template #content-1>

<<< ./guide/recipes/scroll-linked-animation/ScrollLinkedAnimation.js

  </template>
  <template #content-2>

<<< ./guide/recipes/scroll-linked-animation/ScrollLinkedAnimation.html

  </template>
  <template #content-3>

```js
import { Base, createApp } from '@studiometa/js-toolkit';
import ScrollLinkedAnimation from './ScrollLinkedAnimation.js';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      ScrollLinkedAnimation,
    },
  };
}

export default createApp(App, document.body);
```

  </template>
</Tabs>
