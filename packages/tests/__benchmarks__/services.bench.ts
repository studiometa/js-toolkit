import { describe, bench } from 'vitest';
import { RafService, useRaf } from '#private/services/RafService.js';
import { useScroll } from '#private/services/ScrollService.js';
import { domScheduler } from '#private/utils/scheduler.js';

describe('services', () => {
  describe('RafService', () => {
    const raf = useRaf();

    bench('add + remove callback', () => {
      const key = 'bench-raf';
      raf.add(key, () => {});
      raf.remove(key);
    });

    bench('props() access', () => {
      raf.props();
    });

    // Simulate trigger overhead with N callbacks
    const rafWith1 = useRaf();
    rafWith1.add('cb-1', () => {});

    bench('has() check', () => {
      raf.has('bench-raf');
    });
  });

  describe('ScrollService', () => {
    const scroll = useScroll();

    bench('props() access', () => {
      scroll.props();
    });

    bench('add + remove callback', () => {
      const key = 'bench-scroll';
      scroll.add(key, () => {});
      scroll.remove(key);
    });

    bench('has() check', () => {
      scroll.has('bench-scroll');
    });
  });

  describe('domScheduler', () => {
    bench('schedule read (closure creation + push + microtask)', () => {
      domScheduler.read(() => {});
    });

    bench('schedule write (closure creation + push + microtask)', () => {
      domScheduler.write(() => {});
    });

    bench('schedule read + write (nested pattern)', () => {
      domScheduler.read(() => {
        domScheduler.write(() => {});
      });
    });
  });

  describe('RafService.trigger()', () => {
    function createRafServiceWithCallbacks(count: number): RafService {
      const service = new RafService();
      for (let i = 0; i < count; i++) {
        service.add(`cb-${i}`, () => {});
      }
      return service;
    }

    function createRafServiceWithRenderCallbacks(count: number): RafService {
      const service = new RafService();
      for (let i = 0; i < count; i++) {
        service.add(`cb-${i}`, () => () => {});
      }
      return service;
    }

    const props = { time: 1000, delta: 16 };

    // Read-only callbacks (no write phase)
    const service1 = createRafServiceWithCallbacks(1);
    const service10 = createRafServiceWithCallbacks(10);
    const service50 = createRafServiceWithCallbacks(50);

    bench('trigger (1 callback, read only)', () => {
      service1.trigger(props);
    });

    bench('trigger (10 callbacks, read only)', () => {
      service10.trigger(props);
    });

    bench('trigger (50 callbacks, read only)', () => {
      service50.trigger(props);
    });

    // Callbacks that return a render function (read + write phase)
    const serviceRW1 = createRafServiceWithRenderCallbacks(1);
    const serviceRW10 = createRafServiceWithRenderCallbacks(10);
    const serviceRW50 = createRafServiceWithRenderCallbacks(50);

    bench('trigger (1 callback, read + write)', () => {
      serviceRW1.trigger(props);
    });

    bench('trigger (10 callbacks, read + write)', () => {
      serviceRW10.trigger(props);
    });

    bench('trigger (50 callbacks, read + write)', () => {
      serviceRW50.trigger(props);
    });
  });
});
