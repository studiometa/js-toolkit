export const JS_TOOLKIT_ERROR_EVENT = 'js-toolkit:error';

export type ToolkitErrorStage = 'load' | 'mount' | 'lifecycle';

export interface ToolkitErrorDetail {
  readonly stage: ToolkitErrorStage;
  readonly error: unknown;
  readonly component?: string;
}

/**
 * Announce one caught framework failure without changing its recovery path.
 * Listeners observe the error: the event is not cancelable, and dispatch does
 * not decide whether the framework continues.
 *
 * @internal
 */
export function reportToolkitError(
  stage: ToolkitErrorStage,
  error: unknown,
  component?: string,
  target: Element | Document = document,
): CustomEvent<ToolkitErrorDetail> {
  const detail: ToolkitErrorDetail =
    component === undefined ? { stage, error } : { stage, error, component };
  const dispatchTarget = target instanceof Element && !target.isConnected ? document : target;
  const event = new CustomEvent<ToolkitErrorDetail>(JS_TOOLKIT_ERROR_EVENT, {
    bubbles: true,
    cancelable: false,
    composed: true,
    detail,
  });
  dispatchTarget.dispatchEvent(event);
  return event;
}
