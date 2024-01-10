import DefaultTheme from 'vitepress/theme';
import PreviewIframe from './components/PreviewIframe.vue';
import './custom.scss';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('PreviewIframe', PreviewIframe);
  },
};
