/* eslint-disable max-classes-per-file */
import {
  Base,
  createApp,
  importWhenIdle,
  importWhenVisible,
  importOnInteraction,
  withBreakpointObserver,
  withExtraConfig,
  importOnMedia,
  importOnMediaQuery,
} from '@studiometa/js-toolkit';
import { matrix } from '@studiometa/js-toolkit/utils';
import ScrollToDemo from './components/ScrollToDemo.js';
import Parallax from './components/Parallax.js';
import ResponsiveOptions from './components/ResponsiveOptions.js';
import AnimateTest from './components/AnimateTest.js';
import AnimateScrollTest from './components/AnimateScrollTest.js';
import AnimateTestMultiple from './components/AnimateTestMultiple.js';
import ParentNativeEvent from './components/ParentNativeEvent/index.js';
import ScrolledInViewOffset from './components/ScrolledInViewOffset.js';

let numberOfTick = 0;
let time = performance.now();
let interval = setInterval(() => {
  const newTime = performance.now();
  numberOfTick += 1;
  console.log('#%d blocking time: %d ms', numberOfTick, newTime - time);
  time = newTime;

  if (numberOfTick > total * 2) {
    clearInterval(interval)
  }
}, 0)

let count = 0;
const total = 66;

function getDeepNestedComponentName(index) {
  return `TestDeepNested${index}`
}

function makeDeepNestedComponent(index) {
  return class extends withExtraConfig(Base, { name: getDeepNestedComponentName(index), components: {} }) {
    mounted() {
      console.log(this.$id);
    }
  };
}

const TestDeepNested = makeDeepNestedComponent(0);
let CurrentClass = TestDeepNested;
while (count < total) {
  count += 1;
  const NewClass = makeDeepNestedComponent(count);
  // @ts-ignore
  CurrentClass.config.components[NewClass.config.name] = NewClass;

  CurrentClass = NewClass;
}


const TestManyInstance = class extends withExtraConfig(Base, { name: 'TestManyInstance', debug: false }) {
  mounted() {
    console.log(this.$id);
  }
};

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
    log: true,
    components: {
      ParentNativeEvent,
      AnimateTest,
      AnimateScrollTest,
      AnimateScrollTestMedia: () =>
        importOnMediaQuery(
          async () => {
            const AnimateScrollTest = await import('./components/AnimateScrollTest');
            return AnimateScrollTest;
          },
          'not (prefers-reduced-motion)',
        ),
      AnimateTestMultiple,
      ResponsiveOptions,
      ScrolledInViewOffset,
      TestDeepNested,
      TestManyInstance,
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

  onDocumentClick(event) {
    console.log('onDocumentClick', event);
  }

  onWindowResize(event) {
    console.log('onWindowResize', event);
  }
}

export default createApp(App, {
  root: document.body,
  features: {
    asyncChildren: true,
  },
});
