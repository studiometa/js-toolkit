/**
 * Push a new state.
 *
 * @param {HistoryOptions} options The new state.
 * @param {Object}         data    The data for the new state.
 * @param {string}         title   The title for the new state.
 */
export function push(options: HistoryOptions, data: any, title: string): void;
/**
 * Replace a new state.
 *
 * @param {HistoryOptions} options The new state.
 * @param {Object}         data    The data for the new state.
 * @param {string}         title   The title for the new state.
 */
export function replace(options: HistoryOptions, data: any, title: string): void;
export type HistoryOptions = {
    path?: string | undefined;
    search?: URLSearchParams | {
        [key: string]: unknown;
    };
    hash?: string | undefined;
};
