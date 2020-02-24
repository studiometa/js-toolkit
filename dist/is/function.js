"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Test if the given value is a function.
 *
 * @param  {any}     value The value to test.
 * @return {Boolean}       Whether the valus is a function or not.
 */
function isFunction(value) {
    return typeof value === 'function';
}
exports.default = isFunction;
