import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { promisify } from 'node:util';
import { chromium } from 'playwright';
import { createServer as createViteServer } from 'vite';

const execute = promisify(execFile);
const packageRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const packageName = '@studiometa/js-toolkit-v4';
const distArtifact = /^dist\/(?:[^/]+\/)*[^/]+\.(?:js|js\.map|d\.ts)$/;

async function run(command, args, options = {}) {
  try {
    const { stdout, stderr } = await execute(command, args, {
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      ...options,
    });
    if (stderr) {
      process.stderr.write(stderr);
    }
    return stdout;
  } catch (error) {
    if (error.stdout) {
      process.stdout.write(error.stdout);
    }
    if (error.stderr) {
      process.stderr.write(error.stderr);
    }
    throw error;
  }
}

function assertPackageContent(metadata) {
  const files = metadata.files.map(({ path }) => path.replaceAll('\\', '/')).sort();
  const fileSet = new Set(files);
  const topLevel = [...new Set(files.map((path) => path.split('/')[0]))].sort();

  assert.deepEqual(
    topLevel,
    ['dist', 'package.json'],
    `Unexpected packed top-level content:\n${topLevel.join('\n')}`,
  );

  const unexpected = files.filter((path) => path !== 'package.json' && !distArtifact.test(path));
  assert.deepEqual(
    unexpected,
    [],
    `Only package.json and built JavaScript, declarations and source maps are allowed:\n${unexpected.join('\n')}`,
  );

  const forbiddenTests = files.filter(
    (path) =>
      path.startsWith('dist/test-utils.') || /\.(?:spec|bench)\.(?:js|js\.map|d\.ts)$/.test(path),
  );
  assert.deepEqual(
    forbiddenTests,
    [],
    `Test utilities, specs and benchmarks must not be packed:\n${forbiddenTests.join('\n')}`,
  );

  assert(fileSet.has('dist/index.js'), 'dist/index.js is missing from the package.');
  assert(fileSet.has('dist/index.d.ts'), 'dist/index.d.ts is missing from the package.');

  return fileSet;
}

function assertConsumerExports(packageJson, files) {
  for (const [subpath, conditions] of Object.entries(packageJson.exports)) {
    if (typeof conditions === 'string') {
      assert(
        files.has(conditions.replace(/^\.\//, '')),
        `${subpath} points to missing packed file ${conditions}.`,
      );
      continue;
    }

    for (const condition of ['types', 'import']) {
      const target = conditions[condition];
      assert.equal(typeof target, 'string', `${subpath} has no ${condition} export.`);
      assert(
        files.has(target.replace(/^\.\//, '')),
        `${subpath} ${condition} points to missing packed file ${target}.`,
      );
    }
  }
}

async function installPackage(tarball, consumerRoot) {
  await mkdir(consumerRoot, { recursive: true });
  await writeFile(
    join(consumerRoot, 'package.json'),
    `${JSON.stringify({ private: true, type: 'module' }, null, 2)}\n`,
  );
  await run(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      '--no-package-lock',
      '--no-progress',
      tarball,
    ],
    { cwd: consumerRoot },
  );
}

async function checkNodeConsumer(consumerRoot) {
  const fixture = join(consumerRoot, 'package-node-consumer.js');
  await copyFile(resolve(packageRoot, 'test/package-node-consumer.js'), fixture);
  const output = await run(process.execPath, [fixture], { cwd: consumerRoot });
  process.stdout.write(output);
}

async function checkBrowserConsumer(consumerRoot) {
  await copyFile(
    resolve(packageRoot, 'test/package-browser-consumer.js'),
    join(consumerRoot, 'package-browser-consumer.js'),
  );
  await writeFile(
    join(consumerRoot, 'index.html'),
    `<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8"><title>v4 packed consumer</title></head>
  <body>
    <script>globalThis.__V4_PACKED_CONSUMER__ = { status: 'loading' };</script>
    <script type="module" src="/package-browser-consumer.js"></script>
  </body>
</html>
`,
  );

  const server = await createViteServer({
    root: consumerRoot,
    configFile: false,
    logLevel: 'error',
    server: { host: '127.0.0.1' },
  });
  let browser;

  try {
    await server.listen();
    const address = server.httpServer.address();
    assert(address && typeof address === 'object', 'Vite did not open a TCP server.');

    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    const pageErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error));

    await page.goto(`http://127.0.0.1:${address.port}`, { waitUntil: 'load' });
    assert.deepEqual(
      pageErrors,
      [],
      `The packed browser consumer raised an error:\n${pageErrors.join('\n')}`,
    );
    await page.waitForFunction(
      () => globalThis.__V4_PACKED_CONSUMER__?.status !== 'loading',
      undefined,
      { timeout: 10_000 },
    );
    const result = await page.evaluate(() => globalThis.__V4_PACKED_CONSUMER__);

    assert.deepEqual(result, {
      status: 'passed',
      mountedHookCalls: 1,
      mountedEvent: {
        observed: true,
        type: 'js-toolkit:component:mounted',
        sameInstance: true,
        bubbles: true,
        cancelable: false,
      },
      emitted: {
        returnedObservedEvent: true,
        customEvent: true,
        bubbles: true,
        cancelable: true,
        detail: { packed: true },
      },
      serviceSubpath: true,
    });
    console.log('Browser packed consumer: Base lifecycle, events and service subpath passed.');
  } finally {
    await browser?.close();
    await server.close();
  }
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(1)} kB`;
}

const temporaryRoot = await mkdtemp(join(tmpdir(), 'js-toolkit-v4-package-'));
try {
  const packRoot = join(temporaryRoot, 'pack');
  const consumerRoot = join(temporaryRoot, 'consumer');
  await mkdir(packRoot);

  const packOutput = await run('npm', ['pack', '--json', '--pack-destination', packRoot], {
    cwd: packageRoot,
  });
  const [metadata] = JSON.parse(packOutput);
  assert(metadata, 'npm pack returned no package metadata.');

  const packedFiles = assertPackageContent(metadata);
  const tarball = join(packRoot, metadata.filename);
  await installPackage(tarball, consumerRoot);

  const installedPackageJson = JSON.parse(
    await readFile(
      join(consumerRoot, 'node_modules', ...packageName.split('/'), 'package.json'),
      'utf8',
    ),
  );
  assertConsumerExports(installedPackageJson, packedFiles);

  console.log(
    `Packed content: ${metadata.entryCount} files, ${formatBytes(metadata.size)} packed, ${formatBytes(metadata.unpackedSize)} unpacked.`,
  );
  await checkNodeConsumer(consumerRoot);
  await checkBrowserConsumer(consumerRoot);
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
