const path = require('path');
const glob = require('fast-glob');
const esbuild = require('esbuild');

const entryPoints = glob.sync(['packages/js-toolkit/**/*.js', '!**/node_modules/**'], {
  cwd: path.resolve(__dirname, '..'),
});

const outdir = path.resolve(__dirname, '../dist');

const defaultOptions = {
  entryPoints,
  write: true,
  outdir,
  target: 'es2022',
};

/**
 * Build with esbuild.
 *
 * @param   {require('esbuild').BuildOptions} opts
 * @returns {Promise<void>}
 */
async function build(opts) {
  console.log(`Building ${opts.format}...`);
  const { errors, warnings } = await esbuild.build({
    ...defaultOptions,
    ...opts,
  });

  errors.forEach(console.error);
  warnings.forEach(console.warn);
  console.log(`Done building ${opts.format}!`);
}

build({
  format: 'esm',
});

build({
  format: 'cjs',
  bundle: true,
  outExtension: { '.js': '.cjs' },
  footer: {
    // Fix `export default {}` assigned to `module.exports.default`
    js: 'if (module.exports.default) module.exports = module.exports.default;'
  },
  plugins: [
    // @see https://github.com/evanw/esbuild/issues/622#issuecomment-769462611
    {
      name: 'change-extension-to-cjs',
      setup(builder) {
        // eslint-disable-next-line consistent-return
        builder.onResolve({ filter: /.*/ }, (args) => {
          if (args.importer) {
            return {
              path: args.path.replace(/\.js$/, '.cjs'),
              external: true,
            };
          }
        });
      },
    },
  ],
});
