import type { Base, BaseTypeParameter } from './index.js';
import type {
  KeyServiceProps,
  LoadServiceProps,
  PointerServiceProps,
  RafServiceProps,
  ResizeServiceProps,
  ScrollServiceProps,
} from '../services/index.js';

export interface BaseInterface {
  /**
   * Mounted hook.
   */
  mounted?(): void;
  /**
   * Updated hook.
   */
  updated?(): void;
  /**
   * Destroyed hook.
   */
  destroyed?(): void;
  /**
   * Terminated hook.
   */
  terminated?(): void;
  /**
   * Key service, executed when a keyboard key is pressed or released.
   */
  keyed?(props: KeyServiceProps): void;
  /**
   * Load service, executed when the window `load` event is fired.
   */
  loaded?(props: LoadServiceProps): void;
  /**
   * Pointer service, executed when the pointer is moving, pressed or released.
   */
  moved?(props: PointerServiceProps): void;
  /**
   * Raf service, executed on each rendered frame.
   */
  ticked?(props: RafServiceProps): void;
  /**
   * Resize service, executed when the window is resized.
   */
  resized?(props: ResizeServiceProps): void;
  /**
   * Scroll service, executed when the document is scrolled.
   */
  scrolled?(props: ScrollServiceProps): void;
}

export type BaseDecorator<S extends BaseInterface, T extends Base> = {
  new <W extends BaseTypeParameter = BaseTypeParameter>(...args: unknown[]): S & T & Base<W>;
} & Partial<Pick<T, keyof T>>;
