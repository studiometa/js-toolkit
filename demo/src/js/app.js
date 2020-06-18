import { Base } from '../../../src';

class App extends Base {
  get config() {
    return {
      debug: true,
      name: 'App',
      components: {
        Accordion: () => import(/* webpackChunkName: "Accordion" */ './components/Accordion'),
        Cursor: () => import(/* webpackChunkName: "async/Cursor" */ './components/Cursor'),
        Lazyload: () => import(/* webpackChunkName: "Lazyload" */ './components/Lazyload'),
        Skew: () => import(/* webpackChunkName: "Skew" */ './components/Skew'),
        Tabs: () => import(/* webpackChunkName: "Tabs" */ './../../../src/components/Tabs'),
        Modal: () => import(/* webpackChunkName: "Modal" */ './../../../src/components/Modal'),
      },
    };
  }

  mounted() {
    this.$log('Mounted 🎉');
  }

  resized(props) {
    this.$log('resized', props);
  }

  scrolled(props) {
    this.$log('scrolled', props);
  }
}

const app = new App(document.documentElement);

window.APP = app;
