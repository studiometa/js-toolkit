import isObject from './object/isObject';

/**
 * Set a param in a URLSearchParam instance.
 * @param  {URLSearchParams}                    params The params to update.
 * @param  {String}                             name   The name of the param to update.
 * @param  {String|Number|Boolean|Array|Object} value  The value for this param.
 * @return {URLSearchParams}                           The updated URLSearchParams instance.
 */
function updateUrlSearchParam(params, name, value) {
  if (!value) {
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
 * @param  {String}          defaultSearch A string of defaults search params.
 * @return {URLSearchParams}
 */
function objectToURLSearchParams(obj, defaultSearch = window.location.search) {
  return Object.entries(obj).reduce(
    (urlSearchParams, [name, value]) => updateUrlSearchParam(urlSearchParams, name, value),
    new URLSearchParams(defaultSearch)
  );
}

/**
 * Update the history with a new state.
 * @param {String} mode             Wether to push or replace the new state.
 * @param {Object} options
 * @param {String} options.path     The new pathname.
 * @param {Object} options.search   The new search params.
 * @param {Object} options.hash     The new hash.
 */
function updateHistory(
  mode,
  { path = window.location.pathname, search = {}, hash = window.location.hash },
  data = {},
  title = ''
) {
  if (!window.history) {
    return;
  }

  let url = path;

  const mergedSearch = objectToURLSearchParams(search);
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
 * @param {Object} options The new state.
 * @param {Object} data    The data for the new state.
 * @param {String} title   The title for the new state.
 */
export function push(options, data, title) {
  updateHistory('push', options, data, title);
}

/**
 * Replace a new state.
 *
 * @param {Object} options The new state.
 * @param {Object} data    The data for the new state.
 * @param {String} title   The title for the new state.
 */
export function replace(options, data, title) {
  updateHistory('replace', options, data, title);
}
