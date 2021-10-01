/* eslint-disable max-classes-per-file */
import {
  Base,
  createApp,
  importWhenIdle,
  importWhenVisible,
  importOnInteraction,
  // withBreakpointObserver,
} from '@studiometa/js-toolkit';
// import { matrix } from '@studiometa/js-toolkit/utils/css';

/**
 * @typedef {import(@studiometa/js-toolkit/Base/index).BaseConfig} BaseConfig
 */
class App extends Base {
  /** @type {Baseconfig} */
  static config = {
    name: 'App',
    refs: ['modal'],
    log: false,
    components: {
      // Accordion: (app) =>
      //   importWhenVisible(
      //     async () => {
      //       const { default: Accordion } = await import(
      //         '@studiometa/ui/Accordion'
      //       );
      //       // Add icon ref
      //       Accordion.config.components.AccordionItem.config.refs.push('icon');
      //       return Accordion;
      //     },
      //     'Accordion',
      //     app
      //   ),
      BreakpointManagerDemo: (app) =>
        importOnInteraction(
          () => import('./components/BreakPointManagerDemo/index.js'),
          '#import-breakpoint-manager-demo',
          'click',
          app
        ),
      BreakpointObserverDemo: () =>
        importWhenIdle(() => import('./components/BreakpointObserverDemo.js')),
      // Cursor: () =>
      //   importOnInteraction(
      //     async () => {
      //       const { default: Cursor } = await import('@studiometa/ui/Cursor');
      //       return class extends Cursor {
      //         static config = {
      //           ...Cursor.config,
      //           refs: ['inner'],
      //         };

      //         render({ x, y, scale }) {
      //           this.$el.style.transform = `translateZ(0) ${matrix({
      //             translateX: x,
      //             translateY: y,
      //           })}`;
      //           this.$refs.inner.style.transform = `translateZ(0) ${matrix({
      //             scaleX: scale,
      //             scaleY: scale,
      //           })}`;
      //         }
      //       };
      //     },
      //     document.documentElement,
      //     ['mousemove']
      //   ),
      // Draggable: (app) =>
      //   importWhenVisible(
      //     () => import('@studiometa/ui/Draggable'),
      //     'Draggable',
      //     app
      //   ),
      Skew: (app) => importWhenVisible(() => import('./components/Skew.js'), 'Skew', app),
      '[data-src]': (app) =>
        importWhenVisible(() => import('./components/Lazyload.js'), '[data-src]', app),
      // Modal: (app) =>
      //   importWhenVisible(
      //     async () => {
      //       const { default: Modal } = await import('@studiometa/ui/Modal');
      //       return withBreakpointObserver(Modal);
      //     },
      //     'Modal',
      //     app
      //   ),
      // Tabs: (app) =>
      //   importWhenVisible(() => import('@studiometa/ui/Tabs'), 'Tabs', app),
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
