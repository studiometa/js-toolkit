import swc from '@rollup/plugin-swc';
import { withFilter } from 'vite';

/**
 * Stage-3 decorators are not lowered by Oxc (Vite's TypeScript transformer)
 * and no engine ships them yet, so they are compiled with SWC first. This is
 * the approach documented in the Vite 8 migration guide.
 *
 * @see https://vite.dev/guide/migration
 */
export function decorators() {
  return withFilter(
    swc({
      swc: {
        jsc: {
          parser: { syntax: 'typescript', decorators: true, decoratorsBeforeExport: true },
          transform: { decoratorVersion: '2023-11' },
        },
      },
    }),
    // Only run this transform on files that contain a decorator.
    { transform: { code: '@' } },
  );
}
