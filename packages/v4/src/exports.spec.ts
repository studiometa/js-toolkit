import { describe, expect, expectTypeOf, it } from 'vitest';
import packageManifest from '../package.json' with { type: 'json' };
import { clamp, smoothTo } from '@studiometa/js-toolkit-v4/utils';
import {
  Base,
  EVENTS,
  defineManifest,
  domUpdate,
  emitExtendable,
  fromMetaGlob,
  fromWebpackContext,
  useDrag,
  useInView,
  useScrollProgress,
  withDrag,
  withInView,
  withScrollProgress,
  type DefineManifestOptions,
  type DomMutation,
  type DomUpdateDetail,
  type DomUpdateRunner,
  type DragMixinOptions,
  type DragOptions,
  type DragProps,
  type InViewHook,
  type InViewMixinOptions,
  type ExtendableDetail,
  type Extension,
  type InViewProps,
  type ModuleRecord,
  type Service,
  type ToolkitErrorDetail,
  type ToolkitErrorStage,
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
import useDragFromSubpath from '@studiometa/js-toolkit-v4/useDrag';
import useInViewFromSubpath, {
  useInView as namedUseInViewFromSubpath,
} from '@studiometa/js-toolkit-v4/useInView';
import useScrollProgressSubpath from '@studiometa/js-toolkit-v4/useScrollProgress';
import eventsFromSubpath, {
  EVENTS as namedEventsFromSubpath,
} from '@studiometa/js-toolkit-v4/EVENTS';
import withDragFromSubpath from '@studiometa/js-toolkit-v4/withDrag';
import withInViewFromSubpath, {
  withInView as namedWithInViewFromSubpath,
} from '@studiometa/js-toolkit-v4/withInView';
import withScrollProgressSubpath from '@studiometa/js-toolkit-v4/withScrollProgress';

function toolkitErrorDetailTypeAssertions(detail: ToolkitErrorDetail): void {
  // @ts-expect-error framework error details are observations, not mutable recovery state
  detail.stage = 'mount';
  // @ts-expect-error the caught value keeps its identity and cannot be replaced
  detail.error = new Error('replacement');
  // @ts-expect-error the component name cannot be rewritten by a listener
  detail.component = 'Replacement';
}

void toolkitErrorDetailTypeAssertions;

// @ts-expect-error HandlerRegistration is an internal source type.
type RemovedHandlerRegistration = import('@studiometa/js-toolkit-v4').HandlerRegistration;
const removedHandlerRegistrationTypeAssertion = null as unknown as RemovedHandlerRegistration;
void removedHandlerRegistrationTypeAssertion;

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
    expect(Object.keys(root)).toHaveLength(59);
    expect(root.clamp).toBeUndefined();
    expect(root.smoothTo).toBeUndefined();
    for (const removed of [
      'SOURCE',
      'HANDLER_REGISTRATIONS',
      'MOUNTED_EVENT',
      'DESTROYED_EVENT',
      'DOM_UPDATE_EVENT',
      'JS_TOOLKIT_ERROR_EVENT',
    ]) {
      expect(root[removed]).toBeUndefined();
    }
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
    ]) {
      expect(exports).not.toHaveProperty(removed);
    }
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

  it('exports the framework event contract from the root and constant subpath', () => {
    expect(eventsFromSubpath).toBe(EVENTS);
    expect(namedEventsFromSubpath).toBe(EVENTS);
    expectTypeOf<ToolkitErrorStage>().toEqualTypeOf<'load' | 'mount' | 'lifecycle'>();
    expectTypeOf<ToolkitErrorDetail>().toEqualTypeOf<{
      readonly stage: ToolkitErrorStage;
      readonly error: unknown;
      readonly component?: string;
    }>();
  });
});
