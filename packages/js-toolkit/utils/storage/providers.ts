import { createLocalStorageProvider } from './createLocalStorageProvider.js';
import { createMemoryStorageProvider } from './createMemoryStorageProvider.js';
import { createSessionStorageProvider } from './createSessionStorageProvider.js';
import { createUrlSearchParamsInHashProvider } from './createUrlSearchParamsInHashProvider.js';
import { createUrlSearchParamsProvider } from './createUrlSearchParamsProvider.js';

export { createLocalStorageProvider } from './createLocalStorageProvider.js';
export { createMemoryStorageProvider } from './createMemoryStorageProvider.js';
export { createNoopProvider } from './createNoopProvider.js';
export { createSessionStorageProvider } from './createSessionStorageProvider.js';
export { createUrlSearchParamsInHashProvider } from './createUrlSearchParamsInHashProvider.js';
export { createUrlSearchParamsProvider } from './createUrlSearchParamsProvider.js';

export const localStorageProvider = createLocalStorageProvider();
export const memoryStorageProvider = createMemoryStorageProvider();
export const sessionStorageProvider = createSessionStorageProvider();
export const urlSearchParamsProvider = createUrlSearchParamsProvider();
export const urlSearchParamsInHashProvider = createUrlSearchParamsInHashProvider();
