import { jest } from '@jest/globals';
import createBase from '@studiometa/js-toolkit/helpers/createBase';

describe('The `createBase` function', () => {
  it('should create a component instance', () => {
    const fn = jest.fn();
    const div = document.createElement('div');
    const component = createBase(div, {
      config: { name: 'Component' },
      mounted() {
        fn('mounted');
      },
      methods: {
        onClick() {
          fn('clicked');
        },
      },
    });
    component.$mount();

    expect(component.$options.name).toBe('Component');
    expect(fn).toHaveBeenLastCalledWith('mounted');
    div.click();
    expect(fn).toHaveBeenLastCalledWith('clicked');
  });

  it('should look for an element', () => {
    document.body.innerHTML = `
      <div class="first"></div>
      <div class="second"></div>
    `;
    const [firstDiv, secondDiv] = Array.from(document.querySelectorAll('div'));
    const component = createBase('div', {
      config: { name: 'Component' },
    });

    expect(component.$el).toEqual(firstDiv);
    expect(component.$el).not.toEqual(secondDiv);
  });
});
