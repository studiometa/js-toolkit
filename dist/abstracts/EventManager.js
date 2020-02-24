"use strict";
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, privateMap) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to get private field on non-instance");
    }
    return privateMap.get(receiver);
};
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, privateMap, value) {
    if (!privateMap.has(receiver)) {
        throw new TypeError("attempted to set private field on non-instance");
    }
    privateMap.set(receiver, value);
    return value;
};
var _events;
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Event management class.
 *
 * @method $on    Bind a given function to the given event.
 * @method $off   Unbind the given function from the given event.
 * @method $once  Bind a given function to the given event once.
 * @method $emit  Emit an event with custom props.
 */
class EventManager {
    constructor() {
        /** @type {Object} A private object to store the events */
        _events.set(this, {});
    }
    /**
     * Adds the event and the listener to the events list.
     *
     * @param  {String}       event    Name of the event.
     * @param  {String}       listener Function to be called.
     * @return {EventManager}          The current instance.
     */
    $on(event, listener) {
        if (typeof __classPrivateFieldGet(this, _events)[event] !== 'object') {
            __classPrivateFieldGet(this, _events)[event] = [];
        }
        __classPrivateFieldGet(this, _events)[event].push(listener);
        return this;
    }
    /**
     * Removes the event and the listener from the events list.
     *
     * @param  {String}       event    Name of the event.
     * @param  {String}       listener Function to be removed.
     * @return {EventManager}          The current instance.
     */
    $off(event, listener) {
        if (!Array.isArray(__classPrivateFieldGet(this, _events)[event])) {
            return this;
        }
        // If no event specified, we remove them all.
        if (!event) {
            __classPrivateFieldSet(this, _events, {});
            return this;
        }
        // If no listener have been specified, we remove all the listeners for
        // the given event.
        if (!listener) {
            __classPrivateFieldGet(this, _events)[event] = [];
            return this;
        }
        const index = __classPrivateFieldGet(this, _events)[event].indexOf(listener);
        if (index > -1) {
            __classPrivateFieldGet(this, _events)[event].splice(index, 1);
        }
        return this;
    }
    /**
     * Emits an event.
     *
     * @param  {String}       event Name of the event.
     * @param  {Array}        args  The arguments to apply to the functions bound to this event.
     * @return {EventManager}       The current instance.
     */
    $emit(event, ...args) {
        if (!Array.isArray(__classPrivateFieldGet(this, _events)[event])) {
            return this;
        }
        __classPrivateFieldGet(this, _events)[event].forEach((listener) => {
            listener.apply(this, args);
        });
        return this;
    }
    /**
     * Emits an event once and then removes it.
     *
     * @param  {String}       event    Name of the event.
     * @param  {String}       listener Function to be called.
     * @return {EventManager}          The current instance.
     */
    $once(event, listener) {
        const instance = this;
        this.$on(event, function handler(...args) {
            instance.$off(event, handler);
            listener.apply(instance, args);
        });
        return this;
    }
    /**
     * Get the all the events attached to the current instance.
     *
     * @return {Object}
     */
    get events() {
        return __classPrivateFieldGet(this, _events);
    }
}
exports.default = EventManager;
_events = new WeakMap();
