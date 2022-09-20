import DefaultTheme from 'vitepress/theme';
import Badge from './components/Badge.vue';
import Tabs from './components/Tabs.vue';
import PreviewIframe from './components/PreviewIframe.vue';
import Layout from './components/Layout.vue';
import './custom.scss';

export default {
  ...DefaultTheme,
  Layout,
  enhanceApp({ app }) {
    app.component('Badge', Badge);
    app.component('Tabs', Tabs);
    app.component('PreviewIframe', PreviewIframe);
  },
};
