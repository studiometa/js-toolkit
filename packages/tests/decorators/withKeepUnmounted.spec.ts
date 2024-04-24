import { describe, it, expect, } from 'bun:test';
import { Base, createApp, withKeepUnmounted } from '@studiometa/js-toolkit';
import { h } from '#test-utils';

function initApp(
  callback:Function,
  options?:{
    template?:string,
    autoMount?:boolean
  },
) {
    const div = h('div');

    div.innerHTML = options?.template ?? '<div data-component="Component"></div>';

    class Component extends withKeepUnmounted(Base, options?.autoMount ?? true) {
      static config = {
        name: 'Component',
      };
    }

    class App extends Base {
      static config = {
        name: 'App',
        components: {
          Component,
        },
      };

      mounted() {
        const instance = this.$children.Component[0];
        callback(instance);
      }
    }

    createApp(App, div);
}

describe('The withKeepUnmounted decorator', () => {
  it('should not mount the component if it is not enabled', () => {
    initApp((instance) => {
      expect(instance.$isMounted).toBe(false);
    });
  });

  it('should mount the component if it is enabled', async () => {
    initApp(
      (instance) => {
        expect(instance.$isMounted).toBe(true);
      },
      {
        template: '<div data-component="Component" data-option-enabled></div>',
      }
    );
  });

  it('should mount the component automatically after enabling', async () => {
    initApp((instance) => {
      expect(instance.$isMounted).toBe(false);
      instance.$options.enabled = true;
      expect(instance.$isMounted).toBe(true);
    });
  });

  it('should not mount the component automatically after enabling if autoMount is not active', async () => {
    initApp((instance) => {
      expect(instance.$isMounted).toBe(false);
      instance.$options.enabled = true;
      expect(instance.$isMounted).toBe(false);
      instance.$mount();
      expect(instance.$isMounted).toBe(true);
    }, {
      autoMount: false,
    });
  });
});
