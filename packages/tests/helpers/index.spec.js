import * as helpers from '@studiometa/js-toolkit/helpers';

test('helpers exports', () => {
  expect(Object.keys(helpers)).toMatchSnapshot();
});
