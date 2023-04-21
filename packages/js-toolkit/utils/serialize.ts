import { isArray, isObject } from './is.js';

const ARR_OBJ_REGEX = /^(\[.*\]|{.*})$/;
const NUM_REGEX = /^(\.|[0-9])/;

/**
 * Serialize a value into a string.
 */
export function serialize(value: unknown): string {
  if (isArray(value) || isObject(value)) {
    return JSON.stringify(value);
  }

  return String(value);
}

/**
 * Deserialize a string.
 */
export function deserialize<
  T extends string | number | unknown[] | Record<string | number, unknown> =
    | string
    | number
    | unknown[]
    | Record<string | number, unknown>,
>(value: string): T {
  if (NUM_REGEX.test(value)) {
    // @ts-ignore
    return Number(value);
  }

  if (ARR_OBJ_REGEX.test(value)) {
    return JSON.parse(value);
  }

  // @ts-ignore
  return value;
}
