import * as components from '~/components';

test('components exports', () => {
  expect(Object.keys(components)).toEqual(['Accordion', 'MediaQuery', 'Modal', 'Tabs', 'Tooltip']);
});
