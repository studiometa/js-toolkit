import { afterEach, describe, expect, it } from 'vitest';
import { saveActiveElement, trapFocus, untrapFocus } from './focus.js';

const created: Element[] = [];

function render(html: string): HTMLElement {
  const element = document.createElement('div');
  element.innerHTML = html;
  document.body.append(element);
  created.push(element);
  return element;
}

/** A `Tab` press the trap can act on. */
function tab(shiftKey = false): KeyboardEvent {
  return new KeyboardEvent('keydown', { key: 'Tab', shiftKey, cancelable: true });
}

afterEach(() => {
  for (const element of created.splice(0)) element.remove();
  untrapFocus();
});

describe('trapFocus', () => {
  it('ignores every key but Tab', () => {
    const element = render('<button id="a"></button>');
    const event = new KeyboardEvent('keydown', { key: 'Enter', cancelable: true });
    trapFocus(element, event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('focuses the first focusable element when the focus is outside', () => {
    const element = render('<button id="a"></button><button id="b"></button>');
    const event = tab();
    trapFocus(element, event);
    expect(document.activeElement?.id).toBe('a');
    expect(event.defaultPrevented).toBe(true);
  });

  it('wraps forwards from the last element and backwards from the first', () => {
    const element = render('<button id="a"></button><button id="b"></button>');
    const [first, last] = [...element.querySelectorAll('button')];

    last.focus();
    const forwards = tab();
    trapFocus(element, forwards);
    expect(document.activeElement).toBe(first);
    expect(forwards.defaultPrevented).toBe(true);

    const backwards = tab(true);
    trapFocus(element, backwards);
    expect(document.activeElement).toBe(last);
    expect(backwards.defaultPrevented).toBe(true);
  });

  it('lets the browser move the focus inside the element', () => {
    const element = render('<button id="a"></button><button id="b"></button>');
    element.querySelector<HTMLElement>('#a')?.focus();
    const event = tab();
    trapFocus(element, event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('skips what tab navigation cannot reach', () => {
    const element = render(`
      <button id="a" disabled></button>
      <a id="b">no href</a>
      <button id="c" tabindex="-1"></button>
      <button id="d"></button>
    `);
    trapFocus(element, tab());
    expect(document.activeElement?.id).toBe('d');
  });

  it('does nothing when the element holds nothing focusable', () => {
    const element = render('<p>text</p>');
    const event = tab();
    expect(() => trapFocus(element, event)).not.toThrow();
    expect(event.defaultPrevented).toBe(false);
  });
});

describe('saveActiveElement and untrapFocus', () => {
  it('gives the focus back to what had it', () => {
    const outside = render('<button id="outside"></button>');
    const trap = render('<button id="inside"></button>');
    const before = outside.querySelector<HTMLElement>('#outside');

    before?.focus();
    saveActiveElement();

    trapFocus(trap, tab());
    expect(document.activeElement?.id).toBe('inside');

    untrapFocus();
    expect(document.activeElement).toBe(before);
  });

  it('restores what had the focus when the trap started, without saving first', () => {
    const outside = render('<button id="outside"></button>');
    const trap = render('<button id="inside"></button>');
    const before = outside.querySelector<HTMLElement>('#outside');

    before?.focus();
    trapFocus(trap, tab());
    untrapFocus();
    expect(document.activeElement).toBe(before);
  });

  it('forgets the saved element, so a second call is a no-op', () => {
    const outside = render('<button id="outside"></button>');
    const other = render('<button id="other"></button>');

    outside.querySelector<HTMLElement>('#outside')?.focus();
    saveActiveElement();
    untrapFocus();

    const target = other.querySelector<HTMLElement>('#other');
    target?.focus();
    untrapFocus();
    expect(document.activeElement).toBe(target);
  });
});
