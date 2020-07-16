import AccordionItem from '~/components/Accordion/AccordionItem';
import wait from '../../__utils__/wait';

describe('AccordionItem component', () => {
  let item;
  let btn;
  let container;
  let content;

  beforeEach(() => {
    document.body.innerHTML = `
      <div data-component="AccordionItem">
        <button data-ref="btn">
          Button
        </button>
        <div data-ref="container">
          <div data-ref="content">
            Content
          </div>
        </div>
      </div>
    `;
    item = new AccordionItem(document.body.firstElementChild);
    btn = document.querySelector('[data-ref="btn"]');
    container = document.querySelector('[data-ref="container"]');
    content = document.querySelector('[data-ref="content"]');
  });

  it('should had aria-attributes when mounted', () => {
    expect(btn.id).toBe(item.$id);
    expect(content.getAttribute('aria-labelledby')).toBe(item.$id);
  });

  it('should open and close', async () => {
    await item.open();
    expect(container.getAttribute('aria-hidden')).toBe('false');
    await item.close();
    expect(container.getAttribute('aria-hidden')).toBe('true');
    btn.click();
    await wait(100);
    expect(container.getAttribute('aria-hidden')).toBe('false');
    btn.click();
    await wait(100);
    expect(container.getAttribute('aria-hidden')).toBe('true');
  });

  it('should emit open and close events', async () => {
    const fn = jest.fn();
    item.$on('open', fn);
    item.$on('close', fn);
    await item.open();
    expect(fn).toHaveBeenCalledTimes(1);
    await item.close();
    expect(fn).toHaveBeenCalledTimes(2);
    await item.close();
    expect(fn).toHaveBeenCalledTimes(2);
    await item.open();
    expect(fn).toHaveBeenCalledTimes(3);
    await item.open();
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
