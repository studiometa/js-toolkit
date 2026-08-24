import type { BaseConfig, BaseProps } from '../../src/index.js';
import { AbstractTrack, type AbstractTrackProps } from './AbstractTrack.js';

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

/** Publishes tracking payloads through `window.Shopify.analytics.publish`. */
export class TrackShopify<T extends BaseProps = BaseProps> extends AbstractTrack<T> {
  static config: BaseConfig = {
    name: 'TrackShopify',
  };

  dispatch(payload: Record<string, unknown>): void {
    const analytics = window.Shopify?.analytics;

    if (typeof analytics?.publish !== 'function') {
      this.$warn(
        'track.shopify-unavailable',
        '`window.Shopify.analytics.publish` is not available.',
      );
      return;
    }

    if (typeof payload.event !== 'string') {
      this.$warn(
        'track.missing-event-name',
        'Cannot publish a tracking event without a string `event` name.',
      );
      return;
    }

    // Called as a method so `this` stays bound to `window.Shopify.analytics`.
    analytics.publish(payload.event, payload);
  }
}
