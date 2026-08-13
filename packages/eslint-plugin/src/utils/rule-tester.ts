import { RuleTester } from 'eslint';
import { eslintCompatPlugin } from '@oxlint/plugins';

export { RuleTester };

const _tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});

export const tester = {
  run(
    name: string,
    rule: Parameters<typeof eslintCompatPlugin>[0]['rules'][string],
    tests: Parameters<InstanceType<typeof RuleTester>['run']>[2],
  ) {
    const wrapped = eslintCompatPlugin({ rules: { [name]: rule } });
    _tester.run(name, wrapped.rules[name] as any, tests);
  },
};
