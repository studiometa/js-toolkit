/* eslint-disable max-classes-per-file */
import {
  Base,
  createApp,
  importWhenIdle,
  importWhenVisible,
  importOnInteraction,
  withBreakpointObserver,
} from '@studiometa/js-toolkit';
import { matrix } from '@studiometa/js-toolkit/utils/css';
import ScrollToDemo from './components/ScrollToDemo.js';
import MyVueComponent from './components/MyVueComponent.js';
import Parallax from './components/Parallax.js';
import ResponsiveOptions from './components/ResponsiveOptions.js';
import AnimateTest from './components/AnimateTest.js';
import AnimateScrollTest from './components/AnimateScrollTest.js';

/**
 * App class.
 */
class App extends Base {
  /**
   * Config.
   */
  static config = {
    name: 'App',
    refs: ['modal'],
    log: false,
    components: {
      AnimateTest,
      AnimateScrollTest,
      ResponsiveOptions,
      Accordion: (app) =>
        importWhenVisible(
          async () => {
            const { Accordion } = await import('@studiometa/ui');
            // Add icon ref
            Accordion.config.components.AccordionItem.config.refs.push('icon');
            return Accordion;
          },
          'Accordion',
          app
        ),
      BreakpointManagerDemo: (app) =>
        importOnInteraction(
          () => import('./components/BreakPointManagerDemo/index.js'),
          '#import-breakpoint-manager-demo',
          'click',
          app
        ),
      BreakpointObserverDemo: () =>
        importWhenIdle(() => import('./components/BreakpointObserverDemo.js')),
      Cursor: () =>
        importOnInteraction(
          async () => {
            const { Cursor } = await import('@studiometa/ui');
            return class extends Cursor {
              static config = {
                ...Cursor.config,
                refs: ['inner'],
              };

              render({ x, y, scale }) {
                this.$el.style.transform = `translateZ(0) ${matrix({
                  translateX: x,
                  translateY: y,
                })}`;
                this.$refs.inner.style.transform = `translateZ(0) ${matrix({
                  scaleX: scale,
                  scaleY: scale,
                })}`;
              }
            };
          },
          document.documentElement,
          ['mousemove']
        ),
      Draggable: (app) =>
        importWhenVisible(
          async () => {
            const { Draggable } = await import('@studiometa/ui');
            return Draggable;
          },
          'Draggable',
          app
        ),
      Skew: (app) => importWhenVisible(() => import('./components/Skew.js'), 'Skew', app),
      '[data-src]': (app) =>
        importWhenVisible(() => import('./components/Lazyload.js'), '[data-src]', app),
      Modal: (app) =>
        importWhenVisible(
          async () => {
            const { Modal } = await import('@studiometa/ui');
            Modal.config.options.styles.merge = true;
            return withBreakpointObserver(Modal);
          },
          'Modal',
          app
        ),
      Tabs: (app) =>
        importWhenVisible(
          () => import('@studiometa/ui').then((module) => module.Tabs),
          'Tabs',
          app
        ),
      ScrollToDemo,
      MyVueComponent,
      Parallax,
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
