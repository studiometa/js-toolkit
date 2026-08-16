import { describe, expect, expectTypeOf, it } from 'vitest';
import packageManifest from '../package.json' with { type: 'json' };
import { clamp, smoothTo } from '@studiometa/js-toolkit-v4/utils';
import {
  Base,
  DIAGNOSTICS,
  EVENTS,
  defineManifest,
  domUpdate,
  emitExtendable,
  fromMetaGlob,
  fromWebpackContext,
  subscribeContext,
  useDrag,
  useInView,
  useMutation,
  usePointer,
  useScrollProgress,
  watchAttributes,
  withDrag,
  withInView,
  withMutation,
  withPointer,
  withScrollProgress,
  type DefineManifestOptions,
  type DomMutation,
  type DomUpdateDetail,
  type DomUpdateRunner,
  type DragMixinOptions,
  type DragOptions,
  type DragProps,
  type ElementPointerProps,
  type InViewHook,
  type InViewMixinOptions,
  type ExtendableDetail,
  type Extension,
  type InViewProps,
  type MutationHook,
  type MutationMixinOptions,
  type MutationProps,
  type PointerHook,
  type PointerMixinOptions,
  type PointerProps,
  type AttributeChange,
  type AttributeWatcher,
  type ContextCallback,
  type ModuleRecord,
  type Service,
  type ToolkitDiagnosticCode,
  type ToolkitDiagnosticDetail,
  type ToolkitDiagnosticSeverity,
  type WebpackContextLike,
} from '@studiometa/js-toolkit-v4';
import defineManifestFromSubpath from '@studiometa/js-toolkit-v4/defineManifest';
import domUpdateFromSubpath, {
  domUpdate as namedDomUpdateFromSubpath,
} from '@studiometa/js-toolkit-v4/domUpdate';
import emitExtendableFromSubpath, {
  emitExtendable as namedEmitExtendableFromSubpath,
} from '@studiometa/js-toolkit-v4/emitExtendable';
import fromMetaGlobFromSubpath from '@studiometa/js-toolkit-v4/fromMetaGlob';
import fromWebpackContextFromSubpath from '@studiometa/js-toolkit-v4/fromWebpackContext';
import subscribeContextFromSubpath, {
  subscribeContext as namedSubscribeContextFromSubpath,
} from '@studiometa/js-toolkit-v4/subscribeContext';
import useDragFromSubpath from '@studiometa/js-toolkit-v4/useDrag';
import useInViewFromSubpath, {
  useInView as namedUseInViewFromSubpath,
} from '@studiometa/js-toolkit-v4/useInView';
import useMutationFromSubpath, {
  useMutation as namedUseMutationFromSubpath,
} from '@studiometa/js-toolkit-v4/useMutation';
import usePointerFromSubpath, {
  usePointer as namedUsePointerFromSubpath,
} from '@studiometa/js-toolkit-v4/usePointer';
import useScrollProgressSubpath from '@studiometa/js-toolkit-v4/useScrollProgress';
import watchAttributesFromSubpath, {
  watchAttributes as namedWatchAttributesFromSubpath,
  type AttributeChange as SubpathAttributeChange,
  type AttributeWatcher as SubpathAttributeWatcher,
} from '@studiometa/js-toolkit-v4/watchAttributes';
import diagnosticsFromSubpath, {
  DIAGNOSTICS as namedDiagnosticsFromSubpath,
} from '@studiometa/js-toolkit-v4/DIAGNOSTICS';
import eventsFromSubpath, {
  EVENTS as namedEventsFromSubpath,
} from '@studiometa/js-toolkit-v4/EVENTS';
import withDragFromSubpath from '@studiometa/js-toolkit-v4/withDrag';
import withInViewFromSubpath, {
  withInView as namedWithInViewFromSubpath,
} from '@studiometa/js-toolkit-v4/withInView';
import withMutationFromSubpath, {
  withMutation as namedWithMutationFromSubpath,
} from '@studiometa/js-toolkit-v4/withMutation';
import withPointerFromSubpath, {
  withPointer as namedWithPointerFromSubpath,
} from '@studiometa/js-toolkit-v4/withPointer';
import withScrollProgressSubpath from '@studiometa/js-toolkit-v4/withScrollProgress';

function toolkitDiagnosticDetailTypeAssertions(detail: ToolkitDiagnosticDetail): void {
  // @ts-expect-error diagnostic details are readonly observations
  detail.code = DIAGNOSTICS.component.mountFailed;
  // @ts-expect-error the component name cannot be rewritten by a listener
  detail.component = 'Replacement';
  if (detail.severity === 'error') {
    // @ts-expect-error the caught value keeps its identity and cannot be replaced
    detail.error = new Error('replacement');
  }
}

void toolkitDiagnosticDetailTypeAssertions;

function removedBaseAttributeWatcherAssertion(instance: Base): void {
  // @ts-expect-error Attribute observation is a standalone helper, not a Base method.
  void instance.$watchAttributes;
}

void removedBaseAttributeWatcherAssertion;

