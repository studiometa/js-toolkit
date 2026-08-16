import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import {
  DIAGNOSTICS,
  type ToolkitDiagnosticCode,
  type ToolkitDiagnosticDetail,
  type ToolkitDiagnosticSeverity,
} from './diagnostic-contract.js';
import { reportDiagnostic, warn, warnOnce } from './diagnostics.js';
import { EVENTS } from './events.js';

describe('diagnostics', () => {
  it('exposes exact deeply frozen stable codes', () => {
    expect(DIAGNOSTICS).toEqual({
      callback: {
        signalFailed: 'callback.signal-failed',
        contextSubscriptionFailed: 'callback.context-subscription-failed',
        contextTeardownFailed: 'callback.context-teardown-failed',
        attributeWatcherFailed: 'callback.attribute-watcher-failed',
        serviceFailed: 'callback.service-failed',
        schedulerTickFailed: 'callback.scheduler-tick-failed',
        scheduledTaskFailed: 'callback.scheduled-task-failed',
        domUpdateRunnerFailed: 'callback.dom-update-runner-failed',
        extendableEventExtensionFailed: 'callback.extendable-event-extension-failed',
      },
      component: {
        loadFailed: 'component.load-failed',
        mountFailed: 'component.mount-failed',
        lifecycleFailed: 'component.lifecycle-failed',
        invalidMountStrategy: 'component.invalid-mount-strategy',
        invalidFamilyDeclaration: 'component.invalid-family-declaration',
        configConflict: 'component.config-conflict',
      },
      event: { invalidEmitPayload: 'event.invalid-emit-payload' },
      manifest: { duplicateToken: 'manifest.duplicate-token' },
      option: { literalDefault: 'option.literal-default' },
      protocol: {
        lateRegistration: 'protocol.late-registration',
        unappliedDomUpdate: 'protocol.unapplied-dom-update',
      },
      ref: { mismatch: 'ref.mismatch' },
      registry: {
        conflict: 'registry.conflict',
        lazyNameMismatch: 'registry.lazy-name-mismatch',
      },
      responsive: { unknownBreakpoint: 'responsive.unknown-breakpoint' },
      scheduler: { backgroundPostFailed: 'scheduler.background-post-failed' },
      storage: {
        accessFailed: 'storage.access-failed',
        deserializeFailed: 'storage.deserialize-failed',
        serializeFailed: 'storage.serialize-failed',
      },
    });
    expect(Object.isFrozen(DIAGNOSTICS)).toBe(true);
    for (const group of Object.values(DIAGNOSTICS)) {
      expect(Object.isFrozen(group)).toBe(true);
    }
    expectTypeOf<ToolkitDiagnosticSeverity>().toEqualTypeOf<'warning' | 'error'>();
    expectTypeOf<ToolkitDiagnosticCode>().toEqualTypeOf<
      | 'callback.signal-failed'
      | 'callback.context-subscription-failed'
      | 'callback.context-teardown-failed'
      | 'callback.attribute-watcher-failed'
      | 'callback.service-failed'
      | 'callback.scheduler-tick-failed'
      | 'callback.scheduled-task-failed'
      | 'callback.dom-update-runner-failed'
      | 'callback.extendable-event-extension-failed'
      | 'component.load-failed'
      | 'component.mount-failed'
      | 'component.lifecycle-failed'
      | 'component.invalid-mount-strategy'
      | 'component.invalid-family-declaration'
      | 'component.config-conflict'
      | 'event.invalid-emit-payload'
      | 'manifest.duplicate-token'
      | 'option.literal-default'
      | 'protocol.late-registration'
      | 'protocol.unapplied-dom-update'
      | 'ref.mismatch'
      | 'registry.conflict'
      | 'registry.lazy-name-mismatch'
      | 'responsive.unknown-breakpoint'
      | 'scheduler.background-post-failed'
      | 'storage.access-failed'
      | 'storage.deserialize-failed'
      | 'storage.serialize-failed'
    >();
  });

  it('dispatches warning details before the standardized default sink', () => {
    const order: string[] = [];
    const details: ToolkitDiagnosticDetail[] = [];
    const onDiagnostic = (rawEvent: Event) => {
      const event = rawEvent as CustomEvent<ToolkitDiagnosticDetail>;
      order.push('event');
      details.push(event.detail);
      expect(event.type).toBe('js-toolkit:diagnostic');
      expect(event.target).toBe(document);
      expect(event.bubbles).toBe(true);
      expect(event.composed).toBe(true);
      expect(event.cancelable).toBe(true);
    };
    document.addEventListener(EVENTS.diagnostic, onDiagnostic, { once: true });
    const sink = vi.spyOn(console, 'warn').mockImplementation(() => order.push('sink'));

    const event = warn(DIAGNOSTICS.manifest.duplicateToken, 'Duplicate token.');

    expect(event.detail).toEqual({
      severity: 'warning',
      code: 'manifest.duplicate-token',
      message: 'Duplicate token.',
    });
    expect(details).toEqual([event.detail]);
    expect(order).toEqual(['event', 'sink']);
    expect(sink).toHaveBeenCalledWith('[js-toolkit:manifest.duplicate-token] Duplicate token.');
    sink.mockRestore();
  });

  it('starts on a connected element and falls back to document for a detached element', () => {
    const connected = document.body.appendChild(document.createElement('div'));
    const detached = document.createElement('div');
    const targets: EventTarget[] = [];
    const listener = (event: Event) => {
      event.preventDefault();
      targets.push(event.target as EventTarget);
    };
    document.addEventListener(EVENTS.diagnostic, listener);

    warn(DIAGNOSTICS.ref.mismatch, 'Connected.', { target: connected });
    warn(DIAGNOSTICS.ref.mismatch, 'Detached.', { target: detached });

    document.removeEventListener(EVENTS.diagnostic, listener);
    connected.remove();
    expect(targets).toEqual([connected, document]);
  });

  it('lets cancellation suppress warning output without changing dispatch', () => {
    const sink = vi.spyOn(console, 'warn').mockImplementation(() => {});
    document.addEventListener(EVENTS.diagnostic, (event) => event.preventDefault(), { once: true });

    const event = warn(DIAGNOSTICS.event.invalidEmitPayload, 'Invalid payload.');

    expect(event.defaultPrevented).toBe(true);
    expect(sink).not.toHaveBeenCalled();
    sink.mockRestore();
  });

  it('reports the original error after dispatch when the event is not canceled', () => {
    const failure = new Error('original');
    const order: string[] = [];
    const sink = vi.fn(() => order.push('sink'));
    vi.stubGlobal('reportError', sink);
    document.addEventListener(EVENTS.diagnostic, () => order.push('event'), { once: true });

    try {
      const event = reportDiagnostic(
        DIAGNOSTICS.callback.signalFailed,
        'A callback failed.',
        failure,
      );

      expect(sink).toHaveBeenCalledWith(failure);
      expect(event.detail).toEqual({
        severity: 'error',
        code: 'callback.signal-failed',
        message: 'A callback failed.',
        error: failure,
      });
      expect(order).toEqual(['event', 'sink']);
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('keeps the original default sink when a listener mutates the detail', () => {
    const failure = new Error('original');
    const replacement = new Error('replacement');
    const errorSink = vi.fn();
    const warningSink = vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.stubGlobal('reportError', errorSink);
    document.addEventListener(
      EVENTS.diagnostic,
      (rawEvent) => {
        const detail = (rawEvent as CustomEvent<ToolkitDiagnosticDetail>).detail as {
          severity: string;
          code: string;
          message: string;
          error: unknown;
        };
        detail.severity = 'warning';
        detail.code = DIAGNOSTICS.manifest.duplicateToken;
        detail.message = 'Mutated.';
        detail.error = replacement;
      },
      { once: true },
    );

    try {
      reportDiagnostic(DIAGNOSTICS.callback.signalFailed, 'A callback failed.', failure);

      expect(errorSink).toHaveBeenCalledOnce();
      expect(errorSink).toHaveBeenCalledWith(failure);
      expect(warningSink).not.toHaveBeenCalled();
    } finally {
      warningSink.mockRestore();
      vi.unstubAllGlobals();
    }
  });

  it('lets cancellation suppress reportError without changing the error detail', () => {
    const failure = new Error('suppressed');
    const sink = vi.fn();
    vi.stubGlobal('reportError', sink);
    document.addEventListener(EVENTS.diagnostic, (event) => event.preventDefault(), { once: true });

    try {
      const event = reportDiagnostic(DIAGNOSTICS.component.mountFailed, 'Mount failed.', failure, {
        component: 'Broken',
      });

      expect(event.defaultPrevented).toBe(true);
      expect(event.detail).toEqual({
        severity: 'error',
        code: 'component.mount-failed',
        message: 'Mount failed.',
        component: 'Broken',
        error: failure,
      });
      expect(sink).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('deduplicates by weak owner and misuse key, not by message', () => {
    const firstOwner = {};
    const secondOwner = {};
    const events: ToolkitDiagnosticDetail[] = [];
    const listener = (rawEvent: Event) => {
      rawEvent.preventDefault();
      events.push((rawEvent as CustomEvent<ToolkitDiagnosticDetail>).detail);
    };
    document.addEventListener(EVENTS.diagnostic, listener);

    warnOnce(firstOwner, 'a', DIAGNOSTICS.registry.conflict, 'Same message.');
    warnOnce(firstOwner, 'a', DIAGNOSTICS.registry.conflict, 'Same message.');
    warnOnce(firstOwner, 'b', DIAGNOSTICS.registry.conflict, 'Same message.');
    warnOnce(secondOwner, 'a', DIAGNOSTICS.registry.conflict, 'Same message.');

    document.removeEventListener(EVENTS.diagnostic, listener);
    expect(events).toHaveLength(3);
  });
});
