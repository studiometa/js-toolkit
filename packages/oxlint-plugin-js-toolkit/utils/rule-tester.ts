import { RuleTester } from 'eslint';

export { RuleTester };

export const tester = new RuleTester({
  languageOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
});
