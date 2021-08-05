import { jest } from '@jest/globals';
import stylefire from 'stylefire';

/**
 * Import stylefire in Jest tests with ESM does not work, we need to used the `default` property:
 *
 * ```js
 * import styler from 'stylefire';
 * styler.default(element);
 * ```
 *
 * We mock import for Jest to return the `default` property by default.
 */
jest.mock('stylefire', () => stylefire.default);
