import AccordionItem from '~/components/Accordion/AccordionItem';
import wait from '../../__utils__/wait';

describe('AccordionItem component', () => {
  let item;
  let btn;
  let container;
  let content;
  let icon;

  beforeEach(() => {
    document.body.innerHTML = `
<div
  data-component="AccordionItem"
  data-options='{
    "styles": {
      "icon": {
        "open": "transform rotate-180",
        "active": { "transition": "all 1s linear" },
        "closed": "transform rotate-0"
      }
    }
  }'>
  <button data-ref="btn">
    Button
    <span data-ref="icon">▼</span>
  </button>
  <div data-ref="container">
    <div data-ref="content">Content</div>
  </div>
</div>;
    `;
    item = new AccordionItem(document.body.firstElementChild);
    btn = document.querySelector('[data-ref="btn"]');
    container = document.querySelector('[data-ref="container"]');
    content = document.querySelector('[data-ref="content"]');
    icon = document.querySelector('[data-ref="icon"]');
  });

  it('should had aria-attributes when mounted', () => {
    expect(btn.id).toBe(item.$id);
    expect(content.getAttribute('aria-labelledby')).toBe(item.$id);
    expect(btn.getAttribute('aria-expanded')).toBe('false');
    expect(content.getAttribute('aria-hidden')).toBe('true');
  });

  it('should open and close', async () => {
    const spy = jest.spyOn(icon.classList, 'add');
    await item.open();
    expect(content.getAttribute('aria-hidden')).toBe('false');
    expect(spy).toHaveBeenLastCalledWith('rotate-180');
    await item.close();
    expect(content.getAttribute('aria-hidden')).toBe('true');
    expect(spy).toHaveBeenLastCalledWith('rotate-0');
    btn.click();
    await wait(100);
    expect(content.getAttribute('aria-hidden')).toBe('false');
    btn.click();
    await wait(100);
    expect(content.getAttribute('aria-hidden')).toBe('true');

    item.open();
    item.close();
    expect(spy).toHaveBeenLastCalledWith('rotate-180');
    await item.open();
    item.close();
    item.open();
    expect(spy).toHaveBeenLastCalledWith('rotate-0');
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
