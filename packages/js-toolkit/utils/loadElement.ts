export type LoadableElements = {
  embed: HTMLEmbedElement;
  iframe: HTMLIFrameElement;
  img: HTMLImageElement;
  link: HTMLLinkElement;
  object: HTMLObjectElement;
  script: HTMLScriptElement;
  style: HTMLStyleElement;
  track: HTMLTrackElement;
};

export type LoadableElementsNames = keyof LoadableElements;

export type LoadElementsOptions = {
  /**
   * An HTML element where the created element will be appended.
   */
  appendTo?: HTMLElement;
};

export type LoadElementsReturnType<T extends LoadableElementsNames> = Promise<{
  event: Event;
  element: LoadableElements[T];
}>;

/**
 * Load the given source for the given type of element.
 * @todo manage memo
 */
export function loadElement<T extends LoadableElementsNames>(
  src: string,
  type: T,
  { appendTo = null }: LoadElementsOptions = {},
): LoadElementsReturnType<T> {
  return new Promise((resolve, reject) => {
    const eventOptions = { once: true };
    const prop = type === 'link' ? 'href' : 'src';
    const element = document.createElement(type);
    element.addEventListener('load', (event) => resolve({ event, element }), eventOptions);
    element.addEventListener('error', (event) => reject({ event, element }), eventOptions);
    element[prop] = src;
    if (appendTo) {
      appendTo.append(element);
    }
  });
}

/**
 * Load the given source as an `<img>` element.
 */
export function loadImage(src: string, options?: LoadElementsOptions) {
  return loadElement(src, 'img', options);
}

/**
 * Load the given source as an `<iframe>` element.
 */
export function loadIframe(src: string, options?: LoadElementsOptions) {
  return loadElement(src, 'iframe', options);
}

/**
 * Load the given source as a `<link>` element.
 */
export function loadLink(src: string, options?: LoadElementsOptions) {
  return loadElement(src, 'link', options);
}

/**
 * Load the given source as a `<script>` element. The generated element is
 * appended to `document.head` by default, as a script element needs
 * to be inserted in the DOM to load.
 */
export function loadScript(src: string, options?: LoadElementsOptions) {
  return loadElement(src, 'script', { appendTo: document.head, ...options });
}

/**
 * Load the given source as a `<style>` element.
 */
export function loadStyle(src: string, options?: LoadElementsOptions) {
  return loadElement(src, 'style', options);
}
