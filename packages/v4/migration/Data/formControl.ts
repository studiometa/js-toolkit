import type { DataValue } from './registry.js';

/** Form-control value reading, writing, grouping, and type coercion. */

const REGEX_CAMEL = /[-_\s]+(.)?/g;

function camelCase(value: string): string {
  return value.replace(REGEX_CAMEL, (_match, character: string | undefined) =>
    character ? character.toUpperCase() : '',
  );
}

export interface DataControlMember {
  readonly dataKey: string;
  readonly target: HTMLElement;
}

export interface DataControlContext {
  readonly dataKey: string;
  readonly members: Iterable<DataControlMember>;
  readonly multiple: boolean;
  readonly prop: string;
  readonly target: HTMLElement;
}

export function isInput(element: Element): element is HTMLInputElement {
  return element instanceof HTMLInputElement;
}

export function isCheckbox(element: Element): element is HTMLInputElement {
  return isInput(element) && element.type === 'checkbox';
}

export function isSelect(element: Element): element is HTMLSelectElement {
  return element instanceof HTMLSelectElement;
}

export function valuesEqual(left: DataValue, right: DataValue): boolean {
  if (Object.is(left, right)) {
    return true;
  }

  if (left instanceof Date && right instanceof Date) {
    return left.getTime() === right.getTime();
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => value === right[index]);
  }

  const isNumberAndString =
    (typeof left === 'number' && typeof right === 'string') ||
    (typeof left === 'string' && typeof right === 'number');
  const isArrayAndString =
    (Array.isArray(left) && typeof right === 'string') ||
    (typeof left === 'string' && Array.isArray(right));

  return (isNumberAndString || isArrayAndString) && String(left) === String(right);
}

export function setProperty(target: HTMLElement, name: string, value: unknown): void {
  const element = target as unknown as Record<string, unknown>;

  if (value !== null && value !== undefined) {
    element[name] = value;
    return;
  }

  switch (name) {
    case 'valueAsDate':
      element[name] = null;
      break;
    case 'valueAsNumber':
      element[name] = Number.NaN;
      break;
    default:
      element[name] = '';
  }
}

export function resolvePropertyName(target: HTMLElement, name: string): string {
  const normalizedName = name.replaceAll('-', '').toLowerCase();
  let current: object | null = target;

  while (current) {
    const property = Object.getOwnPropertyNames(current).find(
      (candidate) => candidate.toLowerCase() === normalizedName,
    );
    if (property) {
      return property;
    }
    current = Object.getPrototypeOf(current) as object | null;
  }

  return camelCase(name);
}

/**
 * Read a value from a form control or generic element property.
 */
export function readControlValue({
  dataKey,
  members,
  multiple,
  prop,
  target,
}: DataControlContext): DataValue {
  if (isSelect(target)) {
    if (multiple) {
      const values: string[] = [];
      for (const option of target.options) {
        if (option.selected) {
          values.push(option.value);
        }
      }
      return values;
    }

    return target.options.item(target.selectedIndex)?.value;
  }

  if (isCheckbox(target)) {
    if (multiple) {
      const values = new Set<string>();
      for (const member of members) {
        if ((!dataKey || member.dataKey === dataKey) && isCheckbox(member.target)) {
          if (member.target.checked) {
            values.add(member.target.value);
          }
        }
      }
      return Array.from(values);
    }

    return target.checked;
  }

  return (target as unknown as Record<string, DataValue>)[prop];
}

/**
 * Serialize a model event while preserving grouped checkbox semantics.
 */
export function serializeControlValue(context: DataControlContext): DataValue {
  const value = readControlValue(context);
  const { multiple, target } = context;

  if (multiple && isCheckbox(target) && !target.checked && Array.isArray(value)) {
    const values = new Set(value);
    values.delete(target.value);
    return Array.from(values);
  }

  return value;
}

/**
 * Write a value to a form control or generic element property.
 */
export function writeControlValue(
  { multiple, prop, target }: DataControlContext,
  value: DataValue,
): void {
  if (isSelect(target)) {
    for (const option of target.options) {
      option.selected =
        multiple && Array.isArray(value) ? value.includes(option.value) : option.value === value;
    }
    return;
  }

  if (isInput(target)) {
    switch (target.type) {
      case 'radio':
        target.checked = target.value === value;
        return;
      case 'checkbox':
        target.checked =
          multiple && Array.isArray(value) ? value.includes(target.value) : Boolean(value);
        return;
    }
  }

  setProperty(target, prop, value);
}
