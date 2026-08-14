import type { BaseConfig, BaseProps } from '../../src/index.js';
import { AbstractTrack, type AbstractTrackProps } from './AbstractTrack.js';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

export type TrackProps = AbstractTrackProps;

/**
 * Track — the `window.dataLayer` implementation of the tracking seam.
 *
 * Port of `@studiometa/ui` 1.10's `Track`. **Unchanged**, other than the
 * config no longer spreading its parent's (configs merge along the prototype
 * chain in v4, #627) and the props interface becoming a type alias (gap 14).
 * Compatible with GTM and any other `dataLayer` consumer; consent stays a tag
 * manager or CMP concern.
 *
 * @example
 * ```html
 * <button data-component="Track" data-track:click='{"event": "cta_click"}'>Subscribe</button>
 * <div data-component="Track" data-track:view.once='{"event": "impression"}'>Product card</div>
 * ```
 */
export class Track<T extends BaseProps = BaseProps> extends AbstractTrack<T> {
  static config: BaseConfig = {
    name: 'Track',
  };

  dispatch(payload: Record<string, unknown>): void {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(payload);
  }
}
