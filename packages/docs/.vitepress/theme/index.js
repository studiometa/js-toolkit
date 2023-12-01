import DefaultTheme from 'vitepress/theme';
import Badge from './components/Badge.vue';
import PreviewIframe from './components/PreviewIframe.vue';
import './custom.scss';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('Badge', Badge);
    app.component('PreviewIframe', PreviewIframe);
  },
};
