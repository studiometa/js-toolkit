import { dirname, resolve } from 'node:path';
import { build } from 'tsdown';

const packageRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const names = ['SOURCE', 'MOUNTED_EVENT', 'DESTROYED_EVENT', 'JS_TOOLKIT_ERROR_EVENT'];

for (const name of names) {
  const bundles = await build({
    entry: [resolve(packageRoot, `dist/subpaths/${name}.js`)],
    format: 'esm',
    platform: 'browser',
    target: 'esnext',
    config: false,
    dts: false,
    sourcemap: false,
    clean: false,
    write: false,
    minify: true,
    logLevel: 'silent',
  });

  try {
    const chunks = bundles
      .flatMap((bundle) => bundle.chunks)
      .filter((chunk) => chunk.type === 'chunk');
    if (chunks.length !== 1) {
      throw new Error(`${name} produced ${chunks.length} JavaScript chunks instead of one.`);
    }

    const retained = Object.keys(chunks[0].modules);
    const forbidden = retained.filter(
      (module) => module.endsWith('/dist/Base.js') || module.endsWith('/dist/component-brand.js'),
    );
    if (forbidden.length > 0) {
      throw new Error(
        `${name} retained Base branding or implementation modules:\n${forbidden.join('\n')}`,
      );
    }
    if (chunks[0].code.includes('@studiometa/js-toolkit-v4/base')) {
      throw new Error(`${name} retained the Base brand.`);
    }

    console.log(`${name}: Base implementation removed (${retained.length} modules retained).`);
  } finally {
    await Promise.all(bundles.map((bundle) => bundle[Symbol.asyncDispose]()));
  }
}
