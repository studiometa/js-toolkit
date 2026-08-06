// `__VERSION__` is replaced with the real version at build time in both the
// built `dist/version.js` and `dist/version.d.ts` (see `scripts/utils/set-version.js`),
// so the placeholder stays in the tracked source while editors show the exact
// published version through the `as const` literal type.
export const version = '__VERSION__' as const;
