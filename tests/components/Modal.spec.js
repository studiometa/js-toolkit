/* eslint-disable no-new, require-jsdoc, max-classes-per-file */
import Modal from '../../src/components/Modal';
import template from '../../docs/components/Modal.template.html';

describe('The Modal component', () => {
  let modal;

  beforeAll(() => {
    document.body.innerHTML = template;
    modal = new Modal(document.body.firstElementChild);
  });

  it('should be closed on instantiation', () => {
    expect(modal.$el.outerHTML).toBe(document.body.firstElementChild.outerHTML);
    expect(modal.isOpen).toBe(false);
  });

  it('should emit events when opening and closing', () => {
    const fn = jest.fn();
    modal.$on('open', fn);
    modal.$on('close', fn);

    modal.open();
    expect(fn).toHaveBeenCalledTimes(1);
    modal.close();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should update aria-attributes when opening and closing.', () => {
    expect(modal.$refs.modal.getAttribute('aria-hidden')).toBe('true');
    modal.open();
    expect(modal.$refs.modal.getAttribute('aria-hidden')).toBe('false');
    modal.close();
  });

  it('should update refs classes and styles when opening and closing.', () => {
    modal.open();
    expect(modal.$refs.modal.getAttribute('style')).toBe('');
    modal.close();
    expect(modal.$refs.modal.getAttribute('style')).toBe(
      'opacity: 0; pointer-events: none; visibility: hidden;'
    );
  });

  it('should open when clicking the open button.', () => {
    const btn = document.querySelector('[data-ref="open"]');
    modal.close();
    expect(modal.isOpen).toBe(false);
    btn.click();
    expect(modal.isOpen).toBe(true);
  });

  it('should set the focus to the `autofocus` element when opening.', () => {
    const autofocus = modal.$refs.modal.querySelector('[autofocus]');
    jest.spyOn(autofocus, 'focus');
    modal.open();
    expect(autofocus.focus).toHaveBeenCalledTimes(1);
  });

  it('should close when pressing the escape key.', () => {
    const escapeKeyup = new KeyboardEvent('keyup', { keyCode: 27 });
    modal.open();
    expect(modal.isOpen).toBe(true);
    document.dispatchEvent(escapeKeyup);
    expect(modal.isOpen).toBe(false);
  });

  it('should close when clicking the overlay.', () => {
    const overlay = document.querySelector('[data-ref="overlay"]');
    modal.open();
    expect(modal.isOpen).toBe(true);
    overlay.click();
    expect(modal.isOpen).toBe(false);
  });

  it('should close when clicking the close button.', () => {
    const btn = document.querySelector('[data-ref="close"]');

    modal.open();
    expect(modal.isOpen).toBe(true);
    btn.click();
    expect(modal.isOpen).toBe(false);
  });

  it('should close on destroy.', () => {
    modal.open();
    expect(modal.isOpen).toBe(true);
    modal.$destroy();
    expect(modal.isOpen).toBe(false);
  });
});

describe('The Modal component with the `move` option', () => {
  let modal;

  beforeAll(() => {
    document.body.innerHTML = `${template}<div id="target"></div>`;
    document.body.firstElementChild.setAttribute(
      'data-options',
      JSON.stringify({ move: '#target' })
    );
    modal = new Modal(document.body.firstElementChild);
  });

  it('should move the `modal` ref to the `#target` element on mounted.', () => {
    const target = document.querySelector('#target');
    expect(target.firstElementChild).toBe(modal.$refs.modal);
  });

  it('should move the `modal` ref back to its previous place.', () => {
    modal.$destroy();
    const target = document.querySelector('#target');
    expect(target.firstElementChild).toBeNull();
  });
});
