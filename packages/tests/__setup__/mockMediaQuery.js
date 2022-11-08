import { jest } from '@jest/globals';

/**
 * Mock window.matchMedia function
 */

export function mockMatchMediaPositive() {
  globalThis.matchMedia = jest.fn().mockImplementation(() => ({
    matches: true,
    media: '',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));
}

export function mockMatchMediaNegative() {
  globalThis.matchMedia = jest.fn().mockImplementation(() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }));
}
