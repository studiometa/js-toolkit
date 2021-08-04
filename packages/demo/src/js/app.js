/* eslint-disable max-classes-per-file */
import Base from '@studiometa/js-toolkit';
import { Modal, Tabs, Accordion, Cursor, Draggable } from '@studiometa/js-toolkit/components';
import { matrix } from '@studiometa/js-toolkit/utils/css';
import withBreakpointObserver from '@studiometa/js-toolkit/decorators/withBreakpointObserver.js';
// import useDrag from '@studiometa/js-toolkit/services/drag';
// import styler from 'stylefire';
import BreakpointManagerDemo from './components/BreakPointManagerDemo/index.js';
import BreakpointObserverDemo from './components/BreakpointObserverDemo.js';

// window.addEventListener('load', () => {
//   const el = document.querySelector('[data-component="DraggableElement"]');

//   if (!el) {
//     console.log('No el found.');
//     return;
//   }

//   const elStyler = styler(el);
//   const origins = { x: 0, y: 0 };

//   const { add } = useDrag(el);
//   add('one', (props) => {
//     if (props.mode === 'drop') {
//       console.log(props.final);
//     }

//     if (props.mode === 'stop') {
//       console.log(props.x, props.y);
//     }

//     if (props.mode === 'start') {
//       origins.x = elStyler.get('x');
//       origins.y = elStyler.get('y');
//       return;
//     }

//     elStyler.set({
//       x: origins.x + props.distance.x,
//       y: origins.y + props.distance.y,
//     });
//   });
// });

/**
 * @typedef {import(@studiometa/js-toolkit/abstracts/Base/index).BaseConfig} BaseConfig
 */
class App extends Base {
  /** @type {Baseconfig} */
  static config = {
    name: 'App',
    refs: ['modal'],
    log: true,
    components: {
      Accordion,
      BreakpointManagerDemo,
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
      Skew: () => import(/* webpackChunkName: "Skew" */ './components/Skew.js'),
      '[data-src]': () => import(/* webpackChunkName: "Lazyload" */ './components/Lazyload.js'),
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

const app = App.$factory('html');
window.APP = app;
