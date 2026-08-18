import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { preferInstanceScheduler } from './prefer-instance-scheduler.ts';

describe('prefer-instance-scheduler', () => {
  it('passes and fails correctly', () => {
    tester.run('prefer-instance-scheduler', preferInstanceScheduler as any, {
      valid: [
        `class Foo extends Base {
           mounted() {
             this.$read(() => this.$el.offsetWidth);
             this.$write(() => { this.$el.style.width = '1px'; });
           }
         }`,
        // A service owns no instance, so it has no instance lane to use.
        `function useThing() {
           return defaultScheduler.read(() => document.body.offsetWidth);
         }`,
        // The tick lane has no instance-scoped equivalent.
        `class Foo extends Base {
           static config = { name: 'Foo' };
           mounted() {
             return defaultScheduler.tick(() => {});
           }
         }`,
        // A class which merely extends something has no `this.$read()` to be
        // pointed at. Advising one would be wrong, not just noisy.
        `class Store extends Error {
           refresh() {
             defaultScheduler.read(() => document.body.offsetWidth);
           }
         }`,
      ],
      invalid: [
        {
          code: `class Foo extends Base {
                   mounted() { defaultScheduler.read(() => this.$el.offsetWidth); }
                 }`,
          errors: [{ messageId: 'preferInstance' }],
        },
        {
          code: `class Foo extends Base {
                   static config = { name: 'Foo' };
                   ticked() { defaultScheduler.write(() => {}); }
                 }`,
          errors: [{ messageId: 'preferInstance' }],
        },
      ],
    });
  });
});
