/**
 * The lifecycle announcement event names (objective 5, layer 1).
 *
 * They sit in their own module rather than in `Base.ts` because `context.ts`
 * listens for `MOUNTED_EVENT` — a provider that mounts is what re-answers a
 * subscribed request — and `Base.ts` already imports `context.ts`. Reading the
 * constant back out of `Base.ts` would close an import cycle for the sake of
 * two strings. `Base.ts` re-exports both, so the public surface and the
 * generated subpaths are unchanged.
 */
export const MOUNTED_EVENT = 'component:mounted';
export const DESTROYED_EVENT = 'component:destroyed';
