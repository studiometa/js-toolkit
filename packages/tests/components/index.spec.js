import * as components from '@studiometa/js-toolkit/components';

test('components exports', () => {
  expect(Object.keys(components)).toEqual(['Accordion', 'Cursor', 'Modal', 'TableOfContent', 'Tabs']);
});
