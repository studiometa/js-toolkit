/* eslint-disable @typescript-eslint/no-use-before-define */
import type { Base, BaseConstructor, BaseAsyncConstructor } from '../index.js';
import { ChildrenManager } from './ChildrenManager.js';
import { Queue, nextTick } from '../../utils/index.js';

const queue = new Queue(10, nextTick);

/**
 * Children manager.
 */
export class AsyncChildrenManager extends ChildrenManager {
  /**
   * Register instances of all children components.
   */
  registerAll() {
    Object.entries(this.__config.components).forEach(([name, component]) => {
      queue.add(() => this.__register(name, component));
    });
  }

  __register(name: string, component: BaseConstructor | BaseAsyncConstructor): void {
    Object.defineProperty(this, name, {
      enumerable: true,
      configurable: true,
      value: this.__getValue(name, component).map((childOrPromise) => {
        if (childOrPromise instanceof Promise) {
          childOrPromise.then((child) => {
            if (child !== 'terminated') {
              this.__triggerHook('$mount', child, name);
            }
          });
        } else if (childOrPromise !== 'terminated') {
          this.__triggerHook('$mount', childOrPromise, name);
        }

        return childOrPromise;
      }),
    });
  }

  __triggerHook(hook: '$mount' | '$update' | '$destroy', instance: Base, name: string): void {
    queue.add(() => {
      super.__triggerHook(hook, instance, name);
    });
  }

  /**
   * Children are mounted right after they are registered in this AsyncChildrenManager class, so we
   * do not need to do anything in the `mountAll` method.
   */
  mountAll(): void {
    // silence is golden
  }
}
