import Base from '@studiometa/js-toolkit';

export default class MyComponent extends Base {
  static config = {
    name: 'MyComponent',
    log: true,
  };

  mounted() {
    this.$log('Mounted');
  }
}
