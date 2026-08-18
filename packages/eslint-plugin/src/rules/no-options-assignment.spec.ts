import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noOptionsAssignment } from './no-options-assignment.ts';

describe('no-options-assignment', () => {
  it('passes and fails correctly', () => {
    tester.run('no-options-assignment', noOptionsAssignment as any, {
      valid: [
        `class Foo extends Base {
           mounted() {
             const { speed } = this.$options;
             return speed;
           }
         }`,
        // Writing the attribute is how you change an option.
        `class Foo extends Base {
           mounted() {
             this.$el.setAttribute('data-option-speed', '5');
           }
         }`,
        // Not the component's own options.
        `class Foo extends Base {
           mounted() {
             other.$options.speed = 5;
           }
         }`,
        // Reading into a nested option value.
        `class Foo extends Base {
           mounted() {
             this.local = this.$options.config.speed;
           }
         }`,
      ],
      invalid: [
        {
          code: `class Foo extends Base {
                   mounted() { this.$options.speed = 5; }
                 }`,
          errors: [{ messageId: 'assignment' }],
        },
        {
          code: `class Foo extends Base {
                   mounted() { this.$options.nested.speed = 5; }
                 }`,
          errors: [{ messageId: 'assignment' }],
        },
        {
          code: `class Foo extends Base {
                   mounted() { Object.assign(this.$options, { speed: 5 }); }
                 }`,
          errors: [{ messageId: 'objectAssign' }],
        },
      ],
    });
  });
});
