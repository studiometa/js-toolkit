import { Base, Modal, MediaQuery, Tabs, Accordion } from '../../../src';
import BreakpointManagerDemo from './components/BreakPointManagerDemo';
import BreakpointObserverDemo from './components/BreakpointObserverDemo';

class App extends Base {
  get config() {
    return {
      name: 'App',
      components: {
        Accordion,
        BreakpointManagerDemo,
        BreakpointObserverDemo,
        Cursor: () => import('./components/Cursor'),
        Skew: () => import('./components/Skew'),
        '[data-src]': () => import('./components/Lazyload'),
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
