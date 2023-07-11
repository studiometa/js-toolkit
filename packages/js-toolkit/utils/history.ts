import { isArray, isObject } from './is.js';
import { hasWindow } from './has.js';

export interface HistoryOptions {
  path?: string;
  search?: URLSearchParams | { [key: string]: unknown };
  hash?: string;
}

/**
 * Set a param in a URLSearchParam instance.
 *
 * @param   {URLSearchParams}                    params The params to update.
 * @param   {string}                             name   The name of the param to update.
 * @param   {string|number|boolean|Array|Object} value  The value for this param.
 * @returns {URLSearchParams}                           The updated URLSearchParams instance.
 */
function updateUrlSearchParam(
  params: URLSearchParams,
  name: string,
  value: string | number | boolean | Array<unknown> | Record<string, unknown>,
): URLSearchParams {
  if (value === '' || value === null || value === undefined) {
    if (params.has(name)) {
      params.delete(name);
    }
    return params;
  }

  if (isArray(value)) {
    value.forEach((val, index) => {
      const arrayName = `${name}[${index}]`;
      updateUrlSearchParam(params, arrayName, val);
    });
    return params;
  }

  if (isObject(value)) {
    Object.entries(value).forEach(([key, val]) => {
      const objectName = `${name}[${key}]`;
      updateUrlSearchParam(params, objectName, val);
    });
    return params;
  }

  params.set(name, value as string);
  return params;
}

/**
 * Transform an object to an URLSearchParams instance.
 *
 * @param   {Object}          obj           The object to convert.
 * @param   {string}          defaultSearch A string of defaults search params.
 * @returns {URLSearchParams}
 */
export function objectToURLSearchParams(
  obj: unknown,
  defaultSearch = hasWindow() ? window.location.search : '',
): URLSearchParams {
  return Object.entries(obj).reduce(
    (urlSearchParams: URLSearchParams, [name, value]) =>
      updateUrlSearchParam(urlSearchParams, name, value),
    new URLSearchParams(defaultSearch),
  ) as URLSearchParams;
}

/**
 * Update the history with a new state.
 *
 * @param   {string}         mode
 * @param   {HistoryOptions} options
 * @param   {Object}         [data]
 * @param   {string}         [title]
 * @returns {void}
 */
function updateHistory(
  mode: 'push' | 'replace',
  options: HistoryOptions,
  data: unknown = {},
  title = '',
) {
  if (!window.history) {
    return;
  }

  const { path, search, hash }: HistoryOptions = {
    path: window.location.pathname,
    search: new URLSearchParams(window.location.search),
    hash: window.location.hash,
    ...options,
  };

  let url = path;

  const mergedSearch = search instanceof URLSearchParams ? search : objectToURLSearchParams(search);

  if (mergedSearch.toString()) {
    url += `?${mergedSearch.toString()}`;
  }

  if (hash) {
    if (hash.startsWith('#')) {
      url += hash;
    } else {
      url += `#${hash}`;
    }
  }

  const method = `${mode}State`;
  window.history[method](data, title, url);
}

/**
 * Push a new state.
 *
 * @param   {HistoryOptions} options The new state.
 * @param   {Object}         [data]  The data for the new state.
 * @param   {string}         [title] The title for the new state.
 * @returns {void}
 */
export function push(options: HistoryOptions, data: unknown = {}, title = '') {
  updateHistory('push', options, data, title);
}

/**
 * Replace a new state.
 *
 * @param   {HistoryOptions} options The new state.
 * @param   {Object}         [data]  The data for the new state.
 * @param   {string}         [title] The title for the new state.
 * @returns {void}
 */
export function replace(options: HistoryOptions, data: unknown = {}, title = '') {
  updateHistory('replace', options, data, title);
}
