import DefaultTheme from 'vitepress/dist/client/theme-default';
import Badge from './components/Badge.vue';
import './custom.scss';

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('Badge', Badge);
  }
}
