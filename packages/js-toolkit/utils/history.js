import isObject from './object/isObject.js';

/**
 * @typedef {Object} HistoryOptions
 * @property {string=} [path]
 * @property {URLSearchParams|{ [key:string]: unknown }=} [search]
 * @property {string=} [hash]
 */

/**
 * Set a param in a URLSearchParam instance.
 * @param  {URLSearchParams}                    params The params to update.
 * @param  {string}                             name   The name of the param to update.
 * @param  {string|number|boolean|Array|Object} value  The value for this param.
 * @return {URLSearchParams}                           The updated URLSearchParams instance.
 */
function updateUrlSearchParam(params, name, value) {
  if (value === '' || value === null || value === undefined) {
    if (params.has(name)) {
      params.delete(name);
    }
    return params;
  }

  if (Array.isArray(value)) {
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

  params.set(name, value);
  return params;
}

/**
 * Transform an object to an URLSearchParams instance.
 *
 * @param  {Object}          obj           The object to convert.
 * @param  {string}          defaultSearch A string of defaults search params.
 * @return {URLSearchParams}
 */
export function objectToURLSearchParams(obj, defaultSearch = window.location.search) {
  return Object.entries(obj).reduce(
    (urlSearchParams, [name, value]) => updateUrlSearchParam(urlSearchParams, name, value),
    new URLSearchParams(defaultSearch)
  );
}

/**
 * Update the history with a new state.
 * @param {string}         mode
 * @param {HistoryOptions} options
 * @param {Object}         [data]
 * @param {string}         [title]
 */
function updateHistory(mode, options, data = {}, title = '') {
  if (!window.history) {
    return;
  }

  /** @type {HistoryOptions} */
  const { path, search, hash } = {
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
 * @param {HistoryOptions} options The new state.
 * @param {Object}         data    The data for the new state.
 * @param {string}         title   The title for the new state.
 */
export function push(options, data, title) {
  updateHistory('push', options, data, title);
}

/**
 * Replace a new state.
 *
 * @param {HistoryOptions} options The new state.
 * @param {Object}         data    The data for the new state.
 * @param {string}         title   The title for the new state.
 */
export function replace(options, data, title) {
  updateHistory('replace', options, data, title);
}
