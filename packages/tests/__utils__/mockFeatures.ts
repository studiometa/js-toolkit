import { mock } from 'bun:test';

type Features = {
  asyncChildren: boolean;
  breakpoints: Record<string, string>;
};

interface FeaturesMap extends Map<keyof Features, Features[keyof Features]> {
  get<T extends keyof Features>(key: T): Features[T];
  set<T extends keyof Features>(key: T, value: Features[T]): this;
}

export function mockFeatures({
  asyncChildren = true,
  breakpoints = {
    xxs: '0rem',
    xs: '30rem', // 480px
    s: '48rem', // 768px
    m: '64rem', // 1024px
    l: '80rem', // 1280px
    xl: '90rem', // 1440px
    xxl: '120rem', // 1920px
    xxxl: '160rem', // 2560px
  },
} = {}) {
  const features = new Map<keyof Features, Features[keyof Features]>([
    ['asyncChildren', asyncChildren],
    ['breakpoints', breakpoints],
  ]) as FeaturesMap;

  mock.module('#private/Base/features.js', () => ({ features }));

  return { features };
}
