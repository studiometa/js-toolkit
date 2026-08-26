import DefaultTheme from 'vitepress/theme';
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client';
import PreviewIframe from './components/PreviewIframe.vue';
import './styles.css';

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PreviewIframe', PreviewIframe);
    app.use(TwoslashFloatingVue);
  },
};
