import { Base, withVue2 } from '@studiometa/js-toolkit';
import Vue from 'vue';
import CustomComponent from './CustomComponent.vue';

export default class MyVueComponent extends withVue2(Base, Vue) {
  static vueConfig = {
    components: {
      CustomComponent,
    },
    render: (h) => h(CustomComponent),
  };

  static config = {
    name: 'MyVueComponent',
    refs: ['vue'],
  };
}
