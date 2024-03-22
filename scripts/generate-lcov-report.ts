import { $ } from 'bun';

const result = await $`npm run test -- -- --coverage`.quiet();

// TN: Test Name
// SF: Source File Name
// FN: Function Name
// FNDA: Function Data (hit count, function name)
// FNF: Function Found
// FNH: Function Hit
// DA: Line Data (line number, hit count)
// LF: Lines Found
// LH: Lines Hit
// end_of_record: End of the record for a file

const coverage = result.stderr
  .toString()
  .split('\n')
  .filter((line) => line.trim().startsWith('../js-toolkit/'))
  .map((line) => {
    const [file, percentFns, percentLines, uncoveredLinesData] = line.split('|');

    const uncoveredLines = uncoveredLinesData
      .split(',')
      .map((data) => data.trim())
      .filter(Boolean);

    const DA = [];
    for (const uncoveredLine of uncoveredLines) {
      const [begin, end] = uncoveredLine.split('-').map(Number);
      DA.push(begin);
      if (!Number.isNaN(end)) {
        let start = begin + 1;
        while (start < end) {
          DA.push(start);
          start += 1;
        }
      }
    }

    return `
TN:
SF: ${file.trim()}
FNF: 100
FNH: ${Number(percentFns.trim())}
LF: 100
LH: ${Number(percentLines.trim())}
${DA.length ? DA.map((da) => `DA: ${da}`).join('\n') : ''}
end_of_record
    `;
  });

await $`echo ${coverage.join('\n')} > lcov.info`;
