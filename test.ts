/* eslint-disable max-classes-per-file, no-unused-expressions */
import { Base, withMountWhenInView, withType } from '@studiometa/js-toolkit';
import type { BaseTypeParameter } from '@studiometa/js-toolkit';

class Bar<T extends BaseTypeParameter = BaseTypeParameter> extends Base<
  T & {
    $options: { bar: true };
  }
> {
  bar() {
    return true;
  }
}

class BarBar extends Bar<{ $options: { barBar: true } }> {
  mounted() {
    this.$options.bar;
    this.$options.barBar;
  }
}

class Foo extends withMountWhenInView<
  typeof Bar,
  { $el: HTMLAnchorElement; $options: { foo: true } }
>(Bar) {
  mounted() {
    this.$el.href;
    this.__observer;
    this.$options.foo;
    this.$options.bar;
    this.$options.intersectionObserver;
    this.bar();
  }
}

class Baz extends withType<typeof Foo, { $options: { baz: true } }>(Foo) {
  mounted() {
    this.$el.href;
    this.bar();
    this.$options.foo;
    this.$options.bar;
    this.$options.intersectionObserver;
    this.$options.custom;
    this.$options.baz;
  }
}

export class Boz extends withType<typeof Baz, { $options: { boz: string } }>(Baz) {
  mounted() {
    this.$options.foo;
    this.$options.baz;
    this.$options.boz;
  }
}
