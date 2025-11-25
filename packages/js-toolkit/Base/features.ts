export type Features = {
  blocking: boolean;
  breakpoints: Record<string, string>;
  prefix: string;
  attributes: {
    component: string;
    option: string;
    ref: string;
  };
};

interface FeaturesMap extends Map<keyof Features, Features[keyof Features]> {
  get<T extends keyof Features>(key: T): Features[T];
  set<T extends keyof Features>(key: T, value: Features[T]): this;
}

export const features = new Map<keyof Features, Features[keyof Features]>([
  ['blocking', false],
  [
    'breakpoints',
    {
      '2xs': '0rem',
      xs: '30rem', // 480px
      s: '40rem', // 640px
      m: '48rem', // 768px
      l: '64rem', // 1024px
      xl: '80rem', // 1280px
      '2xl': '96rem', // 1440px
      '3xl': '120rem', // 1920px
    },
  ],
  ['prefix', 'tk'],
  [
    'attributes',
    {
      component: 'data-component',
      option: 'data-option',
      ref: 'data-ref',
    },
  ],
]) as FeaturesMap;
