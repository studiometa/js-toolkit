import { vi } from 'vitest';

type Features = {
  blocking: boolean;
  breakpoints: Record<string, string>;
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

const defaultBreakpoints = {
  xxs: '0rem',
  xs: '30rem', // 480px
  s: '48rem', // 768px
  m: '64rem', // 1024px
  l: '80rem', // 1280px
  xl: '90rem', // 1440px
  xxl: '120rem', // 1920px
  xxxl: '160rem', // 2560px
};

const defaultAttributes = {
  component: 'data-component',
  option: 'data-option',
  ref: 'data-ref',
};

export function mockFeatures({
  blocking = true,
  breakpoints = defaultBreakpoints,
  attributes = defaultAttributes,
} = {}) {
  const features = new Map<keyof Features, Features[keyof Features]>([
    ['blocking', blocking],
    ['breakpoints', breakpoints],
    ['attributes', attributes],
  ]) as FeaturesMap;

  vi.mock('#private/Base/features.js', () => {
    return { features };
  });

  function unmock() {
    features.set('blocking', false);
    features.set('breakpoints', defaultBreakpoints);
    features.set('attributes', defaultAttributes);
  }

  return { features, unmock };
}
