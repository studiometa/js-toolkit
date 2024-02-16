import { jest } from 'bun:test';
import MatchMediaMock from 'jest-matchmedia-mock';

global.jest = jest;

// eslint-disable-next-line new-cap
export const matchMedia = new MatchMediaMock();

matchMedia.useMediaQuery('(min-width: 80rem)');
