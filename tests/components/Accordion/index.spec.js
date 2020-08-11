import Accordion from '~/components/Accordion';
import wait from '../../__utils__/wait';

describe('Accordion component', () => {
  it('should have at least 1 test', () => {
    expect(true).toBe(true);
  });

  let item;
  let btn;
  let content;

  beforeEach(() => {
    document.body.innerHTML = `
       <section data-component="Accordion" data-options='{ "item": { "test": true } }'>
         <div data-component="AccordionItem">
           <button data-ref="btn">
             Button
           </button>
           <div data-ref="container" aria-hidden="true">
             <div data-ref="content">
               Content #1
             </div>
           </div>
         </div>
         <div data-component="AccordionItem">
           <button data-ref="btn">
             Button
           </button>
           <div data-ref="container" aria-hidden="true">
             <div data-ref="content">
               Content #2
             </div>
           </div>
         </div>
       </section>
     `;

    // Mock AccordionItem components `querySelectorAll` method because
    // the `:scope` pseudo-selector does not work as expected in jsdom.
    Array.from(document.querySelectorAll('[data-component="AccordionItem"]')).forEach(el => {
      const spy = jest.spyOn(el, 'querySelectorAll');
      spy.mockImplementation(selector => {
        if (/:scope/i.test(selector)) {
          return Array.from(el.children).reduce((acc, child) => {
            return [...acc, ...Array.from(child.querySelectorAll(selector))];
          }, []);
        }
        return HTMLElement.prototype.querySelectorAll.call(el, selector);
      });
    });

    item = new Accordion(document.body.firstElementChild);
    btn = Array.from(document.querySelectorAll('[data-ref="btn"]'));
    content = Array.from(document.querySelectorAll('[data-ref="content"]'));
  });

  it('should merge parent options with item option', () => {
    const accordionItem = document.querySelector('[data-component="AccordionItem"]');
    expect(JSON.parse(accordionItem.dataset.options)).toEqual({ test: true });
    accordionItem.__base__.$options = { test: false };
    expect(JSON.parse(accordionItem.dataset.options)).toEqual({ test: false });
  });

  it('should autoclose items by default', async () => {
    btn[0].click();
    await wait(100);
    expect(content[0].getAttribute('aria-hidden')).toBe('false');
    expect(content[1].getAttribute('aria-hidden')).toBe('true');
    btn[1].click();
    await wait(100);
    expect(content[0].getAttribute('aria-hidden')).toBe('true');
    expect(content[1].getAttribute('aria-hidden')).toBe('false');
  });

  it('should not autoclose items when specified', async () => {
    item.$el.setAttribute('data-options', '{ "autoclose": false }');
    btn[0].click();
    await wait(100);
    expect(content[0].getAttribute('aria-hidden')).toBe('false');
    expect(content[1].getAttribute('aria-hidden')).toBe('true');
    btn[1].click();
    await wait(100);
    expect(content[0].getAttribute('aria-hidden')).toBe('false');
    expect(content[1].getAttribute('aria-hidden')).toBe('false');
  });

  it('should unbind the open listeners on destroy', () => {
    const spy = jest.spyOn(item.unbindMethods, 'forEach');
    item.$destroy();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
