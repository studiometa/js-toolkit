import MatchMediaMock from 'jest-matchmedia-mock';

export function useMatchMedia(mediaQuery = '(min-width: 80rem)') {
  const matchMedia = new MatchMediaMock();
  matchMedia.useMediaQuery(mediaQuery);
  return matchMedia;
}
