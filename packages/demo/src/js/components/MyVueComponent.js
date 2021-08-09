import Base from '@studiometa/js-toolkit';
import { withVue } from '@studiometa/js-toolkit/decorators';
import CustomComponent from './CustomComponent.vue';

export default class MyVueComponent extends withVue(Base) {
  static vueConfig = {
    components: {
      CustomComponent,
    },
    render: (h) => h('CustomComponent'),
  };

  static config = {
    name: 'MyVueComponent',
    refs: ['vue'],
  };
}
