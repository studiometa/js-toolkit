import { describe, expect, it } from 'vitest';

interface FixtureMessage {
  source: 'v4-shared-runtime-fixture';
  token: string;
  ok: boolean;
  error?: { message: string; stack?: string };
  result?: {
    protocol: { sameSource: boolean; sourceReadByA: boolean; decoratorCalls: number };
    branding: {
      direct: Record<string, boolean>;
      subclasses: Record<string, boolean>;
      wrongClasses: Record<string, boolean>;
      importThunks: Record<string, boolean>;
    };
    scheduler: { same: boolean; frameRequests: number };
    registry: {
      observers: number;
      parentMounts: number;
      childMounts: number;
      lazyMounts: number;
      parentDestroys: number;
      childDestroys: number;
      lazyDestroys: number;
      parentFromA: boolean;
      childFromB: boolean;
      lazyFromB: boolean;
      viewport: {
        direct: {
          observers: number;
          rootMargin: string | null;
          mounts: number;
          destroys: number;
          fromB: boolean;
        };
        lazy: {
          observers: number;
          rootMargin: string | null;
          imports: number;
          mounts: number;
          fromA: boolean;
        };
      };
    };
    breakpoints: {
      sameService: boolean;
      readByB: Record<string, string>;
      activeReadByB: string;
      activeReadByA: string;
      responsive: {
        mountsBeforeReplacement: number;
        mountsAfterReplacement: number;
        reconciliations: number;
        destroys: number;
      };
    };
    services: {
      identity: Record<string, boolean>;
      distinction: Record<string, boolean>;
      resize: {
        created: number;
        activeWithBoth: number;
        activeAfterOne: number;
        activeAfterBoth: number;
      };
      intersection: {
        created: number;
        activeWithBoth: number;
        activeAfterOne: number;
        activeAfterBoth: number;
      };
    };
    context: {
      sameRoot: boolean;
      rootCreates: number;
      pendingReplay: boolean;
      mountListeners: number;
    };
  };
}

function runFixture(): Promise<FixtureMessage> {
  const token = crypto.randomUUID();
  const iframe = document.createElement('iframe');
  iframe.hidden = true;
  iframe.src = `/test/runtime-fixture.html?token=${token}`;

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('The duplicate-runtime fixture timed out.'));
    }, 10_000);
    const onMessage = (event: MessageEvent<FixtureMessage>) => {
      if (
        event.origin !== location.origin ||
        event.data?.source !== 'v4-shared-runtime-fixture' ||
        event.data.token !== token
      ) {
        return;
      }
      cleanup();
      resolve(event.data);
    };
    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener('message', onMessage);
      iframe.remove();
    };

    window.addEventListener('message', onMessage);
    document.body.append(iframe);
  });
}

describe('duplicated v4 bundles', () => {
  it('coordinate through one lazy runtime and release reference-counted work', async () => {
    const message = await runFixture();
    if (!message.ok) {
      throw new Error(message.error?.stack ?? message.error?.message ?? 'Fixture failed.');
    }
    const result = message.result;
    expect(result).toBeDefined();
    if (!result) return;

    expect(result.protocol).toEqual({
      sameSource: true,
      sourceReadByA: true,
      decoratorCalls: 1,
    });
    expect(result.branding).toEqual({
      direct: { aFromA: true, bFromA: true, aFromB: true, bFromB: true },
      subclasses: { aFromA: true, bFromA: true, aFromB: true, bFromB: true },
      wrongClasses: { fromA: false, fromB: false },
      importThunks: { aFromA: false, bFromA: false, aFromB: false, bFromB: false },
    });
    expect(result.scheduler).toEqual({ same: true, frameRequests: 1 });
    expect(result.registry).toEqual({
      observers: 1,
      parentMounts: 1,
      childMounts: 1,
      lazyMounts: 1,
      parentDestroys: 1,
      childDestroys: 1,
      lazyDestroys: 1,
      parentFromA: true,
      childFromB: true,
      lazyFromB: true,
      viewport: {
        direct: {
          observers: 1,
          rootMargin: '123px 45px',
          mounts: 1,
          destroys: 1,
          fromB: true,
        },
        lazy: {
          observers: 1,
          rootMargin: '321px 0px',
          imports: 1,
          mounts: 1,
          fromA: true,
        },
      },
    });
    expect(result.breakpoints).toEqual({
      sameService: true,
      readByB: { small: '0rem', large: '9999rem' },
      activeReadByB: 'small',
      activeReadByA: 'large',
      responsive: {
        mountsBeforeReplacement: 0,
        mountsAfterReplacement: 1,
        reconciliations: 1,
        destroys: 1,
      },
    });
    expect(result.services.identity).toEqual({
      breakpoint: true,
      raf: true,
      scroll: true,
      resize: true,
      pointer: true,
      drag: true,
      media: true,
      inView: true,
      scrollProgress: true,
    });
    expect(result.services.distinction).toEqual({
      target: true,
      drag: true,
      media: true,
      inView: true,
      scrollProgress: true,
    });
    expect(result.services.resize).toEqual({
      created: 1,
      activeWithBoth: 1,
      activeAfterOne: 1,
      activeAfterBoth: 0,
    });
    expect(result.services.intersection).toEqual({
      created: 1,
      activeWithBoth: 1,
      activeAfterOne: 1,
      activeAfterBoth: 0,
    });
    expect(result.context).toEqual({
      sameRoot: true,
      rootCreates: 1,
      pendingReplay: true,
      mountListeners: 1,
    });
  });
});
