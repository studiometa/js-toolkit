import { trapFocus, untrapFocus, saveActiveElement } from '@studiometa/js-toolkit/utils';

describe('The `trapFocus` utility', () => {
  document.body.innerHTML = `
      <button class="outside" type="button">Button</button>
      <div id="trap">
        <button class="inside" type="button">Button</button>
        <input type="text" />
      </div>
    `;

  const element = document.querySelector('#trap');
  const [outsideBtn, insideBtn] = Array.from(document.querySelectorAll('button'));
  const input = document.querySelector('input');

  document.addEventListener('keydown', (event) => {
    trapFocus(element, event);
  });

  // Restore focus before each test
  beforeEach(() => {
    outsideBtn.focus();
  });

  it('should trap the focus inside the given element', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, shiftKey: false }));
    expect(document.activeElement).toBe(insideBtn);
    document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, shiftKey: true }));
    expect(document.activeElement).toBe(input);
    document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, shiftKey: false }));
    expect(document.activeElement).toBe(insideBtn);
  });

  it('should save the previous element and restore its focus when untrap', () => {
    saveActiveElement();
    document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, shiftKey: false }));
    expect(document.activeElement).toBe(insideBtn);
    untrapFocus();
    expect(document.activeElement).toBe(outsideBtn);
  });

  it('should do nothing if not pressing the TAB key', () => {
    document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 8 }));
    expect(document.activeElement).toBe(outsideBtn);
  });

  it('should do nothing is no focusable element were found', () => {
    insideBtn.parentElement.innerHTML = '<div></div>';
    document.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 9, shiftKey: false }));
    expect(document.activeElement).toBe(outsideBtn);
  });
});
