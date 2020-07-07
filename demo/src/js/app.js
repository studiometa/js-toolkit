import { Base, Modal, MediaQuery, Tabs } from '../../../src';

class App extends Base {
  get config() {
    return {
      log: true,
      name: 'App',
      components: {
        Accordion: () => import('./components/Accordion'),
        Cursor: () => import('./components/Cursor'),
        Skew: () => import('./components/Skew'),
        Modal,
        MediaQuery,
        Tabs,
      },
    };
  }

  mounted() {
    this.$log('Mounted 🎉');
  }

  loaded() {
    // eslint-disable-next-line
    import('lazysizes');
    this.$log('Loaded');
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
