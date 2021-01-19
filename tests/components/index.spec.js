import * as components from '~/components';

test('components exports', () => {
  expect(Object.keys(components)).toEqual(['Accordion', 'Modal', 'Tabs']);
});
