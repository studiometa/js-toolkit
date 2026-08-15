import { type ToolkitDiagnosticCode, type ToolkitDiagnosticDetail } from './diagnostic-contract.js';
import { EVENTS } from './events.js';
import { getSharedRuntimeSlot } from './shared-runtime.js';

export {
  DIAGNOSTICS,
  type ToolkitDiagnosticCode,
  type ToolkitDiagnosticDetail,
  type ToolkitDiagnosticSeverity,
} from './diagnostic-contract.js';

interface DiagnosticContext {
  component?: string;
  target?: Element;
}

interface DiagnosticWarningState {
  owners: WeakMap<object, Set<string>>;
}

function warningOwners(): WeakMap<object, Set<string>> {
  return getSharedRuntimeSlot<DiagnosticWarningState>('diagnostics:warnings', 1, () => ({
    owners: new WeakMap(),
  })).owners;
}

function dispatchDiagnostic(
  detail: ToolkitDiagnosticDetail,
  target?: Element,
): CustomEvent<ToolkitDiagnosticDetail> {
  let runDefaultSink: () => void;
  if (detail.severity === 'warning') {
    const output = `[js-toolkit:${detail.code}] ${detail.message}`;
    runDefaultSink = () => console.warn(output);
  } else {
    const error = detail.error;
    runDefaultSink = () => reportError(error);
  }
  const event = new CustomEvent<ToolkitDiagnosticDetail>(EVENTS.diagnostic, {
    bubbles: true,
    composed: true,
    cancelable: true,
    detail,
  });
  (target?.isConnected ? target : document).dispatchEvent(event);

  if (!event.defaultPrevented) {
    runDefaultSink();
  }

  return event;
}

/** @internal */
export function reportDiagnostic(
  code: ToolkitDiagnosticCode,
  message: string,
  error: unknown,
  { component, target }: DiagnosticContext = {},
): CustomEvent<ToolkitDiagnosticDetail> {
  const detail: ToolkitDiagnosticDetail =
    component === undefined
      ? { severity: 'error', code, message, error }
      : { severity: 'error', code, message, component, error };
  return dispatchDiagnostic(detail, target);
}

/** @internal */
export function warn(
  code: ToolkitDiagnosticCode,
  message: string,
  { component, target }: DiagnosticContext = {},
): CustomEvent<ToolkitDiagnosticDetail> {
  const detail: ToolkitDiagnosticDetail =
    component === undefined
      ? { severity: 'warning', code, message }
      : { severity: 'warning', code, message, component };
  return dispatchDiagnostic(detail, target);
}

/**
 * Report one warning per weak owner and misuse key across evaluated package
 * copies in this realm.
 *
 * @internal
 */
export function warnOnce(
  owner: object,
  key: string,
  code: ToolkitDiagnosticCode,
  message: string,
  context?: DiagnosticContext,
): CustomEvent<ToolkitDiagnosticDetail> | undefined {
  const owners = warningOwners();
  let keys = owners.get(owner);
  if (!keys) {
    keys = new Set();
    owners.set(owner, keys);
  }
  const warningKey = `${code}\0${key}`;
  if (keys.has(warningKey)) {
    return undefined;
  }
  keys.add(warningKey);
  return warn(code, message, context);
}
