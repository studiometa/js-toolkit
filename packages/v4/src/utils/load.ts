/** Loading a resource, as a promise that settles when the browser is done with it. */

import { getSharedRuntimeSlot } from '../shared-runtime.js';

/**
 * The pending loads for the elements that go in `<head>`, keyed by the URL the
 * browser will actually request — and by the `rel` too, for a link.
 *
 * Two evaluated copies of the package share them: appending an embed twice
 * executes a third-party script twice, which the deduplication exists to
 * prevent, so a module-level map would not be enough.
 */
const state = /* @__PURE__ */ getSharedRuntimeSlot('load', 1, () => ({
  scripts: new Map<string, Promise<HTMLScriptElement>>(),
  links: new Map<string, Promise<HTMLLinkElement>>(),
}));

/** What the browser will request, which is what two calls share or do not. */
function resolveUrl(src: string): string {
  return new URL(src, location.href).href;
}

/**
 * A real `Error`, so a reporter has a message and `catch` blocks can read one.
 * The load and error events carry no reason, hence the source in the message
 * and the event as the cause.
 */
function loadingFailed(src: string, event: Event): Error {
  return new Error(`Failed to load "${src}".`, { cause: event });
}

function setAttributes(element: Element, attributes: Record<string, string>): void {
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
}

/**
 * Forget a failed load, so a later call can try again — a network blip must not
 * make a URL unloadable for the life of the page. Guarded by identity: only the
 * entry this load owns is dropped.
 */
function forget<T>(map: Map<string, Promise<T>>, key: string, owner: Promise<T>): void {
  if (map.get(key) === owner) {
    map.delete(key);
  }
}

/**
 * Will the browser act on this `rel`? A `<link>` it ignores fires no event at
 * all, so this is the difference between a promise and a leak.
 */
function relIsSupported(rel: string): boolean {
  const { relList } = document.createElement('link');
  // `supports()` throws on an empty token, and a `rel` may hold several.
  return rel.split(/\s+/).some((token) => token !== '' && relList.supports(token));
}

/**
 * Load an image, resolved once its bitmap is decoded.
 *
 * The element is detached and stays that way: this preloads a URL, it does not
 * put an image on the page. Awaiting `decode()` rather than the load event is
 * the point — assigning the URL to a visible `<img>` afterwards paints in the
 * same frame instead of janking the one after it. The element comes back for
 * its `naturalWidth`/`naturalHeight`.
 *
 * Nothing is deduplicated here: the HTTP cache already does it, and a detached
 * element costs nothing to build.
 */
export async function loadImage(src: string): Promise<HTMLImageElement> {
  const image = new Image();

  const settled = new Promise<void>((resolve, reject) => {
    image.addEventListener('load', () => resolve(), { once: true });
    image.addEventListener('error', (event) => reject(loadingFailed(src, event)), { once: true });
  });

  image.src = src;

  if (typeof image.decode === 'function') {
    try {
      await image.decode();
      return image;
    } catch {
      // A rejection is not proof of failure: some cross-origin images reject
      // with an `EncodingError` and load perfectly. The events are the
      // authority on whether the load worked, so fall through to them.
    }
  }

  await settled;
  return image;
}

/**
 * Load a script, appended to `<head>`.
 *
 * There is no target option: a detached `<script>` never runs. Calls are
 * deduplicated by resolved URL, so asking twice for one embed returns the very
 * same promise and executes the third-party code once. A failed load is
 * forgotten, so it can be retried.
 */
export function loadScript(
  src: string,
  attributes: Record<string, string> = {},
): Promise<HTMLScriptElement> {
  const url = resolveUrl(src);
  const pending = state.scripts.get(url);

  if (pending) {
    return pending;
  }

  const promise = new Promise<HTMLScriptElement>((resolve, reject) => {
    const script = document.createElement('script');
    setAttributes(script, attributes);
    script.addEventListener('load', () => resolve(script), { once: true });
    script.addEventListener(
      'error',
      (event) => {
        forget(state.scripts, url, promise);
        script.remove();
        reject(loadingFailed(src, event));
      },
      { once: true },
    );
    script.src = src;
    document.head.append(script);
  });

  state.scripts.set(url, promise);

  return promise;
}

/**
 * Load a `<link>`, appended to `<head>`.
 *
 * `rel` is required because a `<link>` without one is inert and would never
 * settle. It is also part of the deduplication key, next to the resolved URL:
 * prefetching a URL and loading it as a stylesheet are two intents on one
 * href, and both must happen.
 *
 * **A `rel` the browser ignores resolves at once.** `relList.supports()`
 * answers whether the browser will act on it — Safari ignores `prefetch`
 * entirely — and a hint is best-effort, so an ignored one is a resolved
 * promise over an inert element rather than a promise waiting forever for an
 * event that will never fire. The element is appended either way.
 */
export function loadLink(
  href: string,
  attributes: { rel: string } & Record<string, string>,
): Promise<HTMLLinkElement> {
  const { rel } = attributes;
  // A NUL cannot appear in a URL, so no `rel` can forge another one's key.
  const key = `${rel}\u0000${resolveUrl(href)}`;
  const pending = state.links.get(key);

  if (pending) {
    return pending;
  }

  const supported = relIsSupported(rel);

  const promise = new Promise<HTMLLinkElement>((resolve, reject) => {
    const link = document.createElement('link');
    setAttributes(link, attributes);

    if (supported) {
      link.addEventListener('load', () => resolve(link), { once: true });
      link.addEventListener(
        'error',
        (event) => {
          forget(state.links, key, promise);
          link.remove();
          reject(loadingFailed(href, event));
        },
        { once: true },
      );
    }

    link.href = href;
    document.head.append(link);

    if (!supported) {
      resolve(link);
    }
  });

  state.links.set(key, promise);

  return promise;
}
