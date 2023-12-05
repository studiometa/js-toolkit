import MatchMediaMock from 'jest-matchmedia-mock';

// eslint-disable-next-line new-cap
export const matchMedia = new MatchMediaMock.default();

matchMedia.useMediaQuery('(min-width: 80rem)');
