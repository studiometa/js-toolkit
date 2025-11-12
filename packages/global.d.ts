import { Base, BaseConstructor } from './js-toolkit/Base/Base.js';

declare global {
  // eslint-disable-next-line vars-on-top, no-var
  var __DEV__: boolean;
  var __JS_TOOLKIT_REGISTRY__: Map<string, BaseConstructor>;
  var __JS_TOOLKIT_INSTANCES__: Set<Base>;
  var __JS_TOOLKIT_ELEMENTS__: Set<HTMLElement & { __base__: Map<string, Base> }>;

  interface Window {
    __DEV__: typeof __DEV__;
    ResizeObserver?: (callback: () => void) => void;

    __JS_TOOLKIT_REGISTRY__: Map<string, BaseConstructor>;
    __JS_TOOLKIT_INSTANCES__: Set<Base>;
    __JS_TOOLKIT_ELEMENTS__: Set<HTMLElement & { __base__: Map<string, Base> }>;
  }

  interface CSSStyleDeclaration {
    scrollMarginTop: string;
  }
}

export {};
