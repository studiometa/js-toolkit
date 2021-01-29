declare function _default(BaseClass: BaseComponent, defaultOptions?: any): BaseComponent;
export default _default;
export type Base = import("../abstracts/Base").default;
export type BaseComponent = typeof import("../abstracts/Base").default;
export type WithIntersectionObserverOptions = {
    intersectionObserver: any;
};
export type WithIntersectionObserverInterface = {
    $options: WithIntersectionObserverOptions;
    $observer: IntersectionObserver;
    intersected: (entries: IntersectionObserverEntry[]) => void;
};
