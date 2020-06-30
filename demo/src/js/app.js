import { Base, Modal } from '../../../src';

import MediaQuery from './components/MediaQuery';

class App extends Base {
  get config() {
    return {
      log: false,
      name: 'App',
    };
  }

  get components() {
    return {
      Accordion: () => import(/* webpackChunkName: "Accordion" */ './components/Accordion'),
      Cursor: () => import(/* webpackChunkName: "async/Cursor" */ './components/Cursor'),
      Lazyload: () => import(/* webpackChunkName: "Lazyload" */ './components/Lazyload'),
      Skew: () => import(/* webpackChunkName: "Skew" */ './components/Skew'),
      Modal,
      MediaQuery,
      Tabs: () => import(/* webpackChunkName: "Tabs" */ './../../../src/components/Tabs'),
    };
  }

  mounted() {
    this.$log('Mounted 🎉', 'bar');
  }

  resized(props) {
    this.$log('resized', props);
  }

  scrolled(props) {
    this.$log('scrolled', props, 'foo');
  }
}

const app = new App(document.documentElement);

window.APP = app;
