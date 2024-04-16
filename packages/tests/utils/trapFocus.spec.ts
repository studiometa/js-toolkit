import { describe, it, expect, beforeEach } from 'bun:test';
import { trapFocus, untrapFocus, saveActiveElement } from '@studiometa/js-toolkit/utils';
import { createEvent } from '#test-utils';

describe('The `trapFocus` utility', () => {
  document.body.innerHTML = `
      <button id="outside" type="button">Button</button>
      <div id="trap">
        <button id="inside" type="button">Button</button>
        <input id="input" type="text" />
      </div>
    `;

  const element = document.querySelector('#trap') as HTMLElement;
  const [outsideBtn, insideBtn] = Array.from(document.querySelectorAll('button'));
  const input = document.querySelector('input');

  document.addEventListener('keydown', (event) => {
    trapFocus(element, event);
  });

  // Restore focus before each test
  beforeEach(() => {
    outsideBtn.focus();
  });

  const tabEvent = createEvent('keydown', { keyCode: 9, shiftKey: false });
  const shiftTabEvent = createEvent('keydown', { keyCode: 9, shiftKey: true });

  it('should trap the focus inside the given element', () => {
    document.dispatchEvent(tabEvent);
    expect(document.activeElement.id).toBe(insideBtn.id);
    document.dispatchEvent(shiftTabEvent);
    expect(document.activeElement.id).toBe(input.id);
    document.dispatchEvent(tabEvent);
    expect(document.activeElement.id).toBe(insideBtn.id);
  });

  it('should save the previous element and restore its focus when untrap', () => {
    saveActiveElement();
    document.dispatchEvent(tabEvent);
    expect(document.activeElement.id).toBe(insideBtn.id);
    untrapFocus();
    expect(document.activeElement.id).toBe(outsideBtn.id);
  });

  it('should do nothing if not pressing the TAB key', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 8 }));
    expect(document.activeElement.id).toBe(outsideBtn.id);
  });

  it('should do nothing is no focusable element were found', () => {
    insideBtn.parentElement.innerHTML = '<div></div>';
    document.dispatchEvent(tabEvent);
    expect(document.activeElement.id).toBe(outsideBtn.id);
  });
});
