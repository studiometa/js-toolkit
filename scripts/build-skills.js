/**
 * Build the agent skill shipped in a package.
 *
 * Each published package holds a hand-written `skills/<name>/SKILL.md`. This
 * script validates it and generates its `references/` folder from the docs, so
 * the references always match the published version. The `skills` CLI links
 * the skill from `node_modules` with `npx skills experimental_sync`.
 *
 * Run it from a package directory: `node ../../scripts/build-skills.js`.
 *
 * With `--well-known <directory>`, it builds every skill and publishes them in
 * `<directory>/.well-known/agent-skills/`: one archive per skill and the
 * `index.json` of the Agent Skills Discovery RFC, so
 * `npx skills add https://js-toolkit-v4.studiometa.dev` installs them.
 */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { globSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, posix, relative, resolve } from 'node:path';

const repositoryRoot = resolve(dirname(new URL(import.meta.url).pathname), '..');
const docsRoot = resolve(repositoryRoot, 'packages/js-toolkit/docs');
const docsUrl = 'https://js-toolkit-v4.studiometa.dev';
const discoverySchema = 'https://schemas.agentskills.io/discovery/0.2.0/schema.json';

/**
 * The skill of each package, and the files its references are built from.
 *
 * @type {Record<string, { directory: string, name: string, root: string, pages: string[] }>}
 */
const targets = {
  '@studiometa/js-toolkit': {
    directory: 'packages/js-toolkit',
    name: 'studiometa-js-toolkit',
    root: docsRoot,
    pages: ['guide/**/*.md', 'api/**/*.md', 'utils/**/*.md'],
  },
  '@studiometa/eslint-plugin-js-toolkit': {
    directory: 'packages/eslint-plugin',
    name: 'studiometa-eslint-plugin-js-toolkit',
    root: resolve(repositoryRoot, 'packages/eslint-plugin'),
    pages: ['README.md'],
  },
};

/**
 * Get the site path of a docs page, without extension and trailing slash.
 *
 * @param   {string} path
 * @returns {string}
 */
function toSitePath(path) {
  return `/${path}`
    .replace(/\.(md|html)$/, '')
    .replace(/\/index$/, '')
    .replace(/\/$/, '');
}

/**
 * Point a docs link to a page of the skill, or to the docs website.
 *
 * @param   {string} target
 * @param   {string} page The page that holds the link, relative to the root.
 * @param   {Map<string, string>} pages The output file of each site path of the skill.
 * @returns {string}
 */
function rewriteLink(target, page, pages) {
  if (/^([a-z]+:|#)/.test(target)) {
    return target;
  }

  const [path, hash] = target.split('#');
  const sitePath = toSitePath(posix.resolve(posix.dirname(`/${page}`), path).slice(1));
  const suffix = hash ? `#${hash}` : '';

  if (pages.has(sitePath)) {
    const output = pages.get(sitePath);
    return posix.relative(posix.dirname(page), output) + suffix;
  }

  const isFolder = path === '' || /(\/|\/index(\.(md|html))?)$/.test(path);
  return `${docsUrl}${sitePath}${isFolder ? '/' : ''}${suffix}`;
}

/**
 * Turn a VitePress page into plain Markdown: drop the frontmatter, the table of
 * contents and the twoslash markers, flatten the containers and rewrite the
 * links to the other references or to the docs website.
 *
 * @param   {string} source
 * @param   {string} page
 * @param   {Map<string, string>} pages
 * @returns {string}
 */
function toReference(source, page, pages) {
  const output = [];
  let inFence = false;

  for (const line of source.replace(/^---\n[\s\S]*?\n---\n/, '').split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      output.push(line.replace(/\s+twoslash\b/, ''));
      continue;
    }

    if (inFence) {
      if (!/^\s*\/\/\s*(@twoslash-cache:|---cut[a-z-]*---|\^[?|!])/.test(line)) {
        output.push(line);
      }
      continue;
    }

    if (/^\s*\[\[toc\]\]\s*$/.test(line) || /^\s*:::\s*$/.test(line)) {
      continue;
    }

    const container = line.match(/^\s*:::\s*(tip|info|warning|danger|details)\s*(.*)$/);
    if (container) {
      const [, type, title] = container;
      output.push(`**${title || type[0].toUpperCase() + type.slice(1)}**`, '');
      continue;
    }

    output.push(
      line.replace(/\]\(([^)\s]+)\)/g, (_, target) => `](${rewriteLink(target, page, pages)})`),
    );
  }

  const markdown = `${output
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()}\n`;
  const residue = markdown.match(/@twoslash-cache|---cut---|\[\[toc\]\]|^\s*:::/m);

  if (residue) {
    throw new Error(`${page}: "${residue[0].trim()}" is left in the generated reference.`);
  }

  return markdown;
}

