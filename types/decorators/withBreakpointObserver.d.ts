declare function _default(BaseClass: Base): {
    new (element: HTMLElement): {
        /**
         * Override the default $mount method to prevent component's from being
         * mounted when they should not.
         * @return {BreakpointObserver} The component's instance.
         */
        $mount(): any;
    };
    config: {
        name: string;
        options: {
            activeBreakpoints: StringConstructor;
            inactiveBreakpoints: StringConstructor;
        };
        debug?: boolean;
        log?: boolean;
        refs?: string[];
        components?: import("../abstracts/Base").BaseConfigComponents;
    };
};
export default _default;
export type Base = import("../abstracts/Base").default;
export type BaseOptions = {
    name: string;
    debug: boolean;
    log: boolean;
};
export type BreakpointObserverOptions = import("../abstracts/Base").BaseOptions & {
    activeBreakpoints?: string;
    inactiveBreakpoints?: string;
};
