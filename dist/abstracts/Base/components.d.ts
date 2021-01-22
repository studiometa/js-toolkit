/**
 * Mount children components of a given instance.
 *
 * @param  {Base} instance The parent component's instance.
 * @return {void}
 */
export function mountComponents(instance: Base): void;
/**
 * Destroy children components of a given instance.
 *
 * @param  {Base} instance The parent component's instance.
 * @return {void}
 */
export function destroyComponents(instance: Base): void;
export type Base = import(".").default;
