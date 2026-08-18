import { Base, component, on, swap, type BaseProps } from '../../src/index.js';

/** Gap 10: core ships no `$warn`. */
function warn(...args: unknown[]): void {
  console.warn('[LazyInclude]', ...args);
}

export type LazyIncludeProps = BaseProps & {
  $refs: {
    loading?: HTMLElement;
    error?: HTMLElement;
  };
  $options: {
    src: string;
    terminateOnLoad: boolean;
  };
  $emits: {
    content: { content: string };
    error: { error: unknown };
    always: void;
  };
};

/**
 * Fetches remote HTML from the `src` option on mount and injects it into the
 * element, toggling the `loading` and `error` refs. It emits `content`,
 * `error` and `always`, and can self-terminate once loaded.
 *
 * @link https://ui.studiometa.dev/reference/items/LazyInclude/
 */
@component({
  name: 'LazyInclude',
  refs: ['loading', 'error'],
  options: {
    src: String,
    terminateOnLoad: Boolean,
  },
})
export class LazyInclude<T extends BaseProps = BaseProps> extends Base<LazyIncludeProps & T> {
  /** The content injection in flight, so `always` can wait for it. */
  injection: Promise<void> = Promise.resolve();

  /**
   * Whether `terminateOnLoad` has already been honoured.
   *
   * "Do this once per element" is instance state, not a lifecycle decision:
   * `$destroy()` leaves the instance on its element, so this field survives
   * every move, re-insertion and `swap()` which preserves the element — and
   * an element that is genuinely replaced gets a new instance, which is
   * exactly when the content should be fetched again. `$terminate()` would
   * have detached the instance and thrown this memory away with it.
   */
  hasLoaded = false;

  /** Load the lazy content on mount, once per element when asked. */
  mounted(): void {
    if (this.hasLoaded) {
      return;
    }

    if (!this.$options.src) {
      warn('The `src` option is missing. Define it with the `data-option-src` attribute');
      return;
    }

    fetch(this.$options.src)
      .then((response) => response.text())
      .then(async (content) => {
        this.$emit('content', { content });
        // `$emit()` dispatches synchronously and returns before an async
        // listener has finished, so the injection is awaited here: `always`,
        // and the `terminateOnLoad` which listens for it, must not arrive on
        // an element whose content has not landed. v3 needs nothing — its
        // handler assigns `innerHTML` inside the dispatch.
        await this.injection;
      })
      .catch((error: unknown) => {
        this.$emit('error', { error });
      })
      .finally(() => {
        this.$emit('always');
      });
  }

  /**
   * Inject the content.
   *
   * v3 assigns `innerHTML`, which leaves a `<script>` in the fragment inert
   * and returns before anything inside it has mounted. `swap()` is this
   * element's exact shape — the children change, the element does not — so it
   * owns both, and the awaited settle is what makes `always` meaningful.
   *
   * The promise is kept because the announcement cannot carry it: an event
   * listener's return value goes nowhere, so the emitter has no other way to
   * know that its own handler is still working.
   */
  @on('content')
  inject(event: CustomEvent<{ content: string }>): void {
    const { loading } = this.$refs;
    if (loading) {
      loading.style.display = 'none';
    }
    this.injection = swap(this.$el, event.detail.content);
  }

  /** Reveal the error ref. */
  @on('error')
  showError(): void {
    const { error } = this.$refs;
    if (error) {
      error.style.display = 'block';
    }
  }

  /**
   * Remember a **successful** load, so a later mount does not repeat it.
   *
   * `always` fires from the `finally` of the request, so a failed fetch would
   * mark the element as loaded and never try again. v3 has the same defect for
   * the same reason — it terminates from `onAlways()` — and this is the one
   * place the port departs from it: a request that failed is exactly the one
   * worth retrying when the element mounts again.
   */
  @on('content')
  rememberLoad(): void {
    this.hasLoaded = this.$options.terminateOnLoad;
  }
}
