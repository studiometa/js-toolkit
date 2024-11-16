import type { ServiceInterface } from './AbstractService.js';
import { AbstractService } from './AbstractService.js';

export interface LoadServiceProps {
  time: DOMHighResTimeStamp;
}

export type LoadServiceInterface = ServiceInterface<LoadServiceProps>;

export class LoadService extends AbstractService<LoadServiceProps> {
  props = {
    time: performance.now(),
  } as LoadServiceProps;

  handleEvent() {
    this.props.time = window.performance.now();
    this.trigger(this.props);
  }

  init() {
    window.addEventListener('load', this);
  }

  kill() {
    window.removeEventListener('load', this);
  }
}

/**
 * Use the load service.
 */
export function useLoad(): LoadServiceInterface {
  return LoadService.getInstance();
}
