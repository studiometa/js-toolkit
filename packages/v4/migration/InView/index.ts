// `InViewProps` is deliberately not re-exported: the barrel also carries
// `migration/utils/inView.ts`, whose service props take that name, following
// core's `ScrollProps` / `RafProps` convention. The component's props type is
// available from `./InView.js` directly.
export { InView } from './InView.js';
export { InViewOnce } from './InViewOnce.js';
