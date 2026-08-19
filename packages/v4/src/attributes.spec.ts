import { describe, expect, it } from 'vitest';
import {
  COMPONENT_ATTRIBUTE,
  FRAMEWORK_ATTRIBUTES,
  isComponentAttribute,
  isInNamespace,
  isNetChange,
  isOptionAttribute,
  MOUNT_ATTRIBUTE,
  namespacedAttribute,
  namespaceQualifier,
  negatedOptionAttributeFor,
  OPTION_ATTRIBUTE_PREFIX,
  optionAttributeFor,
  PART_SEPARATOR,
  qualifierHead,
  REF_ATTRIBUTE,
  rememberPreviousValue,
  QUALIFIER_SEPARATOR,
} from './attributes.js';

describe('the framework attribute names', () => {
  it('spells what the markup contract promises', () => {
    // These are the public markup surface: changing one is a breaking change,
    // not a refactor, whatever the module they now live in.
    expect(COMPONENT_ATTRIBUTE).toBe('data-component');
    expect(MOUNT_ATTRIBUTE).toBe('data-mount');
    expect(REF_ATTRIBUTE).toBe('data-ref');
    expect(OPTION_ATTRIBUTE_PREFIX).toBe('data-option-');
    expect(QUALIFIER_SEPARATOR).toBe(':');
    expect(PART_SEPARATOR).toBe('.');
  });

  it('names the three every page observes before a component registers', () => {
    expect([...FRAMEWORK_ATTRIBUTES]).toEqual(['data-component', 'data-mount', 'data-ref']);
  });
});

describe('the grammar', () => {
  it('holds at most one colon in every attribute the framework reads', () => {
    // The invariant, spelled as the check it is: a namespace is a whole name, a
    // colon introduces one qualifier of it, and the parts of that qualifier are
    // separated by dots. A second colon would mean a nested grammar.
    const everySpelling = [
      COMPONENT_ATTRIBUTE,
      MOUNT_ATTRIBUTE,
      REF_ATTRIBUTE,
      namespacedAttribute(COMPONENT_ATTRIBUTE, 's'),
      optionAttributeFor('columns'),
      namespacedAttribute(optionAttributeFor('columns'), 's'),
      negatedOptionAttributeFor('trapFocus'),
      namespacedAttribute(negatedOptionAttributeFor('trapFocus'), 's'),
      // ui's namespaces answer to the same rule.
      'data-on:click.prevent.stop',
      'data-track:view.once',
      'data-bind:prop.value',
    ];

    for (const attribute of everySpelling) {
      expect(attribute.split(QUALIFIER_SEPARATOR).length).toBeLessThanOrEqual(2);
    }
  });

  it('reads a qualifier off a name, and only a qualified one', () => {
    expect(namespaceQualifier('data-on', 'data-on:click.prevent')).toBe('click.prevent');
    expect(namespaceQualifier('data-option-columns', 'data-option-columns:s')).toBe('s');
    // The bare namespace declares nothing, so it carries no qualifier.
    expect(namespaceQualifier('data-on', 'data-on')).toBeNull();
    expect(namespaceQualifier('data-on', 'data-once:click')).toBeNull();
  });

  it('tells belonging to a namespace from carrying a qualifier', () => {
    // `isInNamespace` answers the observer's question — is this name mine —
    // where `namespaceQualifier` answers the binder's: what does it declare.
    expect(isInNamespace('data-component', 'data-component')).toBe(true);
    expect(isInNamespace('data-component', 'data-component:s')).toBe(true);
    expect(isInNamespace('data-component', 'data-components')).toBe(false);
    expect(isInNamespace('data-component', null)).toBe(false);
  });

  it('reads the head of a qualifier and nothing past it', () => {
    expect(qualifierHead('click.prevent.stop')).toBe('click');
    expect(qualifierHead('prop.value')).toBe('prop');
    expect(qualifierHead('s')).toBe('s');
    // A name with its own dots stays one part as far as the head is concerned.
    expect(qualifierHead('style.--custom-prop')).toBe('style');
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
    expect(isOptionAttribute(`data-option-columns${QUALIFIER_SEPARATOR}s`)).toBe(true);
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
    expect(isComponentAttribute(`data-component${QUALIFIER_SEPARATOR}s`)).toBe(true);
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
