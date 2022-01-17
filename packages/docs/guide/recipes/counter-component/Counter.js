import { Base } from '@studiometa/js-toolkit';

export default class Counter extends Base {
  static config = {
    name: 'Counter',
    refs: ['add', 'remove', 'counter'],
  };

  get count() {
    return Number(this.$refs.counter.innerHTML);
  }

  set count(value) {
    this.$refs.counter.innerHTML = value;
  }

  onAddClick() {
    this.count += 1;
  }

  onRemoveClick() {
    this.count -= 1;
  }
}
