import { afterEach, describe, expect, it } from 'vitest';
import { Base, registerComponents, type BaseConfig, type DelegatedEvent } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { ClickOutside } from './ClickOutside.js';

/** Parent probe for delegated `click-outside` events. */
class Dropdown extends Base {
  static config: BaseConfig = { name: 'Dropdown', components: { ClickOutside } };

  closed: Array<DelegatedEvent<ClickOutside, 'click-outside'>> = [];

  onClickOutsideClickOutside(payload: DelegatedEvent<ClickOutside, 'click-outside'>): void {
    this.closed.push(payload);
  }
}

registerComponents(ClickOutside, Dropdown);

afterEach(resetDom);

async function render(): Promise<{
  root: HTMLElement;
  outside: HTMLElement;
  inside: HTMLElement;
  instance: ClickOutside;
  events: CustomEvent[];
}> {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-component="Dropdown">
      <div data-component="ClickOutside"><button data-ref="inner">inside</button></div>
    </div>
    <button>outside</button>
  `;
  document.body.append(root);
  await settle();

  const el = root.querySelector('[data-component="ClickOutside"]') as HTMLElement;
  const events: CustomEvent[] = [];
  el.addEventListener('click-outside', (event) => events.push(event as CustomEvent));

  return {
    root,
    outside: root.querySelector('button:not([data-ref])') as HTMLElement,
    inside: el.querySelector('[data-ref="inner"]') as HTMLElement,
    instance: getInstance<ClickOutside>(el, 'ClickOutside'),
    events,
  };
}

describe('ClickOutside', () => {
  it('announces a click that lands outside its element', async () => {
    const { outside, events } = await render();

    outside.click();

    expect(events).toHaveLength(1);
    expect(events[0].detail.event.type).toBe('click');
  });

  it('stays quiet for a click on itself or on a descendant', async () => {
    const { instance, inside, events } = await render();

    instance.$el.click();
    inside.click();

    expect(events).toHaveLength(0);
  });

  it('bubbles, so an ancestor hears it as a delegated child event', async () => {
    const { root, outside } = await render();

    outside.click();

    const dropdown = getInstance<Dropdown>(
      root.querySelector('[data-component="Dropdown"]'),
      'Dropdown',
    );
    expect(dropdown.closed).toHaveLength(1);
    expect(dropdown.closed[0].target).toBeInstanceOf(ClickOutside);
    expect(dropdown.closed[0].payload.event.type).toBe('click');
  });

  it('stops listening once destroyed, and listens again on remount', async () => {
    const { outside, instance, events } = await render();

    instance.$destroy();
    outside.click();
    expect(events).toHaveLength(0);

    instance.$mount();
    outside.click();
    expect(events).toHaveLength(1);
  });
});