/**
 * Check the `name` and `description` fields of a `SKILL.md` file and return the
 * description.
 *
 * @param   {string} file
 * @param   {string} name
 * @param   {string} content
 * @returns {string}
 */
function validateSkill(file, name, content) {
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---\n/)?.[1];
  if (!frontmatter) {
    throw new Error(`${file}: missing frontmatter.`);
  }

  const field = (key) => frontmatter.match(new RegExp(`^${key}: (.+)$`, 'm'))?.[1].trim();

  if (field('name') !== name) {
    throw new Error(`${file}: the "name" field must be "${name}", the name of its folder.`);
  }

  const description = field('description') ?? '';
  if (description.length === 0 || description.length > 1024) {
    throw new Error(`${file}: the "description" field must have 1 to 1024 characters.`);
  }

  return description;
}

/**
 * Validate the skill of a package and generate its references.
 *
 * @param   {string} packageRoot
 * @returns {Promise<{ name: string, description: string, directory: string }>}
 */
async function buildSkill(packageRoot) {
  const pkg = JSON.parse(await readFile(join(packageRoot, 'package.json'), 'utf8'));
  const target = targets[pkg.name];

  if (!target) {
    throw new Error(`No skill is configured for the "${pkg.name}" package.`);
  }

  if (!pkg.files?.includes('skills')) {
    throw new Error(`${pkg.name}: the "files" field must include "skills".`);
  }

  const skillRoot = join(packageRoot, 'skills', target.name);
  const skillFile = join(skillRoot, 'SKILL.md');
  const description = validateSkill(
    relative(repositoryRoot, skillFile),
    target.name,
    await readFile(skillFile, 'utf8'),
  );

  const files = globSync(target.pages, { cwd: target.root }).sort();
  const pages = new Map(files.map((file) => [toSitePath(file), file]));
  const referencesRoot = join(skillRoot, 'references');
  await rm(referencesRoot, { recursive: true, force: true });

  for (const file of files) {
    const output = join(referencesRoot, file);
    await mkdir(dirname(output), { recursive: true });
    await writeFile(
      output,
      toReference(await readFile(join(target.root, file), 'utf8'), file, pages),
    );
  }

  console.log(
    `Built the ${target.name} skill: ${files.length} reference pages in ${relative(packageRoot, referencesRoot)}.`,
  );

  return { name: target.name, description, directory: skillRoot };
}

/**
 * Build every skill and publish it as a `.tar.gz` archive with `SKILL.md` at
 * its root, listed in the `index.json` of the Agent Skills Discovery RFC.
 *
 * @param {string} outputDirectory
 */
async function publishSkills(outputDirectory) {
  const wellKnownDirectory = join(outputDirectory, '.well-known/agent-skills');
  await rm(wellKnownDirectory, { recursive: true, force: true });
  await mkdir(wellKnownDirectory, { recursive: true });

  const skills = [];
  for (const target of Object.values(targets)) {
    const skill = await buildSkill(join(repositoryRoot, target.directory));
    const archive = join(wellKnownDirectory, `${skill.name}.tar.gz`);
    // The ustar format and the bare paths are what the `skills` CLI reads: it
    // refuses `./` path segments and skips the GNU long name entries.
    execFileSync('tar', [
      '--format=ustar',
      '-czf',
      archive,
      '-C',
      skill.directory,
      'SKILL.md',
      'references',
    ]);
    const digest = createHash('sha256')
      .update(await readFile(archive))
      .digest('hex');
    skills.push({
      name: skill.name,
      type: 'archive',
      description: skill.description,
      url: `${skill.name}.tar.gz`,
      digest: `sha256:${digest}`,
    });
  }

  await writeFile(
    join(wellKnownDirectory, 'index.json'),
    `${JSON.stringify({ $schema: discoverySchema, skills }, null, 2)}\n`,
  );
  console.log(
    `Published ${skills.length} skills in ${relative(process.cwd(), wellKnownDirectory)}.`,
  );
}

const wellKnownFlag = process.argv.indexOf('--well-known');

if (wellKnownFlag === -1) {
  await buildSkill(process.cwd());
} else {
  const outputDirectory = process.argv[wellKnownFlag + 1];
  if (!outputDirectory) {
    throw new Error('The --well-known flag needs an output directory.');
  }
  await publishSkills(resolve(outputDirectory));
}
