# Scroll linked animation

This example demonstrate the usage of the [`scrolled` service](/api/methods-hooks-services.html#scrolled) and the [`ticked` service](/api/methods-hooks-services.html#ticked) to simply add some scroll-linked animations.

<script setup>
  import ScrollLinkedAnimationRaw from './ScrollLinkedAnimation.js?raw';
  import ScrollLinkedAnimationHtmlRaw from './ScrollLinkedAnimation.html?raw';

  const tabs = [
    {
      label: 'ScrollLinkedAnimation.js',
      lang: 'js',
      content: ScrollLinkedAnimationRaw,
    },
    {
      label: 'ScrollLinkedAnimation.html',
      lang: 'html',
      content: ScrollLinkedAnimationHtmlRaw,
    },
    {
      label: 'app.js',
      lang: 'js',
      content: `
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
`
    },
  ];
</script>

<PreviewIframe src="./ScrollLinkedAnimation.story.html" />

<Tabs :items="tabs" />
