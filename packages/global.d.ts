declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var __DEV__: boolean;
  interface Window {
    __DEV__: typeof __DEV__;
    requestIdleCallback?: (callback: () => void, options?:{timeout?:number}) => number;
  }

  interface CSSStyleDeclaration {
    scrollMarginTop: string;
  }
}

export {};