// @ts-expect-error ToolkitErrorDetail was removed by the diagnostic protocol.
type RemovedToolkitErrorDetail = import('@studiometa/js-toolkit-v4').ToolkitErrorDetail;
const removedToolkitErrorDetailAssertion = null as unknown as RemovedToolkitErrorDetail;
void removedToolkitErrorDetailAssertion;

// @ts-expect-error ToolkitErrorStage was removed by the diagnostic protocol.
type RemovedToolkitErrorStage = import('@studiometa/js-toolkit-v4').ToolkitErrorStage;
const removedToolkitErrorStageAssertion = null as unknown as RemovedToolkitErrorStage;
void removedToolkitErrorStageAssertion;

// @ts-expect-error HandlerRegistration is an internal source type.
type RemovedHandlerRegistration = import('@studiometa/js-toolkit-v4').HandlerRegistration;
const removedHandlerRegistrationTypeAssertion = null as unknown as RemovedHandlerRegistration;
void removedHandlerRegistrationTypeAssertion;

// @ts-expect-error InjectContextOptions was removed with the basic options path.
type RemovedInjectContextOptions = import('@studiometa/js-toolkit-v4').InjectContextOptions;
const removedInjectContextOptionsTypeAssertion = null as unknown as RemovedInjectContextOptions;
void removedInjectContextOptionsTypeAssertion;

// @ts-expect-error ContextRequest is source-internal transport state.
type InternalContextRequest = import('@studiometa/js-toolkit-v4').ContextRequest;
const internalContextRequestTypeAssertion = null as unknown as InternalContextRequest;
void internalContextRequestTypeAssertion;

