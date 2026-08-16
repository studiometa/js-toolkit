import { afterEach, describe, expect, it } from 'vitest';
import { frames } from '../test-utils.js';
import {
  enterTransition,
  leaveTransition,
  setClassesOrStyles,
  transition,
  type TransitionOptions,
} from './transition.js';

const created: Element[] = [];

/** An element in the document, so `getComputedStyle()` sees the stylesheet. */
function createElement(styles = ''): HTMLElement {
  if (styles) {
    const style = document.createElement('style');
    style.textContent = styles;
    document.head.append(style);
    created.push(style);
  }
  const element = document.createElement('div');
  document.body.append(element);
  created.push(element);
  return element;
}

afterEach(() => {
  for (const element of created.splice(0)) element.remove();
});

describe('setClassesOrStyles', () => {
  it('adds and removes class names, given as a string or a list', () => {
    const element = createElement();
    setClassesOrStyles(element, 'a b');
    expect(element.className).toBe('a b');
    setClassesOrStyles(element, ['c'], 'add');
    expect(element.className).toBe('a b c');
    setClassesOrStyles(element, 'a b', 'remove');
    expect(element.className).toBe('c');
  });

  it('resets an inline style rather than deleting the property', () => {
    const element = createElement();
    setClassesOrStyles(element, { opacity: '0' });
    expect(element.style.opacity).toBe('0');
    setClassesOrStyles(element, { opacity: '0' }, 'remove');
    expect(element.style.opacity).toBe('');
  });

  it('does nothing without a value', () => {
    const element = createElement();
    expect(() => setClassesOrStyles(element, undefined)).not.toThrow();
    expect(element.getAttribute('class')).toBeNull();
  });
});

describe('transition', () => {
  it('applies from, then active and to, and cleans up after itself', async () => {
    const element = createElement();
    const promise = transition(element, 'fade');
    expect(element.className).toBe('fade-from');

    await promise;
    expect(element.getAttribute('class')).toBe('');
  });

  it('keeps the to state when asked', async () => {
    const element = createElement();
    await transition(element, 'fade', 'keep');
    expect(element.className).toBe('fade-to');
  });

  it('accepts explicit class names and inline styles', async () => {
    const element = createElement();
    await transition(element, { from: 'is-hidden', active: 'is-moving', to: 'is-shown' }, 'keep');
    expect(element.className).toBe('is-shown');

    const styled = createElement();
    await transition(styled, { from: { opacity: '0' }, to: { opacity: '1' } }, 'keep');
    expect(styled.style.opacity).toBe('1');
  });

  it('waits for a real transition to end', async () => {
    const element = createElement('.slide-active { transition: opacity 60ms linear }');
    let done = false;
    const promise = transition(
      element,
      { from: { opacity: '0' }, active: 'slide-active', to: { opacity: '1' } },
      'keep',
    ).then(() => {
      done = true;
    });

    await frames(3);
    expect(done).toBe(false);

    await promise;
    expect(done).toBe(true);
    expect(element.classList.contains('slide-active')).toBe(false);
  });

  it('resolves a second transition started while the first runs', async () => {
    const element = createElement('.slide-active { transition: opacity 60ms linear }');
    const first = transition(element, { active: 'slide-active', to: { opacity: '1' } }, 'keep');
    const second = transition(element, { active: 'slide-active', to: { opacity: '0' } }, 'keep');

    await expect(Promise.all([first, second])).resolves.toBeDefined();
    expect(element.style.opacity).toBe('0');
  });
});

describe('enterTransition and leaveTransition', () => {
  const options: TransitionOptions = {
    enterFrom: 'enter-from',
    enterActive: 'enter-active',
    enterTo: 'enter-to',
    enterKeep: true,
    leaveFrom: 'leave-from',
    leaveActive: 'leave-active',
    leaveTo: 'leave-to',
    leaveKeep: true,
  };

  it('clears the other direction end state before running', async () => {
    const element = createElement();

    await leaveTransition(element, options);
    expect(element.className).toBe('leave-to');

    await enterTransition(element, options);
    expect(element.className).toBe('enter-to');

    await leaveTransition(element, options);
    expect(element.className).toBe('leave-to');
  });

  it('leaves nothing behind when the end state is not kept', async () => {
    const element = createElement();
    await enterTransition(element, { ...options, enterKeep: false });
    expect(element.getAttribute('class')).toBe('');
  });
});
