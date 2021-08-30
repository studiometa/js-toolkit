/* eslint-disable max-classes-per-file */
import Base from '@studiometa/js-toolkit';
import { Modal, Tabs, Accordion, Cursor, Draggable } from '@studiometa/js-toolkit/components';
import {
  createApp,
  importWhenIdle,
  importWhenVisible,
  importOnInteraction,
} from '@studiometa/js-toolkit/helpers';
import { matrix } from '@studiometa/js-toolkit/utils/css';
import withBreakpointObserver from '@studiometa/js-toolkit/decorators/withBreakpointObserver.js';
import BreakpointObserverDemo from './components/BreakpointObserverDemo.js';

// Add the new icon ref
Accordion.config.components.AccordionItem.config.refs.push('icon');

/**
 * @typedef {import(@studiometa/js-toolkit/abstracts/Base/index).BaseConfig} BaseConfig
 */
class App extends Base {
  /** @type {Baseconfig} */
  static config = {
    name: 'App',
    refs: ['modal'],
    log: false,
    components: {
      Accordion,
      BreakpointManagerDemo: (app) =>
        importOnInteraction(
          () => import('./components/BreakPointManagerDemo/index.js'),
          '#import-breakpoint-manager-demo',
          'click',
          app
        ),
      BreakpointObserverDemo,
      Cursor: class extends Cursor {
        static config = {
          ...Cursor.config,
          refs: ['inner'],
        };

        render({ x, y, scale }) {
          this.$el.style.transform = `translateZ(0) ${matrix({ translateX: x, translateY: y })}`;
          this.$refs.inner.style.transform = `translateZ(0) ${matrix({
            scaleX: scale,
            scaleY: scale,
          })}`;
        }
      },
      Draggable,
      Skew: () =>
        importWhenIdle(() => import(/* webpackChunkName: "Skew" */ './components/Skew.js')),
      '[data-src]': (app) =>
        importWhenVisible(
          () => import(/* webpackChunkName: "Lazyload" */ './components/Lazyload.js'),
          '[data-src]',
          app
        ),
      Modal: withBreakpointObserver(Modal),
      Tabs,
    },
  };

  /**
   * @inheritdoc
   */
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
}

export default createApp(App, document.body);
