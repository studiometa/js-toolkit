export function getBrowserContext(): Pick<Window, 'location' | 'history'> | undefined {
  if (typeof globalThis === 'undefined' || !('window' in globalThis)) {
    return undefined;
  }

  const { window } = globalThis;

  if (!window || !window.location || !window.history) {
    return undefined;
  }

  return {
    location: window.location,
    history: window.history,
  };
}
