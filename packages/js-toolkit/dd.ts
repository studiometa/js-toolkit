/* eslint-disable */
interface B {
  $children?: Record<string, Base[]>;
}

class Base<T extends B = B> {
  $children: T['$children'];
}

class Foo extends Base {
  constructor() {
    super();
    this.$children;
  }
}

class Bar<O extends B = B> extends Base<{ $children: { Foo: Foo[] } }> {
  constructor() {
    super();
    this.$children.Foo;
  }

  async enter() {}
}

interface WithDecoratorInterface extends B {
  $children: {
    Bar: Bar[];
  };
}

type Constructor<T, Arguments extends unknown[] = any[]> = new (...arguments_: Arguments) => T;

function withDecorator<T extends Base, V extends B = B>(BaseClass: Constructor<T>) {
  class WithDecorator<W extends V = V> extends BaseClass<WithDecoratorInterface & W & V> {
    /**
     * Dede.
     */
    dede() {}
  }

  return WithDecorator as Constructor<T> & {
    new <W extends B = B>(): T &
      WithDecorator &
      Base<W & V & WithDecoratorInterface>;
  };
}


class Baz extends withDecorator<Bar, { $children: { Foo: Foo[] } }>(Bar) {
  constructor() {
    super();
    this.$children.Foo;
    this.$children.Bar[0].enter();
    this.enter();
    this.dede();
  }
}

const BozTemp = withDecorator(Baz);

/**
 * @extends {BozTemp<{ $children: { Dede: Foo[] } }> }
 */
class Boz extends BozTemp {
  constructor() {
    super();
    this.$children.Foo;
    this.dede();
    this.$children.Dede;
  }
}
