import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noDestroyLifecycle } from './no-destroy-lifecycle.ts';

describe('no-destroy-lifecycle', () => {
  it('passes and fails correctly', () => {
    tester.run('no-destroy-lifecycle', noDestroyLifecycle as any, {
      valid: [
        // The v4 names themselves.
        `class Slider extends Base {
           static config = { name: 'Slider' };
           unmounted() {}
         }`,
        `class Slider extends Base {
           static config = { name: 'Slider' };
           onClick() { this.$unmount(); }
         }`,
        `instance.$unmount();`,
        // `destroyed` outside a component is an ordinary name.
        `class Store { destroyed() {} }`,
        `class Store extends Error { destroyed() {} }`,
        `emitter.destroyed();`,
        `if (record.destroyed) { retry(); }`,
        `const { destroyed } = state;`,
        // A static member is not the hook.
        `class Slider extends Base {
           static config = { name: 'Slider' };
           static destroyed() {}
         }`,
        // Computed access is left alone: the fixer would have to guess the
        // quote style of a string it did not write.
        `instance['$destroy']();`,
      ],
      invalid: [
        // `this.$destroy()` — the shape `no-deprecated-properties` could reach.
        {
          code: `class Slider extends Base {
  static config = { name: 'Slider' };
  onClick() { this.$destroy(); }
}`,
          errors: [{ messageId: 'renamedMethod' }],
          output: `class Slider extends Base {
  static config = { name: 'Slider' };
  onClick() { this.$unmount(); }
}`,
        },
        // `instance.$destroy()` — the shape it could not, and the common one.
        {
          code: `const slider = new Slider(el);
slider.$destroy();`,
          errors: [{ messageId: 'renamedMethod' }],
          output: `const slider = new Slider(el);
slider.$unmount();`,
        },
        // Any receiver, including one reached through a chain.
        {
          code: `el[INSTANCES].get(name).$destroy();`,
          errors: [{ messageId: 'renamedMethod' }],
          output: `el[INSTANCES].get(name).$unmount();`,
        },
        // The hook definition.
        {
          code: `class Dialog extends Base {
  static config = { name: 'Dialog' };
  destroyed() {
    this.close();
  }
}`,
          errors: [{ messageId: 'renamedHook' }],
          output: `class Dialog extends Base {
  static config = { name: 'Dialog' };
  unmounted() {
    this.close();
  }
}`,
        },
        // The hook definition plus `super.destroyed()`, which
        // `withScrolledInView` writes.
        {
          code: `class Animation extends withScroll(Base) {
  static config = { name: 'Animation' };
  destroyed() {
    super.destroyed();
    this.snap();
  }
}`,
          errors: [{ messageId: 'renamedHook' }, { messageId: 'renamedHook' }],
          output: `class Animation extends withScroll(Base) {
  static config = { name: 'Animation' };
  unmounted() {
    super.unmounted();
    this.snap();
  }
}`,
        },
        // `super.destroyed()` from the already-renamed hook.
        {
          code: `class Animation extends Base {
  static config = { name: 'Animation' };
  unmounted() { super.destroyed(); }
}`,
          errors: [{ messageId: 'renamedHook' }],
          output: `class Animation extends Base {
  static config = { name: 'Animation' };
  unmounted() { super.unmounted(); }
}`,
        },
        // A service mixin overrides the framework's own teardown.
        {
          code: `const withThing = (BaseClass) =>
  class extends BaseClass {
    $destroy() {
      this.$services.scrolled.stop();
      return super.$destroy();
    }
  };`,
          errors: [{ messageId: 'renamedMethod' }, { messageId: 'renamedMethod' }],
          output: `const withThing = (BaseClass) =>
  class extends BaseClass {
    $unmount() {
      this.$services.scrolled.stop();
      return super.$unmount();
    }
  };`,
        },
        // A component recognised through the framework surface rather than a
        // `static config`.
        {
          code: `class Item extends AbstractItem {
  mounted() { this.$el.hidden = false; }
  destroyed() {}
}`,
          errors: [{ messageId: 'renamedHook' }],
          output: `class Item extends AbstractItem {
  mounted() { this.$el.hidden = false; }
  unmounted() {}
}`,
        },
      ],
    });
  });
});
