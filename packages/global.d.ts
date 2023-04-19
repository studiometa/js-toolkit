/* eslint-disable vars-on-top, no-var */
declare global {
  var __DEV__: boolean;

  interface Window {
    __DEV__: typeof __DEV__;
    ResizeObserver?: (callback: () => void) => void;
  }

  interface CSSStyleDeclaration {
    scrollMarginTop: string;
  }
}

export {};
