const attribute = Object.freeze({
  unknownQualifier: 'attribute.unknown-qualifier',
} as const);

const callback = Object.freeze({
  signalFailed: 'callback.signal-failed',
  contextSubscriptionFailed: 'callback.context-subscription-failed',
  contextTeardownFailed: 'callback.context-teardown-failed',
  attributeWatcherFailed: 'callback.attribute-watcher-failed',
  serviceFailed: 'callback.service-failed',
  schedulerTickFailed: 'callback.scheduler-tick-failed',
  scheduledTaskFailed: 'callback.scheduled-task-failed',
  domUpdateRunnerFailed: 'callback.dom-update-runner-failed',
  extendableEventExtensionFailed: 'callback.extendable-event-extension-failed',
} as const);

const component = Object.freeze({
  loadFailed: 'component.load-failed',
  mountFailed: 'component.mount-failed',
  lifecycleFailed: 'component.lifecycle-failed',
  invalidMountStrategy: 'component.invalid-mount-strategy',
  invalidFamilyDeclaration: 'component.invalid-family-declaration',
  configConflict: 'component.config-conflict',
} as const);

const event = Object.freeze({
  invalidEmitPayload: 'event.invalid-emit-payload',
} as const);

const manifest = Object.freeze({
  duplicateToken: 'manifest.duplicate-token',
} as const);

const option = Object.freeze({
  literalDefault: 'option.literal-default',
} as const);

const protocol = Object.freeze({
  lateRegistration: 'protocol.late-registration',
  unappliedDomUpdate: 'protocol.unapplied-dom-update',
} as const);

const ref = Object.freeze({
  mismatch: 'ref.mismatch',
} as const);

const registry = Object.freeze({
  conflict: 'registry.conflict',
  lazyNameMismatch: 'registry.lazy-name-mismatch',
} as const);

const responsive = Object.freeze({
  unknownBreakpoint: 'responsive.unknown-breakpoint',
} as const);

const scheduler = Object.freeze({
  backgroundPostFailed: 'scheduler.background-post-failed',
} as const);

const swap = Object.freeze({
  selfIgnored: 'swap.self-ignored',
} as const);

const service = Object.freeze({
  missingTarget: 'service.missing-target',
} as const);

const storage = Object.freeze({
  accessFailed: 'storage.access-failed',
  deserializeFailed: 'storage.deserialize-failed',
  serializeFailed: 'storage.serialize-failed',
} as const);

/** Stable codes carried by toolkit diagnostics. */
export const DIAGNOSTICS = Object.freeze({
  attribute,
  callback,
  component,
  event,
  manifest,
  option,
  protocol,
  ref,
  registry,
  responsive,
  scheduler,
  service,
  storage,
  swap,
} as const);

export type ToolkitDiagnosticSeverity = 'warning' | 'error';

type NestedValue<T> = T extends string ? T : { [K in keyof T]: NestedValue<T[K]> }[keyof T];

/** One stable value from {@link DIAGNOSTICS}. */
export type ToolkitCoreDiagnosticCode = NestedValue<typeof DIAGNOSTICS>;

/**
 * A code minted outside core, in the same `namespace.detail` shape.
 *
 * The channel is only worth having if a consumer can be told apart on it: a
 * listener filters by code, so a component reporting through a shared generic
 * code would be unfilterable, and one reporting through a core code would be
 * indistinguishable from core itself. The template literal is the loosest
 * thing that still keeps the shape a filter can rely on — `startsWith('figure.')`
 * works because the namespace is mandatory.
 */
export type ToolkitConsumerDiagnosticCode = `${string}.${string}`;

/**
 * A diagnostic code: one of core's own, or a consumer's namespaced one.
 *
 * Core's set stays enumerated and documented as {@link DIAGNOSTICS}; the union
 * with the wider shape is what lets a component outside core report on the same
 * channel rather than reaching for `console.warn`.
 */
export type ToolkitDiagnosticCode = ToolkitCoreDiagnosticCode | ToolkitConsumerDiagnosticCode;

interface ToolkitDiagnosticBaseDetail {
  readonly code: ToolkitDiagnosticCode;
  readonly message: string;
  readonly component?: string;
}

/** The payload of the public diagnostic event. */
export type ToolkitDiagnosticDetail =
  | (ToolkitDiagnosticBaseDetail & {
      readonly severity: 'warning';
      readonly error?: never;
    })
  | (ToolkitDiagnosticBaseDetail & {
      readonly severity: 'error';
      readonly error: unknown;
    });
