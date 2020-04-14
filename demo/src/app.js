import { Base } from '../../src';
import { Tabs } from '../../src/components';
import Accordion from './components/Accordion';
import Cursor from './components/Cursor';
import Lazyload from './components/Lazyload';
import Skew from './components/Skew';

class App extends Base {
  get config() {
    return {
      name: 'App',
      components: {
        Accordion,
        Cursor,
        Lazyload,
        Skew,
        Tabs,
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
