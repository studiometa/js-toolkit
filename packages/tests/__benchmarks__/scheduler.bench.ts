import { describe, bench } from 'vitest';
import { domScheduler } from '#private/utils/scheduler.js';
import { clamp01, clamp, map } from '@studiometa/js-toolkit/utils';
import { ScrollService } from '#private/services/ScrollService.js';
import { AbstractService } from '#private/services/AbstractService.js';

describe('scheduler', () => {
  bench('schedule + flush 1 read task', () => {
    domScheduler.read(() => {});
  });

  bench('schedule + flush 10 read tasks', () => {
    for (let i = 0; i < 10; i++) {
      domScheduler.read(() => {});
    }
  });

  bench('schedule + flush 50 read tasks', () => {
    for (let i = 0; i < 50; i++) {
      domScheduler.read(() => {});
    }
  });

  bench('schedule + flush read + write (nested)', () => {
    domScheduler.read(() => {
      domScheduler.write(() => {});
    });
  });

  bench('schedule + flush 10 read + 10 write', () => {
    for (let i = 0; i < 10; i++) {
      domScheduler.read(() => {});
      domScheduler.write(() => {});
    }
  });
});

describe('clamp01 / clamp / map', () => {
  bench('clamp01 (via clamp)', () => {
    clamp01(Math.random() * 2 - 0.5);
  });

  bench('clamp(value, 0, 1) direct', () => {
    clamp(Math.random() * 2 - 0.5, 0, 1);
  });

  bench('inline clamp01 (value < 0 ? 0 : value > 1 ? 1 : value)', () => {
    const value = Math.random() * 2 - 0.5;
    // eslint-disable-next-line no-unused-expressions
    value < 0 ? 0 : value > 1 ? 1 : value;
  });

  bench('map(value, 0, 1, 0, 1)', () => {
    map(Math.random(), 0, 1, 0, 1);
  });
});

describe('ScrollService.updateProps', () => {
  const service = new ScrollService();

  bench('updateProps()', () => {
    service.updateProps();
  });
});

describe('AbstractService.trigger (non-batched)', () => {
  // AbstractService.trigger is used by ScrollService, ResizeService, etc.
  // It iterates callbacks without scheduler batching.

  class TestService extends AbstractService<{ value: number }> {
    props = { value: 42 };
  }

  const service1 = new TestService();
  service1.add('cb-0', () => {});

  const service10 = new TestService();
  for (let i = 0; i < 10; i++) {
    service10.add(`cb-${i}`, () => {});
  }

  const service50 = new TestService();
  for (let i = 0; i < 50; i++) {
    service50.add(`cb-${i}`, () => {});
  }

  bench('trigger (1 callback)', () => {
    service1.trigger({ value: 42 });
  });

  bench('trigger (10 callbacks)', () => {
    service10.trigger({ value: 42 });
  });

  bench('trigger (50 callbacks)', () => {
    service50.trigger({ value: 42 });
  });
});
