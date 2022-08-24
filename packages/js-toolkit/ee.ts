/* eslint-disable */
declare type Constructor<T> = new (...args: any[]) => T;

type BaseChildren = Record<string, Base[]>;

type BaseType = {
  $children?: BaseChildren;
};

class Base<T extends BaseType = BaseType> {
  mounted() {
    return true;
  }

  static isBase = true as const;

  $children: T['$children'] & BaseChildren = {};
}

type MixinInterface = {
  $children: {
    Doo: Dede[];
  };
};

function withType<T extends Constructor<Base>, U extends BaseType = BaseType>(superclass: T) {
  return superclass as T &
    Constructor<Base<U>> &
    Pick<typeof Base, keyof typeof Base>;
}

function withDecorator<T extends Constructor<Base>, U extends BaseType = BaseType>(superclass: T) {
  class MixinClass extends superclass {
    mixin(): number {
      this.mounted();
      return 10;
    }
  }

  return MixinClass as Constructor<MixinClass> &
    Pick<typeof MixinClass, keyof typeof MixinClass> &
    T &
    Constructor<Base<U & MixinInterface>> &
    Pick<typeof Base, keyof typeof Base>;
}

class Dede extends Base {
  dodo() {
    return false as const;
  }
}

class Foo extends withDecorator<typeof Base, { $children: { Foo: Dede[] } }>(Base) {
  foo() {
    return 'foo';
  }

  constructor() {
    super();
    this.mounted();
    this.$children.Foo[0].dodo();
  }
}

class Bar extends withDecorator<typeof Foo, { $children: { Poo: Foo[] } }>(Foo) {
  name = 'Bar';
  constructor() {
    super();
    this.$children;
    this.mounted();
    this.foo();
    this.mixin();
    this.$children.Poo[0].mounted();
    this.$children.Foo[0].dodo;
  }
}

// @todo find a way to make Bar accept a type parameter
// maybe following https://ybogomolov.me/01-higher-kinded-types/

class Boz extends withType<typeof Bar, { $children: { Boz: Bar[] } }>(Bar) {
  name = 'Boz';

  constructor() {
    super();
    this.name;
    this.$children;
    this.mounted();
    this.foo();
    this.mixin();
    this.$children.Poo[0].mounted();
    this.$children.Foo[0].dodo;
    this.$children.Boz[0].name;
  }
}


class One extends Base<{ $children: { One: One[] } }> {
  mounted() {
    this.$children.One[0].mounted;
    return true;
  }
}
