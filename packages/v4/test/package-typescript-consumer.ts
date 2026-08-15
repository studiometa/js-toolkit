import {
  DIAGNOSTICS,
  EVENTS,
  watchAttributes as rootWatchAttributes,
  type AttributeChange as RootAttributeChange,
  type AttributeWatcher as RootAttributeWatcher,
  type ToolkitDiagnosticCode,
  type ToolkitDiagnosticDetail,
  type ToolkitDiagnosticSeverity,
} from '@studiometa/js-toolkit-v4';
import diagnosticsFromSubpath from '@studiometa/js-toolkit-v4/DIAGNOSTICS';
import subpathWatchAttributes, {
  watchAttributes as namedSubpathWatchAttributes,
  type AttributeChange as SubpathAttributeChange,
  type AttributeWatcher as SubpathAttributeWatcher,
} from '@studiometa/js-toolkit-v4/watchAttributes';

const rootSignature: typeof rootWatchAttributes = namedSubpathWatchAttributes;
const namedSubpathSignature: typeof namedSubpathWatchAttributes = rootWatchAttributes;
const defaultSubpathSignature: typeof subpathWatchAttributes = rootWatchAttributes;

const subpathChange: SubpathAttributeChange = {
  name: 'data-packed-watch',
  value: 'one',
  previousValue: null,
};
const rootChange: RootAttributeChange = subpathChange;
const roundTripChange: SubpathAttributeChange = rootChange;

const rootWatcher: RootAttributeWatcher = (change) => {
  const compatibleChange: SubpathAttributeChange = change;
  void compatibleChange;
};
const subpathWatcher: SubpathAttributeWatcher = rootWatcher;
const roundTripWatcher: RootAttributeWatcher = subpathWatcher;

const severity: ToolkitDiagnosticSeverity = 'warning';
const code: ToolkitDiagnosticCode = DIAGNOSTICS.event.invalidEmitPayload;
const warning: ToolkitDiagnosticDetail = {
  severity,
  code,
  message: 'Invalid payload.',
};
const monitor = (event: CustomEvent<ToolkitDiagnosticDetail>) => {
  if (event.detail.severity === 'error') {
    void event.detail.error;
  }
  event.preventDefault();
};
document.addEventListener(EVENTS.diagnostic, monitor as EventListener);
document.removeEventListener(EVENTS.diagnostic, monitor as EventListener);

// @ts-expect-error EVENTS.error was removed.
void EVENTS.error;
// @ts-expect-error ToolkitErrorDetail was removed.
type RemovedToolkitErrorDetail = import('@studiometa/js-toolkit-v4').ToolkitErrorDetail;
// @ts-expect-error ToolkitErrorStage was removed.
type RemovedToolkitErrorStage = import('@studiometa/js-toolkit-v4').ToolkitErrorStage;
type RemovedToolkitErrorExports = RemovedToolkitErrorDetail | RemovedToolkitErrorStage;
const removedToolkitErrorExports = null as unknown as RemovedToolkitErrorExports;
void removedToolkitErrorExports;
// @ts-expect-error warning diagnostics do not carry an error.
warning.error = new Error('not allowed');

void [
  rootSignature,
  namedSubpathSignature,
  defaultSubpathSignature,
  roundTripChange,
  roundTripWatcher,
  diagnosticsFromSubpath === DIAGNOSTICS,
  warning,
];
