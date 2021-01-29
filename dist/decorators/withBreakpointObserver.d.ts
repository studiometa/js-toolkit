declare function _default(BaseClass: BaseComponent): BaseComponent;
export default _default;
export type Base = import("../abstracts/Base").default;
export type BaseComponent = typeof import("../abstracts/Base").default;
export type WithBreakpointObserverOptions = {
    activeBreakpoints?: string;
    inactiveBreakpoints?: string;
};
export type WithBreakpointObserverInterface = {
    $options: WithBreakpointObserverOptions;
};
