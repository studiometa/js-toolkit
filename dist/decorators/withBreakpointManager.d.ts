declare function _default(BaseClass: BaseComponent, breakpoints: Array<[string, BaseComponent]>): BaseComponent;
export default _default;
export type Base = import("../abstracts/Base").default;
export type BaseComponent = typeof import("../abstracts/Base").default;
