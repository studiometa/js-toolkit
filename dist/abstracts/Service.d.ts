/**
 * Service abstract class
 */
export default class Service {
    callbacks: Map<any, any>;
    isInit: boolean;
    /**
     * Getter to get the services properties.
     * This getter MUST be implementer by the service extending this class.
     * @return {Object}
     */
    get props(): any;
    /**
     * Method to initialize the service behaviors.
     * This method MUST be implemented by the service extending this class.
     *
     * @return {Service} The current instance
     */
    init(): Service;
    /**
     * Method to kill the service behaviors.
     * This method MUST be implemented by the service extending this class.
     *
     * @return {Service} The current instance
     */
    kill(): Service;
    /**
     * Add a callback.
     *
     * @param  {String}   key      The callback's identifier
     * @param  {Function} callback The callback function
     * @return {InstanceType<typeof Service>} The current instance
     */
    add(key: string, callback: Function): InstanceType<typeof Service>;
    /**
     * Test if a callback with the given key has already been added.
     *
     * @param  {String}  key The identifier to test
     * @return {Boolean}     Whether or not the identifier already exists
     */
    has(key: string): boolean;
    /**
     * Get the callback tied to the given key.
     *
     * @param  {String}   key The identifier to get
     * @return {Function}     The callback function
     */
    get(key: string): Function;
    /**
     * Remove the callback tied to the given key.
     *
     * @param  {String} key The identifier to remove
     * @return {Service}    The current instance
     */
    remove(key: string): Service;
    /**
     * Trigger each added callback with the given arguments.
     *
     * @param  {Array}   args All the arguments to apply to the callback
     * @return {Service}      The current instance
     */
    trigger(...args: any[]): Service;
}
