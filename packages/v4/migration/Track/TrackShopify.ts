import type { BaseConfig, BaseProps } from '../../src/index.js';
import { AbstractTrack, type AbstractTrackProps } from './AbstractTrack.js';
import { warn } from './utils.js';

declare global {
  interface Window {
    Shopify?: {
      analytics?: {
        publish?: (event: string, payload: Record<string, unknown>) => void;
      };
    };
  }
}

export type TrackShopifyProps = AbstractTrackProps;

/**
 * TrackShopify — the `window.Shopify.analytics.publish` implementation of the
 * tracking seam.
 *
 * Port of `@studiometa/ui` 1.10's `TrackShopify`. **Unchanged** apart from
 * `$warn` (gap 10) and the config no longer spreading its parent's.
 *
 * It is in this port for one reason: it is the proof that `dispatch()` is a
 * real seam rather than a shape. Two destinations, two four-line overrides,
 * and every line of parsing, merging, binding and lifecycle is shared — which
 * is what makes the `AbstractTrack` row of the size table the honest one to
 * read.
 */
export class TrackShopify<T extends BaseProps = BaseProps> extends AbstractTrack<T> {
  static config: BaseConfig = {
    name: 'TrackShopify',
  };

  dispatch(payload: Record<string, unknown>): void {
    const analytics = window.Shopify?.analytics;

    if (typeof analytics?.publish !== 'function') {
      warn('`window.Shopify.analytics.publish` is not available.');
      return;
    }

    if (typeof payload.event !== 'string') {
      warn('Cannot publish a tracking event without a string `event` name.');
      return;
    }

    // Called as a method so `this` stays bound to `window.Shopify.analytics`.
    analytics.publish(payload.event, payload);
  }
}
