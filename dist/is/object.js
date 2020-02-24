"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Test if the given value is an object.
 *
 * @param  {any}     value The value to test.
 * @return {Boolean}       Whether or not the value is an object.
 */
function isObject(value) {
    const type = typeof value;
    return type === 'function' || (type === 'object' && !!value);
}
exports.default = isObject;
