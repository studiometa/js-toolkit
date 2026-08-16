// Render a pull-request comment diffing two `bench-report.mjs --json` reports
// (base vs head) and print it to stdout. The workflow upserts the output as a
// sticky comment, matched by the marker below.
//
// Timings are not byte counts. Two things follow, and both are visible in the
// comment itself so nobody reads a number as more precise than it is:
//
//   * A change under `--threshold` percent is not reported as a change. The
//     default is set from a measured same-commit noise floor, not from taste.
//   * A benchmark whose median is under `--floor` milliseconds is never
//     flagged at all. A sub-millisecond benchmark cannot resolve a 25 % move:
//     Chromium clamps `performance.now()` to 100 us, and a Node suite hits
//     its own resolution and scheduling limits at a similar scale.
import { readFileSync } from 'node:fs';

const args = process.argv.slice(2);
const files = [];
let threshold = 25;
let floor = 5;
let rounds = 0;
// The suite's identity, so several suites can each keep their own sticky
// comment in one repository. Nothing here knows whether a suite runs in Node
// or in a browser: it reads the JSON vitest emits either way.
let id = 'bench-diff';
let title = 'Benchmarks';
let unit = 'unit';

const flags = {
  '--threshold': (value) => {
    threshold = Number(value);
  },
  '--floor': (value) => {
    floor = Number(value);
  },
  '--rounds': (value) => {
    rounds = Number(value);
  },
  '--id': (value) => {
    id = value;
  },
  '--title': (value) => {
    title = value;
  },
  '--unit': (value) => {
    unit = value;
  },
};

for (let index = 0; index < args.length; index += 1) {
  const flag = flags[args[index]];
  if (flag) {
    index += 1;
    flag(args[index]);
  } else {
    files.push(args[index]);
  }
}

const MARKER = '<!-- bench-diff:' + id + ' -->';

const [basePath, headPath] = files;
if (!basePath || !headPath) {
  console.error(
    'Usage: node bench-comment.mjs <base.json> <head.json> [--threshold 25] [--floor 5] [--rounds 3] [--id name] [--title text] [--unit component]',
  );
  process.exit(1);
}

// No fallback to `[]` on a read or parse error. An absent base is expressed
// by a report that *is* `[]`, written deliberately by the action, so a file
// that cannot be read or parsed means the measurement broke — and turning
// that into an empty base would report a comparison that never happened. Let
// it throw; a non-zero exit fails the step.
function read(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function index(entries) {
  const map = new Map();
  for (const entry of entries) {
    map.set(entry.group + ' ' + entry.name, entry);
  }
  return map;
}

const base = index(read(basePath));
const head = index(read(headPath));

function ms(value) {
  return value === undefined ? '-' : value.toFixed(value < 10 ? 2 : 1) + ' ms';
}

function per(entry) {
  return entry?.perUnit === undefined ? '-' : entry.perUnit.toFixed(2);
}

const keys = [...new Set([...base.keys(), ...head.keys()])].sort();
const changed = [];
const steady = [];

for (const key of keys) {
  const b = base.get(key);
  const h = head.get(key);
  const entry = h ?? b;
  const delta = b && h ? ((h.median - b.median) / b.median) * 100 : undefined;
  // Below the resolution floor, or too small a move to distinguish from the
  // runner: report the value, but never as a change.
  const resolvable = b && h && Math.max(b.median, h.median) >= floor;
  const significant = resolvable && Math.abs(delta) >= threshold;
  const row =
    '| ' +
    entry.group +
    ' | ' +
    entry.name +
    ' | ' +
    ms(b?.median) +
    ' | ' +
    ms(h?.median) +
    ' | ' +
    per(h ?? b) +
    ' | ' +
    (delta === undefined ? 'new' : (delta > 0 ? '+' : '') + delta.toFixed(1) + '%') +
    ' |';
  if (significant) {
    changed.push({ delta, row });
  } else {
    steady.push(row);
  }
}

changed.sort((a, z) => z.delta - a.delta);

const HEADER = [
  '| Group | Benchmark | Base | Head | us / ' + unit + ' | Change |',
  '| :-- | :-- | --: | --: | --: | --: |',
];

const body = [MARKER, '## ' + title, ''];
body.push(
  'Base and head measured on this runner, alternating' +
    (rounds ? ' over ' + rounds + ' rounds each' : '') +
    '; every value is the median of the round medians. Running both sides on one machine is what removes cross-machine noise — a cached baseline from another runner would put it back.',
  '',
  'A move under **' +
    threshold +
    '%**, or on a benchmark under **' +
    floor +
    ' ms**, is not reported as a change: it is inside the measured noise of a shared runner.',
  '',
);

if (base.size === 0) {
  // The base has no benchmark suite — the expected state on the pull request
  // that adds one. A base that failed to install, prepare, or measure only
  // some of its rounds never reaches here: the action fails the job instead,
  // so an empty base always means absent and never means broken. Show every
  // row, since none of them is hidden noise; they are the whole story.
  body.push(
    'The base commit has no benchmark suite, so every benchmark below is new. A base that failed to build or measure would have failed this job rather than appearing here.',
    '',
    ...HEADER,
    ...steady,
    '',
  );
} else {
  if (changed.length === 0) {
    body.push('No benchmark moved beyond the noise floor.', '');
  } else {
    body.push(...HEADER, ...changed.map((entry) => entry.row), '');
  }
  if (steady.length > 0) {
    body.push(
      '<details><summary>Within noise (' + steady.length + ')</summary>',
      '',
      ...HEADER,
      ...steady,
      '',
      '</details>',
    );
  }
}

console.log(body.join('\n'));
