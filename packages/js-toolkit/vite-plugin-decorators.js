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
    // Only run this transform on script files that contain a decorator. The
    // `code` filter alone is not enough: `index.html` holds an `@` of its own,
    // and SWC parses whatever it is handed as TypeScript.
    { transform: { id: /\.[cm]?[jt]sx?$/, code: '@' } },
  );
}
