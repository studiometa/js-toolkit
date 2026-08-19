/**
 * How the framework spells its own attributes, and how it reads a batch of
 * writes to them.
 *
 * One shape covers every attribute the framework reads:
 *
 * ```
 * data-<namespace>[:<qualifier>[.<part>…]]
 * ```
 *
 * A namespace is a whole name, and it is one of two kinds. A **fixed** one is
 * written here or by whoever owns it — `data-component`, `data-mount`,
 * `data-ref`, and in ui `data-on`, `data-track`, `data-bind`. A **generated**
 * one comes from a declaration: every declared option owns the namespace
 * {@link optionAttributeFor} builds for it, so `columns` owns
 * `data-option-columns`. The kind decides the mechanism — a generated
 * namespace's whole set of names is enumerable, so it is registered with the
 * one observer, while a fixed namespace with open qualifiers can only be
 * watched per element. See DESIGN.md §3.
 *
 * Both kinds take exactly one {@link QUALIFIER_SEPARATOR}, and neither reads
 * past it: a qualifier's parts belong to whoever declared the namespace.
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

/**
 * Every declared option is `data-option-` plus its kebab-cased name.
 *
 * This is a **namespace family**, not a namespace: the name after it is the
 * option's own, so `columns` owns `data-option-columns` — see the grammar
 * below.
 */
export const OPTION_ATTRIBUTE_PREFIX = 'data-option-';

/**
 * Introduces one qualifier of the namespace on its left, and there is **at most
 * one of these in an attribute the framework reads**.
 *
 * A colon can never appear in a kebab-cased name, so `data-option-columns:s`
 * stays unambiguous where `data-option-columns-s` would not.
 */
export const QUALIFIER_SEPARATOR = ':';

/**
 * Splits a qualifier into its parts. Core never reads them: what a part means
 * belongs to whoever owns the namespace — a modifier for `data-on:click.prevent`,
 * a property name for `data-bind:prop.value`.
 */
export const PART_SEPARATOR = '.';

/** One qualified spelling: `data-on` + `click.prevent` → `data-on:click.prevent`. */
export function namespacedAttribute(namespace: string, qualifier: string): string {
  return `${namespace}${QUALIFIER_SEPARATOR}${qualifier}`;
}

/**
 * Whether a name belongs to a namespace, plainly or qualified. `data-component`
 * and `data-component:s` both answer yes; `data-components` does not.
 */
export function isInNamespace(namespace: string, name: string | null): name is string {
  return name === namespace || name?.startsWith(`${namespace}${QUALIFIER_SEPARATOR}`) === true;
}

/**
 * The qualifier a name carries within a namespace, or `null` when the name is
 * outside it — the bare namespace included, since a namespace with nothing
 * after the colon declares nothing.
 */
export function namespaceQualifier(namespace: string, name: string): string | null {
  const prefix = `${namespace}${QUALIFIER_SEPARATOR}`;
  return name.startsWith(prefix) ? name.slice(prefix.length) : null;
}

/**
 * The part of a qualifier which names the member: `click` of `click.prevent`,
 * `prop` of `prop.value`. The one piece of a qualifier core reads, and only to
 * check it against a vocabulary its owner declared.
 */
export function qualifierHead(qualifier: string): string {
  const index = qualifier.indexOf(PART_SEPARATOR);
  return index === -1 ? qualifier : qualifier.slice(0, index);
}

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
 * What a present negation resolves to.
 *
 * A boolean reads presence, not value, so the raw string has to carry **which
 * spelling was there** rather than what it said. A NUL character is that
 * signal: the HTML parser replaces it with U+FFFD in an attribute value, so no
 * markup can produce it, and change detection still sees a plain string.
 */
export const NEGATED_RAW = '\u0000';

/**
 * The attribute which turns a boolean option off by being there.
 *
 * `data-option-no-view-transition` is another spelling of
 * `data-option-view-transition="false"`, which is what v3 wrote and what reads
 * better in markup: a flag is present or it is not.
 */
export function negatedOptionAttributeFor(name: string): string {
  return `${OPTION_ATTRIBUTE_PREFIX}no-${kebabCase(name)}`;
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
  return isInNamespace(COMPONENT_ATTRIBUTE, attribute);
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
