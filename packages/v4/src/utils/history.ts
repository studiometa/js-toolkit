/** Update the URL without navigating, from the parts of it a component owns. */

export interface HistoryOptions {
  /** The pathname. Defaults to the current one. */
  path?: string;
  /** The search params, as an object or a `URLSearchParams`. Defaults to the current ones. */
  search?: URLSearchParams | Record<string, SearchParamInput>;
  /** The hash, with or without its `#`. Defaults to the current one. */
  hash?: string;
}

/** A value a search param can hold, or a nested structure of them. */
export type SearchParamInput =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly SearchParamInput[]
  | { readonly [key: string]: SearchParamInput };

/**
 * Set one param, recursing into arrays and objects as bracketed names.
 *
 * An empty value deletes the param instead of writing it, so a component
 * clears its own part of the URL by setting it to `''`.
 */
function updateUrlSearchParam(
  params: URLSearchParams,
  name: string,
  value: SearchParamInput,
): URLSearchParams {
  if (value === '' || value === null || value === undefined) {
    params.delete(name);
    return params;
  }

  if (Array.isArray(value)) {
    // `Array.isArray()` widens a readonly array to `any[]`; name the element type back.
    const items: readonly SearchParamInput[] = value;
    for (const [index, item] of items.entries()) {
      updateUrlSearchParam(params, `${name}[${index}]`, item);
    }
    return params;
  }

  if (typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) {
      updateUrlSearchParam(params, `${name}[${key}]`, item);
    }
    return params;
  }

  params.set(name, String(value));
  return params;
}

/**
 * Convert an object to `URLSearchParams`, over the current search by default.
 *
 * @example
 * ```js
 * objectToURLSearchParams({ filters: { color: 'red' } }, '').toString();
 * // filters%5Bcolor%5D=red
 * ```
 */
export function objectToURLSearchParams(
  object: Record<string, SearchParamInput>,
  defaultSearch: string = location.search,
): URLSearchParams {
  const params = new URLSearchParams(defaultSearch);
  for (const [name, value] of Object.entries(object)) {
    updateUrlSearchParam(params, name, value);
  }
  return params;
}

/** Build the URL from the parts the caller gave, keeping the current ones. */
function urlFor({ path, search, hash }: HistoryOptions): string {
  const params = search instanceof URLSearchParams ? search : objectToURLSearchParams(search ?? {});
  const query = params.toString();
  const fragment = hash ?? location.hash;

  let url = path ?? location.pathname;
  if (query) url += `?${query}`;
  if (fragment) url += fragment.startsWith('#') ? fragment : `#${fragment}`;
  return url;
}

/** Push a new history entry for the given URL parts. */
export function historyPush(options: HistoryOptions, data: unknown = {}, title = ''): void {
  history.pushState(data, title, urlFor(options));
}

/** Replace the current history entry with the given URL parts. */
export function historyReplace(options: HistoryOptions, data: unknown = {}, title = ''): void {
  history.replaceState(data, title, urlFor(options));
}
