import { afterEach } from 'bun:test';
import MatchMediaMock from 'jest-matchmedia-mock';

const defaultMediaQuery = '(min-width: 80rem)';

export function useMatchMedia(mediaQuery = defaultMediaQuery) {
  const matchMedia = new MatchMediaMock();
  matchMedia.useMediaQuery(mediaQuery);

  afterEach(() => {
    matchMedia.useMediaQuery(defaultMediaQuery);
  });

  return matchMedia;
}
