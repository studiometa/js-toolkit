/**
 * Event management class.
 */
export default class EventManager {
    /** @type {{[eventName:string]: Array<Function>}} An object to store the events */
    _events: {
        [eventName: string]: Function[];
    };
    /**
     * Bind a listener function to an event.
     *
     * @param  {String}   event    Name of the event.
     * @param  {Function} listener Function to be called.
     * @return {Function}          A function to unbind the listener.
     */
    $on(event: string, listener: Function): Function;
    /**
     * Unbind a listener function from an event.
     *
     * @param  {String}       event    Name of the event.
     * @param  {Function}     listener Function to be removed.
     * @return {EventManager}          The current instance.
     */
    $off(event: string, listener: Function): EventManager;
    /**
     * Emits an event.
     *
     * @param  {String}       event Name of the event.
     * @param  {Array}        args  The arguments to apply to the functions bound to this event.
     * @return {EventManager}       The current instance.
     */
    $emit(event: string, ...args: any[]): EventManager;
    /**
     * Bind a listener function to an event for one execution only.
     *
     * @param  {String}       event    Name of the event.
     * @param  {Function}     listener Function to be called.
     * @return {EventManager}          The current instance.
     */
    $once(event: string, listener: Function): EventManager;
}
