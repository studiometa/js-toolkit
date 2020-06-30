import * as components from '../../src/components';

test('components exports', () => {
  expect(Object.keys(components)).toEqual(['Modal', 'Tabs']);
});
