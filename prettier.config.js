import config from '@studiometa/prettier-config';

export default {
  ...config,
  overrides: [
    ...config.overrides,
    {
      files: 'packages/docs/**/*.md',
      options: {
        printWidth: 78,
      },
    },
  ],
};
