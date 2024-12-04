import type { ServiceInterface } from './AbstractService.js';
import { AbstractService } from './AbstractService.js';
import { isEmpty } from '../utils/is.js';

export interface MutationServiceProps {
  mutations: MutationRecord[];
}

export type MutationServiceInterface = ServiceInterface<MutationServiceProps>;

export type MutationServiceOptions = MutationObserverInit;

export class MutationService extends AbstractService<MutationServiceProps> {
  props: MutationServiceProps = {
    mutations: [],
  };

  target: Node;

  options: MutationObserverInit;

  observer: MutationObserver;

  constructor(target?: Node, options?: MutationObserverInit) {
    super();
    this.target = target ?? document.documentElement;
    this.options = options;
  }

  init() {
    this.observer = new MutationObserver((mutations) => {
      this.props.mutations = mutations;
      this.trigger(this.props);
    });
    this.observer.observe(this.target, isEmpty(this.options) ? { attributes: true } : this.options);
  }

  kill() {
    this.observer.disconnect();
    this.observer = null;
  }
}

/**
 * Use the mutation service.
 */
export function useMutation(
  target?: Node,
  options?: MutationObserverInit,
): MutationServiceInterface {
  return MutationService.getInstance([target, JSON.stringify(options)], target, options);
}
