/**
 * How the framework spells its own attributes, and how it reads a batch of
 * writes to them.
 *
 * This module is deliberately a **leaf**: it imports nothing from core. The
 * mutation engine, the registry and `Base` all need the same names, and the
 * modules which used to own them sit downstream of the engine — the engine
 * carried string literals rather than close the cycle
 * `dom-mutations → component-declarations → responsive-options → dom-mutations`.
 * Moving the names down instead of importing them sideways breaks that cycle
 * without the copies. Anything which needs the DOM, a breakpoint or the
 * observer belongs upstream of here, not in this file.
 */

import { kebabCase } from './utils/strings.js';

/** Declares one or more component names, as whitespace-separated tokens. */
export const COMPONENT_ATTRIBUTE = 'data-component';

/** Overrides the mount strategy of the element's declared components. */
export const MOUNT_ATTRIBUTE = 'data-mount';

/** Names an element as a ref of the component which owns it. */
export const REF_ATTRIBUTE = 'data-ref';

/** Every declared option is `data-option-` plus its kebab-cased name. */
export const OPTION_ATTRIBUTE_PREFIX = 'data-option-';

/**
 * Separates an attribute from its breakpoint. A colon can never appear in a
 * kebab-cased name, so `data-option-columns-s` stays unambiguous.
 */
export const RESPONSIVE_SEPARATOR = ':';

/**
 * The names every page observes, before a single component declares an option.
 * The rest of the observer's filter is accumulated at registration time.
 */
export const FRAMEWORK_ATTRIBUTES = [COMPONENT_ATTRIBUTE, MOUNT_ATTRIBUTE, REF_ATTRIBUTE] as const;

/** The attribute holding one option's value at the base of the cascade. */
export function optionAttributeFor(name: string): string {
  return `${OPTION_ATTRIBUTE_PREFIX}${kebabCase(name)}`;
}

/**
 * Whether a name is a declared option's, at any breakpoint. The scoped
 * spellings share the prefix, so one test covers the whole family.
 */
export function isOptionAttribute(attribute: string | null): attribute is string {
  return attribute?.startsWith(OPTION_ATTRIBUTE_PREFIX) === true;
}

/** Whether a name declares components, plainly or scoped to a breakpoint. */
export function isComponentAttribute(attribute: string | null): attribute is string {
  return (
    attribute === COMPONENT_ATTRIBUTE ||
    attribute?.startsWith(`${COMPONENT_ATTRIBUTE}${RESPONSIVE_SEPARATOR}`) === true
  );
}

/**
 * Several writes to one attribute in a batch are **one** change, from the value
 * it held before the first write to the value the DOM ends the batch with. So
 * the first previous value wins and every later record is dropped: a morph
 * rewriting an attribute twice must not look like two changes.
 *
 * This is the first half of the coalescing rule; {@link isNetChange} is the
 * second. Declared options, watched attributes and the responsive cascade all
 * answer to it, which is why it is stated here once rather than in each of them.
 */
export function rememberPreviousValue(
  previousValues: Map<string, string | null>,
  attribute: string,
  previousValue: string | null,
): void {
  if (!previousValues.has(attribute)) {
    previousValues.set(attribute, previousValue);
  }
}

/**
 * The second half of the rule: a batch ending where it started changed nothing
 * and is not reported. The comparison is on raw strings — what is in force now
 * against what was in force before — so it holds for an attribute read straight
 * off the element and for a value resolved through the responsive cascade
 * alike, which is what lets a breakpoint crossing and an attribute rewrite be
 * the same kind of event.
 */
export function isNetChange(value: string | null, previousValue: string | null): boolean {
  return value !== previousValue;
}