describe('the package entry points', () => {
  it('serves the utils from the /utils subpath', () => {
    expect(clamp(5, 0, 1)).toBe(1);
    const x = smoothTo(3);
    expect(x()).toBe(3);
    x.destroy();
  });

  it('keeps the framework on the root entry, without the utils or removed exports', async () => {
    expect(typeof Base).toBe('function');
    const root = (await import('@studiometa/js-toolkit-v4')) as Record<string, unknown>;
    expect(Object.keys(root)).toHaveLength(81);
    expect(root.clamp).toBeUndefined();
    expect(root.smoothTo).toBeUndefined();
    for (const removed of [
      'SOURCE',
      'HANDLER_REGISTRATIONS',
      'MOUNTED_EVENT',
      'DESTROYED_EVENT',
      'DOM_UPDATE_EVENT',
      'JS_TOOLKIT_ERROR_EVENT',
      'ToolkitErrorDetail',
      'ToolkitErrorStage',
      'dispatchContextRequest',
      'retainContextRequest',
      'cancelContextRequest',
    ]) {
      expect(root[removed]).toBeUndefined();
    }
  });

  it('exports watchAttributes and its types from root and subpath, not Base', () => {
    expect(watchAttributesFromSubpath).toBe(watchAttributes);
    expect(namedWatchAttributesFromSubpath).toBe(watchAttributes);
    expect(Base.prototype).not.toHaveProperty('$watchAttributes');
    expectTypeOf<AttributeChange>().toEqualTypeOf<SubpathAttributeChange>();
    expectTypeOf<AttributeWatcher>().toEqualTypeOf<SubpathAttributeWatcher>();
    expectTypeOf<AttributeWatcher>().toEqualTypeOf<(change: AttributeChange) => void>();
  });

  it('exports the optional context subscription helper from root and subpath', () => {
    expect(subscribeContextFromSubpath).toBe(subscribeContext);
    expect(namedSubscribeContextFromSubpath).toBe(subscribeContext);
    expectTypeOf<ContextCallback<string>>().toEqualTypeOf<
      (value: string, unsubscribe: () => void) => void | (() => void)
    >();
  });

  it('exports standalone orchestration helpers without Base wrappers', () => {
    expect(domUpdateFromSubpath).toBe(domUpdate);
    expect(namedDomUpdateFromSubpath).toBe(domUpdate);
    expect(emitExtendableFromSubpath).toBe(emitExtendable);
    expect(namedEmitExtendableFromSubpath).toBe(emitExtendable);
    expect(Base.prototype).not.toHaveProperty('$domUpdate');
    expect(Base.prototype).not.toHaveProperty('$emitExtendable');
    expect(Base.prototype).not.toHaveProperty('$viewTransition');
    expectTypeOf(domUpdate).parameter(0).toEqualTypeOf<Node>();
    expectTypeOf<DomMutation>().toEqualTypeOf<() => void | Promise<void>>();
    expectTypeOf<DomUpdateDetail>().toMatchTypeOf<{ wrap(runner: DomUpdateRunner): void }>();
    expectTypeOf<ExtendableDetail>().toMatchTypeOf<{ waitUntil(extension: Extension): void }>();
  });

  it('does not expose removed constant and symbol subpaths', () => {
    const exports = packageManifest.exports as Record<string, unknown>;
    for (const removed of [
      './SOURCE',
      './HANDLER_REGISTRATIONS',
      './MOUNTED_EVENT',
      './DESTROYED_EVENT',
      './DOM_UPDATE_EVENT',
      './JS_TOOLKIT_ERROR_EVENT',
      './dispatchContextRequest',
      './retainContextRequest',
      './cancelContextRequest',
    ]) {
      expect(exports).not.toHaveProperty(removed);
    }
    expect(exports).toHaveProperty('./DIAGNOSTICS');
    expect(exports).toHaveProperty('./EVENTS');
  });

  it('serves drag controls and types from the public entry points', () => {
    const options: DragOptions = { axis: 'x', inertia: false };
    const mixinOptions: DragMixinOptions = { ...options, target: (instance) => instance.$el };

    expect(useDragFromSubpath).toBe(useDrag);
    expect(withDragFromSubpath).toBe(withDrag);
    expectTypeOf(useDrag(document.documentElement, options)).toEqualTypeOf<Service<DragProps>>();
    expect(mixinOptions.axis).toBe('x');
    expect(mixinOptions.inertia).toBe(false);
  });

  it('serves useInView and withInView from the root and their symbol subpaths', () => {
    expect(typeof useInView).toBe('function');
    expect(useInViewFromSubpath).toBe(useInView);
    expect(namedUseInViewFromSubpath).toBe(useInView);
    expect(withInViewFromSubpath).toBe(withInView);
    expect(namedWithInViewFromSubpath).toBe(withInView);
    expectTypeOf(useInView(document.documentElement)).toEqualTypeOf<Service<InViewProps>>();
    expectTypeOf<InViewHook>().toMatchTypeOf<{
      intersected?: (props: InViewProps) => void;
    }>();
    expectTypeOf<InViewMixinOptions>().toMatchTypeOf<IntersectionObserverInit>();
  });

  it('serves useMutation and withMutation from the root and their symbol subpaths', () => {
    expect(useMutationFromSubpath).toBe(useMutation);
    expect(namedUseMutationFromSubpath).toBe(useMutation);
    expect(withMutationFromSubpath).toBe(withMutation);
    expect(namedWithMutationFromSubpath).toBe(withMutation);
    expectTypeOf(useMutation(document)).toEqualTypeOf<Service<MutationProps>>();
    expectTypeOf<MutationProps>().toEqualTypeOf<{ readonly records: readonly MutationRecord[] }>();
    expectTypeOf<MutationHook>().toMatchTypeOf<{
      mutated?: (props: MutationProps) => void;
    }>();
    expectTypeOf<MutationMixinOptions>().toMatchTypeOf<MutationObserverInit>();
  });

  it('serves usePointer and withPointer from the root and their symbol subpaths', () => {
    expect(usePointerFromSubpath).toBe(usePointer);
    expect(namedUsePointerFromSubpath).toBe(usePointer);
    expect(withPointerFromSubpath).toBe(withPointer);
    expect(namedWithPointerFromSubpath).toBe(withPointer);
    // The viewport pointer and the element-scoped one are one function.
    expectTypeOf(usePointer()).toEqualTypeOf<Service<PointerProps>>();
    expectTypeOf(usePointer(document.documentElement)).toEqualTypeOf<
      Service<ElementPointerProps>
    >();
    expectTypeOf<ElementPointerProps>().toMatchTypeOf<PointerProps>();
    expectTypeOf<PointerHook>().toMatchTypeOf<{
      moved?: (props: ElementPointerProps) => void;
    }>();
    expectTypeOf<PointerMixinOptions>().toMatchTypeOf<{
      target?: (instance: Base) => Element;
    }>();
  });

  it('exports manifest generation from the root and symbol subpaths', () => {
    expect(defineManifestFromSubpath).toBe(defineManifest);
    expect(fromMetaGlobFromSubpath).toBe(fromMetaGlob);
    expect(fromWebpackContextFromSubpath).toBe(fromWebpackContext);
    expectTypeOf<DefineManifestOptions>().toMatchTypeOf<{
      modules: ModuleRecord;
      mountStrategy?: string;
    }>();
    expectTypeOf<WebpackContextLike>().toBeCallableWith('./Widget.ts');
  });

  it('exports scroll progress from the root and symbol subpaths', () => {
    expect(useScrollProgress).toBe(useScrollProgressSubpath);
    expect(withScrollProgress).toBe(withScrollProgressSubpath);
  });

  it('exports the diagnostic contract from root and constant subpaths', () => {
    expect(eventsFromSubpath).toBe(EVENTS);
    expect(namedEventsFromSubpath).toBe(EVENTS);
    expect(diagnosticsFromSubpath).toBe(DIAGNOSTICS);
    expect(namedDiagnosticsFromSubpath).toBe(DIAGNOSTICS);
    expectTypeOf<ToolkitDiagnosticSeverity>().toEqualTypeOf<'warning' | 'error'>();
    expectTypeOf<ToolkitDiagnosticCode>().toMatchTypeOf<string>();
    expectTypeOf<ToolkitDiagnosticDetail>().toMatchTypeOf<
      | {
          readonly severity: 'warning';
          readonly code: ToolkitDiagnosticCode;
          readonly message: string;
          readonly component?: string;
          readonly error?: never;
        }
      | {
          readonly severity: 'error';
          readonly code: ToolkitDiagnosticCode;
          readonly message: string;
          readonly component?: string;
          readonly error: unknown;
        }
    >();
  });
});
