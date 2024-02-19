import { AbstractManager } from './AbstractManager.js';

export class ActionManager extends AbstractManager {
  registerAll() {
    this.__element.querySelectorAll('[data-on]');
  }
}
