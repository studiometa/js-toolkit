import { describe, it } from 'vitest';
import { tester } from '../utils/rule-tester.ts';
import { noCreateApp } from './no-create-app.ts';

describe('no-create-app', () => {
  it('passes and fails correctly', () => {
    tester.run('no-create-app', noCreateApp as any, {
      valid: [
        `import { registerComponent } from '@studiometa/js-toolkit';
         registerComponent(Slider);`,
      ],
      invalid: [
        {
          code: `import { createApp } from '@studiometa/js-toolkit';
                 createApp(App)();`,
          errors: [{ messageId: 'useRegister' }],
        },
      ],
    });
  });
});
