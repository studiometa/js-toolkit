import { describe, expect, it } from 'vitest';
import { reportToolkitError, type ToolkitErrorDetail } from './errors.js';
import { EVENTS } from './events.js';

describe('framework error reporting', () => {
  it('falls back to document when no component element is available', () => {
    const failure = new Error('no element');
    const documentEvents: CustomEvent<ToolkitErrorDetail>[] = [];
    const windowEvents: CustomEvent<ToolkitErrorDetail>[] = [];
    document.addEventListener(
      EVENTS.error,
      (event) => {
        event.preventDefault();
        documentEvents.push(event as CustomEvent<ToolkitErrorDetail>);
      },
      { once: true },
    );
    window.addEventListener(
      EVENTS.error,
      (event) => windowEvents.push(event as CustomEvent<ToolkitErrorDetail>),
      { once: true },
    );

    const event = reportToolkitError('load', failure);

    expect(documentEvents).toEqual([event]);
    expect(windowEvents).toEqual([event]);
    expect(event).toMatchObject({
      bubbles: true,
      cancelable: false,
      composed: true,
      defaultPrevented: false,
      target: document,
    });
    expect(event.detail).toEqual({ stage: 'load', error: failure });
    expect(event.detail.error).toBe(failure);
    expect(Object.hasOwn(event.detail, 'component')).toBe(false);
  });
});
