import Base from '~/src/abstracts';
import { withBreakpointObserver } from '~/src/decorators';

export default class BreakpointObserverDemo extends withBreakpointObserver(Base) {
  get config() {
    return {
      name: 'BreakpointObserverDemo',
      log: true,
    };
  }

  mounted() {
    this.$log('mounted');
    this.status = 'mounted';
  }

  destroyed() {
    this.$log('destroyed');
    this.status = 'destroyed';
  }

  onClick(event) {
    this.$log('click', event);
  }

  set status(value) {
    let content = `${this.$options.name}<br>`;

    const { activeBreakpoints, inactiveBreakpoints } = this.$options;

    if (activeBreakpoints) {
      content += `activeBreakpoints: ${activeBreakpoints}<br>`;
    } else if (inactiveBreakpoints) {
      content += `inactiveBreakpoints: ${inactiveBreakpoints}<br>`;
    }

    content += `status: ${value}`;

    this.$refs.content.innerHTML = content;
  }
}
