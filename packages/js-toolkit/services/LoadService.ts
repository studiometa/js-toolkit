import type { ServiceInterface, ServiceConfig } from './AbstractService.js';
import { AbstractService } from './AbstractService.js';

export interface LoadServiceProps {
  time: DOMHighResTimeStamp;
}

export type LoadServiceInterface = ServiceInterface<LoadServiceProps>;

export class LoadService extends AbstractService<LoadServiceProps> {
  static config: ServiceConfig = [[() => window, [['load']]]];

  props: LoadServiceProps = {
    time: performance.now(),
  };

  handleEvent() {
    this.props.time = window.performance.now();
    this.trigger(this.props);
  }
}

/**
 * Use the load service.
 * @link https://js-toolkit.studiometa.dev/api/services/useLoad.html
*/
export function useLoad(): LoadServiceInterface {
  return LoadService.getInstance();
}
