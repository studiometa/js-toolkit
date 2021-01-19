import Modal from '~/components/Modal';
import template from '../../docs/components/Modal.template.html';
import nextFrame from '~/utils/nextFrame';

let consoleSpy;
beforeAll(() => {
  consoleSpy = jest.spyOn(console, 'warn');
  consoleSpy.mockImplementation(() => true);
});
afterAll(() => {
  consoleSpy.mockRestore();
});

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

  it('should emit events when opening and closing', async () => {
    const fn = jest.fn();
    modal.$on('open', fn);
    modal.$on('close', fn);

    await modal.open();
    expect(fn).toHaveBeenCalledTimes(1);
    await modal.close();
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should update aria-attributes when opening and closing.', async () => {
    expect(modal.$refs.modal.getAttribute('aria-hidden')).toBe('true');
    await modal.open();
    expect(modal.$refs.modal.getAttribute('aria-hidden')).toBe('false');
    await modal.close();
  });

  it('should update refs classes and styles when opening and closing.', async () => {
    await modal.open();
    await nextFrame();
    expect(modal.$refs.modal.getAttribute('style')).toBe('');
    await modal.close();
    await nextFrame();
    expect(modal.$refs.modal.getAttribute('style')).toBe(
      'opacity: 0; pointer-events: none; visibility: hidden;'
    );
  });

  it('should set the focus to the `autofocus` element when opening.', async () => {
    const autofocus = modal.$refs.modal.querySelector('[autofocus]');
    jest.spyOn(autofocus, 'focus');
    await modal.open();
    expect(autofocus.focus).toHaveBeenCalledTimes(1);
    await modal.close();
  });

  it('should trap the focus when open.', async () => {
    const tabKeydown = new KeyboardEvent('keydown', { keyCode: 9, bubbles: true });
    const closeButton = modal.$refs.modal.querySelector('[data-ref="close"]');
    const openButton = modal.$el.querySelector('[data-ref="open"]');
    openButton.focus();

    jest.spyOn(closeButton, 'focus');
    jest.spyOn(openButton, 'focus');

    await modal.open();
    document.dispatchEvent(tabKeydown);
    expect(closeButton.focus).toHaveBeenCalledTimes(1);
    expect(openButton.focus).toHaveBeenCalledTimes(0);
    document.dispatchEvent(tabKeydown);
    document.dispatchEvent(tabKeydown);
    expect(openButton.focus).toHaveBeenCalledTimes(0);
    expect(closeButton.focus).toHaveBeenCalledTimes(1);

    await modal.close();
    expect(openButton.focus).toHaveBeenCalledTimes(1);
  });

  it('should open when clicking the open button.', async () => {
    const btn = document.querySelector('[data-ref="open"]');
    await modal.close();
    expect(modal.isOpen).toBe(false);
    btn.click();
    expect(modal.isOpen).toBe(true);
    await nextFrame();
  });

  it('should close when pressing the escape key.', async () => {
    const escapeKeyup = new KeyboardEvent('keyup', { keyCode: 27 });
    await modal.open();
    expect(modal.isOpen).toBe(true);
    document.dispatchEvent(escapeKeyup);
    expect(modal.isOpen).toBe(false);
    document.dispatchEvent(escapeKeyup);
    expect(modal.isOpen).toBe(false);
  });

  it('should close when clicking the overlay.', async () => {
    const overlay = document.querySelector('[data-ref="overlay"]');
    await modal.open();
    expect(modal.isOpen).toBe(true);
    overlay.click();
    expect(modal.isOpen).toBe(false);
  });

  it('should close when clicking the close button.', async () => {
    const btn = document.querySelector('[data-ref="close"]');

    await modal.open();
    expect(modal.isOpen).toBe(true);
    btn.click();
    expect(modal.isOpen).toBe(false);
  });

  it('should close on destroy.', async () => {
    await modal.open();
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
