import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { defineFeatures } from '@studiometa/js-toolkit';
import { features } from '#private/Base/features';
import { mockFeatures } from '#test-utils';

let unmock: () => void;

beforeEach(() => {
  ({ unmock } = mockFeatures({ blocking: false }));
});

afterEach(() => {
  unmock();
});

describe('The `defineFeatures` function', () => {
  it('should set breakpoints', () => {
    const breakpoints = { s: '40rem', m: '80rem', l: '100rem' };
    defineFeatures({ breakpoints });
    expect(features.get('breakpoints')).toEqual(breakpoints);
  });

  it('should set blocking', () => {
    defineFeatures({ blocking: true });
    expect(features.get('blocking')).toBe(true);
  });

  it('should set prefix', () => {
    defineFeatures({ prefix: 'app' });
    expect(features.get('prefix')).toBe('app');
  });

  it('should set attributes', () => {
    const attributes = { component: 'data-comp', option: 'data-opt', ref: 'data-r' };
    defineFeatures({ attributes });
    expect(features.get('attributes')).toEqual(attributes);
  });

  it('should only set provided options', () => {
    const originalBreakpoints = features.get('breakpoints');
    defineFeatures({ blocking: true });
    expect(features.get('breakpoints')).toEqual(originalBreakpoints);
    expect(features.get('blocking')).toBe(true);
  });
});
