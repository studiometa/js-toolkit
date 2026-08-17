import { describe, expect, it } from 'vitest';
import {
  COMPONENT_ATTRIBUTE,
  FRAMEWORK_ATTRIBUTES,
  isComponentAttribute,
  isNetChange,
  isOptionAttribute,
  MOUNT_ATTRIBUTE,
  OPTION_ATTRIBUTE_PREFIX,
  optionAttributeFor,
  REF_ATTRIBUTE,
  rememberPreviousValue,
  RESPONSIVE_SEPARATOR,
} from './attributes.js';

describe('the framework attribute names', () => {
  it('spells what the markup contract promises', () => {
    // These are the public markup surface: changing one is a breaking change,
    // not a refactor, whatever the module they now live in.
    expect(COMPONENT_ATTRIBUTE).toBe('data-component');
    expect(MOUNT_ATTRIBUTE).toBe('data-mount');
    expect(REF_ATTRIBUTE).toBe('data-ref');
    expect(OPTION_ATTRIBUTE_PREFIX).toBe('data-option-');
    expect(RESPONSIVE_SEPARATOR).toBe(':');
  });

  it('names the three every page observes before a component registers', () => {
    expect([...FRAMEWORK_ATTRIBUTES]).toEqual(['data-component', 'data-mount', 'data-ref']);
  });
});

describe('optionAttributeFor', () => {
  it('kebab-cases the declared name', () => {
    expect(optionAttributeFor('columnCount')).toBe('data-option-column-count');
    expect(optionAttributeFor('open')).toBe('data-option-open');
  });
});

describe('isOptionAttribute', () => {
  it('accepts an option at any breakpoint', () => {
    expect(isOptionAttribute('data-option-columns')).toBe(true);
    expect(isOptionAttribute(`data-option-columns${RESPONSIVE_SEPARATOR}s`)).toBe(true);
  });

  it('rejects a near miss and an absent name', () => {
    expect(isOptionAttribute('data-options')).toBe(false);
    expect(isOptionAttribute('data-component')).toBe(false);
    expect(isOptionAttribute(null)).toBe(false);
  });
});

describe('isComponentAttribute', () => {
  it('accepts the plain declaration and its breakpoint-scoped spellings', () => {
    expect(isComponentAttribute('data-component')).toBe(true);
    expect(isComponentAttribute(`data-component${RESPONSIVE_SEPARATOR}s`)).toBe(true);
  });

  it('rejects a name which only starts like one', () => {
    // The separator is what makes a scoped name, so a longer kebab-cased
    // attribute is a different attribute, not a declaration.
    expect(isComponentAttribute('data-components')).toBe(false);
    expect(isComponentAttribute('data-component-name')).toBe(false);
    expect(isComponentAttribute(null)).toBe(false);
  });
});

describe('the coalescing rule', () => {
  it('keeps the value in force before the first write of a batch', () => {
    const previousValues = new Map<string, string | null>();
    rememberPreviousValue(previousValues, 'data-option-label', 'a');
    rememberPreviousValue(previousValues, 'data-option-label', 'b');
    rememberPreviousValue(previousValues, 'data-option-label', 'c');
    expect([...previousValues]).toEqual([['data-option-label', 'a']]);
  });

  it('keeps an addition as the absence it started from', () => {
    const previousValues = new Map<string, string | null>();
    rememberPreviousValue(previousValues, 'data-option-label', null);
    rememberPreviousValue(previousValues, 'data-option-label', 'added');
    expect(previousValues.get('data-option-label')).toBeNull();
  });

  it('coalesces each attribute on its own', () => {
    const previousValues = new Map<string, string | null>();
    rememberPreviousValue(previousValues, 'data-option-label', 'a');
    rememberPreviousValue(previousValues, 'data-option-size', 'small');
    rememberPreviousValue(previousValues, 'data-option-label', 'b');
    expect([...previousValues]).toEqual([
      ['data-option-label', 'a'],
      ['data-option-size', 'small'],
    ]);
  });

  it('reports a batch which moved the value, in either direction', () => {
    expect(isNetChange('c', 'a')).toBe(true);
    expect(isNetChange('added', null)).toBe(true);
    expect(isNetChange(null, 'removed')).toBe(true);
  });

  it('reports nothing for a batch ending where it started', () => {
    expect(isNetChange('a', 'a')).toBe(false);
    expect(isNetChange(null, null)).toBe(false);
  });

  it('tells an empty attribute from an absent one', () => {
    // A present boolean option is the empty string; dropping the distinction
    // would make `data-option-open=""` and no attribute the same value.
    expect(isNetChange('', null)).toBe(true);
    expect(isNetChange('', '')).toBe(false);
  });
});
