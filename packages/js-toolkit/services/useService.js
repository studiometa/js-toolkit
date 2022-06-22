/**
* Use a service.
* @param   {{ init: Function, kill: Function, initialProps: Record<string, any> }} options
* @returns {any}         [description]
*/
export function useService(options) {
const callbacks = new Map();
let isInit = false;

const { init, kill, initialProps = {} } = options;
const props = { ...initialProps };

function has(key) {
return callbacks.has(key);
}

function get(key) {
return callbacks.get(key);
}

function add(key, callback) {
if (has(key)) {
return;
}

// Initialize the service when we add the first callback
if (callbacks.size === 0 && !isInit) {
init();
isInit = true;
}

callbacks.set(key, callback);
}

function remove(key) {
callbacks.delete(key);

// Kill the service when we remove the last callback
if (callbacks.size === 0 && isInit) {
kill();
isInit = false;
}
}

function trigger() {
callbacks.forEach(function forEachCallback(callback) {
callback(props);
});
}

return {
callbacks,
props,
add,
remove,
has,
get,
trigger,
};
}
