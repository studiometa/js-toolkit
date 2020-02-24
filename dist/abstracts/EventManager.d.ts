/**
 * Event management class.
 *
 * @method $on    Bind a given function to the given event.
 * @method $off   Unbind the given function from the given event.
 * @method $once  Bind a given function to the given event once.
 * @method $emit  Emit an event with custom props.
 */
export default abstract class EventManager {
    #private;
    /**
     * Bind a listener function to an event.
     *
     * @param  {String}       event    Name of the event.
     * @param  {String}       listener Function to be called.
     * @return {EventManager}          The current instance.
     */
    $on(event: string, listener: (...args: any) => void): this;
    /**
     * Unbind a listener function from an event.
     *
     * @param  {String}       event    Name of the event.
     * @param  {String}       listener Function to be removed.
     * @return {EventManager}          The current instance.
     */
    $off(event: string, listener: (...args: any) => void): this;
    /**
     * Emits an event.
     *
     * @param  {String}       event Name of the event.
     * @param  {Array}        args  The arguments to apply to the functions bound to this event.
     * @return {EventManager}       The current instance.
     */
    $emit(event: string, ...args: any): this;
    /**
     * Bind a listener function to an event for one execution only.
     *
     * @param  {String}       event    Name of the event.
     * @param  {String}       listener Function to be called.
     * @return {EventManager}          The current instance.
     */
    $once(event: string, listener: (...args: any) => void): this;
    /**
     * Get all the events attached to the current instance.
     *
     * @return {Object}
     */
    get events(): {
        [key: string]: Function[];
    };
}
