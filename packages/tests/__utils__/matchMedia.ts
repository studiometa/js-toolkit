import { afterEach } from '@jest/globals';
import MatchMedia from 'jest-matchmedia-mock';

const defaultMediaQuery = '(min-width: 80rem)';

export function useMatchMedia(mediaQuery = defaultMediaQuery) {
  const matchMedia = new MatchMedia();
  matchMedia.useMediaQuery(mediaQuery);

  afterEach(() => {
    matchMedia.useMediaQuery(defaultMediaQuery);
  });

  return matchMedia;
}
