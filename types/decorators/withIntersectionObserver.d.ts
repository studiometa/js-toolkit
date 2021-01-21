declare function _default(BaseClass: any, defaultOptions?: {
    threshold: any[];
}): {
    new (element: HTMLElement): {
        [x: string]: any;
        /**
         * Add the `intersected` method to the list of method to exclude from the `autoBind` call.
         */
        readonly _excludeFromAutoBind: any[];
        $observer: IntersectionObserver;
    };
    [x: string]: any;
};
export default _default;
