import { isArray, isObject } from './is.js';
import { hasWindow } from './has.js';
import { startsWith } from './string/index.js';

export interface HistoryOptions {
  path?: string;
  search?: URLSearchParams | { [key: string]: unknown };
  hash?: string;
}

type SearchParamValue = string | number | boolean;

/**
 * Set a param in a URLSearchParam instance.
 *
 * @param  {URLSearchParams}                    params The params to update.
 * @param  {string}                             name   The name of the param to update.
 * @param  {string|number|boolean|Array|Object} value  The value for this param.
 * @return {URLSearchParams}                           The updated URLSearchParams instance.
 */
function updateUrlSearchParam(
  params: URLSearchParams,
  name: string,
  value: SearchParamValue | Array<SearchParamValue> | Record<string, SearchParamValue>,
): URLSearchParams {
  if (value === '' || value === null || value === undefined) {
    if (params.has(name)) {
      params.delete(name);
    }
    return params;
  }

  if (isArray(value)) {
    for (const [index, val] of value.entries()) {
      const arrayName = `${name}[${index}]`;
      updateUrlSearchParam(params, arrayName, val);
    }
    return params;
  }

  if (isObject(value)) {
    for (const [key, val] of Object.entries(value)) {
      const objectName = `${name}[${key}]`;
      updateUrlSearchParam(params, objectName, val);
    }
    return params;
  }

  params.set(name, value as string);
  return params;
}

/**
 * Transform an object to an URLSearchParams instance.
 *
 * @param  {Object}          obj           The object to convert.
 * @param  {string}          defaultSearch A string of defaults search params.
 * @return {URLSearchParams}
 * @link https://js-toolkit.studiometa.dev/utils/history/objectToURLSearchParams.html
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
 * @param  {string}         mode
 * @param  {HistoryOptions} options
 * @param  {Object}         [data]
 * @param  {string}         [title]
 * @return {void}
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
    if (startsWith(hash, '#')) {
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
 * @param  {HistoryOptions} options The new state.
 * @param  {Object}         [data]  The data for the new state.
 * @param  {string}         [title] The title for the new state.
 * @return {void}
 * @link https://js-toolkit.studiometa.dev/utils/history/historyPush.html
*/
export function push(options: HistoryOptions, data: unknown = {}, title = '') {
  updateHistory('push', options, data, title);
}

/**
 * Replace a new state.
 *
 * @param  {HistoryOptions} options The new state.
 * @param  {Object}         [data]  The data for the new state.
 * @param  {string}         [title] The title for the new state.
 * @return {void}
 * @link https://js-toolkit.studiometa.dev/utils/history/historyReplace.html
*/
export function replace(options: HistoryOptions, data: unknown = {}, title = '') {
  updateHistory('replace', options, data, title);
}
