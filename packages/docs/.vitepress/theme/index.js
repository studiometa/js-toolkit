import DefaultTheme from 'vitepress/theme';
import TwoslashFloatingVue from '@shikijs/vitepress-twoslash/client';
import PreviewIframe from './components/PreviewIframe.vue';
import './custom.scss';

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PreviewIframe', PreviewIframe);
    app.use(TwoslashFloatingVue);
  },
};
