declare function _default(BaseClass: Base, breakpoints: Array<[string, any]>): {
    new (element: HTMLElement): {
        /**
         * Override the default $mount method to prevent component's from being
         * mounted when they should not.
         * @return {Base} The Base instance.
         */
        $mount(): Base;
        /**
         * Destroy all instances when the main one is destroyed.
         * @return {Base} The Base instance.
         */
        $destroy(): Base;
    };
};
export default _default;
export type Base = import("../abstracts/Base").default;
