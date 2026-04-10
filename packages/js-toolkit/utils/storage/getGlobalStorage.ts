export function getGlobalStorage(name: 'localStorage' | 'sessionStorage'): Storage | undefined {
  return typeof globalThis !== 'undefined' && name in globalThis
    ? globalThis[name]
    : undefined;
}
