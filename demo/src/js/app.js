import Base from '~/src';
import { Modal, Tabs, Accordion } from '~/src/components';
import { withBreakpointObserver } from '~/src/decorators';
import BreakpointManagerDemo from './components/BreakPointManagerDemo';
import BreakpointObserverDemo from './components/BreakpointObserverDemo';

class App extends Base {
  get config() {
    return {
      name: 'App',
      log: true,
      components: {
        Accordion,
        BreakpointManagerDemo,
        BreakpointObserverDemo,
        Cursor: () => import('./components/Cursor'),
        Skew: () => import('./components/Skew'),
        '[data-src]': () => import('./components/Lazyload'),
        Modal: withBreakpointObserver(Modal),
        Tabs,
      },
    };
  }

  mounted() {
    this.$log('Mounted 🎉');
  }

  onModalOpen(...args) {
    this.$log('onModalOpen', ...args);
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
