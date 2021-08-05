import { jest } from '@jest/globals';
import Accordion from '@studiometa/js-toolkit/components/Accordion';
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
       <section data-component="Accordion" data-option-styles='{ "test": "test" }'>
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

    item = new Accordion(document.body.firstElementChild).$mount();
    btn = Array.from(document.querySelectorAll('[data-ref="btn"]'));
    content = Array.from(document.querySelectorAll('[data-ref="content"]'));
  });

  // @todo when the $parent is fixed
  // it('should merge parent options with item option', () => {
  //   const accordionItem = document.querySelector('[data-component="AccordionItem"]');
  //   expect(JSON.parse(accordionItem.dataset['option-item'])).toEqual({ test: true });
  //   accordionItem.__base__.$options.test = false;
  //   expect(JSON.parse(accordionItem.dataset['option-item'])).toEqual({ test: false });
  // });

  it('should not autoclose items by default', () => {
    btn[0].click();
    expect(content[0].getAttribute('aria-hidden')).toBe('false');
    expect(content[1].getAttribute('aria-hidden')).toBe('true');
    btn[1].click();
    expect(content[0].getAttribute('aria-hidden')).toBe('false');
    expect(content[1].getAttribute('aria-hidden')).toBe('false');
  });

  it('should autoclose items when specified', async () => {
    item.$el.setAttribute('data-option-autoclose', '');
    btn[0].click();

    expect(content[0].getAttribute('aria-hidden')).toBe('false');
    expect(content[1].getAttribute('aria-hidden')).toBe('true');

    btn[1].click();

    expect(content[1].getAttribute('aria-hidden')).toBe('false');
    await wait(150);
    expect(content[0].getAttribute('aria-hidden')).toBe('true');
  });

  it('should unbind the open listeners on destroy', () => {
    const spy = jest.spyOn(item.unbindMethods, 'forEach');
    item.$destroy();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
