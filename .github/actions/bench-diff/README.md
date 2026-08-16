# bench-diff

Run a [vitest](https://vitest.dev) benchmark suite for the base and the head commit **on one runner**, alternating between them, and upsert a sticky pull-request comment with the difference.

It is the timing counterpart of [`weareikko/export-size`](https://github.com/weareikko/export-size): same shape — measure head, check the base sha out into a subdirectory of the same runner, measure it with the same action-provided script, diff, comment — with the changes a stopwatch needs that a byte counter does not.

## Why it works this way

**Both sides on one runner.** Cross-machine timing noise is the reason services like CodSpeed exist. Measuring the base on the runner that measures the head removes it, with no account, no token and nothing to store. A cached baseline from an earlier `main` run would put that noise straight back, and would be un-interleavable by construction.

**Alternating, not sequential.** Export-size measures head then base. For byte counts that is fine. For timings it puts every bit of thermal drift and every noisy neighbour on one side of the comparison. This action alternates the sides within a round and flips the order between rounds, so drift lands on both.

**Median, never mean.** A benchmark's value for a round is tinybench's median; its value for the report is the median across rounds. One GC pause should not become the headline.

**A measured threshold, and a resolution floor.** Run one commit against itself, read the spread, and set `threshold` from it. Benchmarks whose median falls under `floor` milliseconds are reported but never flagged: Chromium clamps `performance.now()` to 100 µs, so a 1 ms benchmark cannot resolve a percentage.

**It comments; it does not block.** A timing threshold that fails a build on a shared runner is a threshold that gets deleted. Hard gates belong in the test suite, as assertions that do not depend on how fast the runner is.

**It knows nothing about environments.** It takes a directory, a command and an output path, and reads the JSON vitest emits — the same schema whether the benchmark bodies run in Node, in happy-dom or in a real browser over CDP. A second suite is another step with another `id`, not a branch inside the action. Keep it that way.

## Usage

A browser suite, which needs a browser downloaded first:

```yaml
- uses: actions/checkout@v4
- uses: ./.github/actions/bench-diff
  with:
    id: v4-mount
    title: v4 mount benchmarks
    unit: component
    working-directory: packages/v4
    prepare: npx playwright install --with-deps chromium
    bench: npm exec vitest bench -- --config vitest.bench.config.js --run --outputJson "$BENCH_JSON"
    rounds: '3'
    threshold: '25'
    floor: '5'
```

A Node suite, which needs nothing extra — the only difference is the command:

```yaml
- uses: ./.github/actions/bench-diff
  with:
    id: v3
    title: v3 benchmarks
    working-directory: packages/js-toolkit
    bench: npm exec vitest bench -- --config vitest.bench.config.ts --run --outputJson "$BENCH_JSON"
```

`bench` must write a `vitest bench --outputJson` file to `$BENCH_JSON`. Anything the suite needs from the environment can be set as `env:` on the step — composite `run` steps inherit it — or written as a prefix assignment on the command itself, which is unambiguous.

`id` namespaces the sticky comment and the temporary files, so several suites can each keep their own comment on one pull request. Two suites in the _same job_ would share the base checkout; prefer a job or a workflow each, which also lets each one carry its own `paths:` filter.

The job needs `pull-requests: write` to comment.

### Inputs

| input               | default                       | meaning                                                    |
| ------------------- | ----------------------------- | ---------------------------------------------------------- |
| `id`                | `bench-diff`                  | Suite identifier; namespaces the comment and temp files.   |
| `title`             | `Benchmarks`                  | Heading of the sticky comment.                             |
| `unit`              | `unit`                        | What a group's count counts, for the per-unit column.      |
| `bench`             | —                             | Command writing a bench JSON to `$BENCH_JSON`.             |
| `working-directory` | `.`                           | Where to run it, inside each checkout.                     |
| `install`           | `npm ci --no-audit --no-fund` | Dependency install, at each checkout root.                 |
| `prepare`           | —                             | Anything else each checkout needs before benchmarking.     |
| `rounds`            | `3`                           | Sampling rounds per side.                                  |
| `threshold`         | `25`                          | Percent change reported as a change.                       |
| `floor`             | `5`                           | Benchmarks under this many ms are reported, never flagged. |
| `comment`           | `true`                        | Upsert the sticky comment.                                 |

## Reading a group as a per-unit cost

`bench-report.mjs` divides a benchmark's median by the first integer in its group title. A group named `mount 5000 components, one insertion` therefore reports microseconds per component alongside milliseconds per operation, which is what makes a non-linear curve legible as a number rather than as a shape. Name the unit with `unit:`. A group whose title carries no number simply has no per-unit figure, and the column reads `-`.

## Locally

```sh
node .github/actions/bench-diff/bench-report.mjs <vitest-bench.json>          # one run, as a table
node .github/actions/bench-diff/bench-report.mjs a.json b.json --json out.json # several rounds, aggregated
node .github/actions/bench-diff/bench-comment.mjs base.json head.json          # the comment body
```
