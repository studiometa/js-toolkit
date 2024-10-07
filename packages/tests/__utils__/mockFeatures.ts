import { features } from '#private/Base/features';

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
  features.set('blocking', blocking);
  features.set('breakpoints', breakpoints);
  features.set('attributes', attributes);

  function unmock() {
    features.set('blocking', false);
    features.set('breakpoints', defaultBreakpoints);
    features.set('attributes', defaultAttributes);
  }

  return { features, unmock };
}
