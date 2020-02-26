import { Base } from '../../dist';
import Accordion from './components/Accordion';
import Cursor from './components/Cursor';
import Lazyload from './components/Lazyload';
import Tabs from './components/Tabs';

class App extends Base {
  get config() {
    return {
      log: true,
      name: 'App',
      components: {
        Accordion,
        Cursor,
        Lazyload,
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

const app = new App(document.body, {
  debug: true,
});

window.APP = app;
