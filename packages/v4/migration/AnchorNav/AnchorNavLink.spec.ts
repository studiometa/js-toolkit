import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { AnchorNavLink } from './AnchorNavLink.js';

registerComponents(AnchorNavLink);

afterEach(resetDom);

const OPTIONS_ATTRS = [
  'data-option-enter-from="enter-from"',
  'data-option-enter-active="enter-active"',
  'data-option-enter-to="enter-to"',
  'data-option-enter-keep="true"',
  'data-option-leave-from="leave-from"',
  'data-option-leave-active="leave-active"',
  'data-option-leave-to="leave-to"',
  'data-option-leave-keep="true"',
].join(' ');

async function render(): Promise<AnchorNavLink> {
  const root = document.createElement('div');
  root.innerHTML = `<a data-component="AnchorNavLink" href="#section-one" ${OPTIONS_ATTRS}></a>`;
  document.body.append(root);
  await settle();
  return getInstance<AnchorNavLink>(root.firstElementChild, 'AnchorNavLink');
}

describe('AnchorNavLink', () => {
  it('reads the target id from the hash, without the `#`', async () => {
    const instance = await render();
    expect(instance.targetId).toBe('section-one');
  });

  it('runs the enter transition and emits its lifecycle events', async () => {
    const instance = await render();
    const events: string[] = [];
    instance.$el.addEventListener('transition-enter', () => events.push('transition-enter'));
    instance.$el.addEventListener('transition-enter-start', () =>
      events.push('transition-enter-start'),
    );
    instance.$el.addEventListener('transition-enter-end', () =>
      events.push('transition-enter-end'),
    );

    await instance.enter();

    expect(instance.state).toBe('entering');
    expect(instance.$el.className).toBe('enter-to');
    expect(events).toEqual(['transition-enter', 'transition-enter-start', 'transition-enter-end']);
  });

  it('runs the leave transition, clearing the enter end state first', async () => {
    const instance = await render();
    await instance.enter();

    await instance.leave();

    expect(instance.state).toBe('leaving');
    expect(instance.$el.className).toBe('leave-to');
  });

  it('toggles between enter and leave depending on its last state', async () => {
    const instance = await render();

    await instance.toggle();
    expect(instance.state).toBe('entering');
    expect(instance.$el.className).toBe('enter-to');

    await instance.toggle();
    expect(instance.state).toBe('leaving');
    expect(instance.$el.className).toBe('leave-to');
  });

  it('still runs onClick for the inherited ScrollTo behaviour', async () => {
    const instance = await render();
    const event = new MouseEvent('click', { cancelable: true });

    instance.onClick(event);

    // No `#section-one` element in the document: the click is left alone.
    expect(event.defaultPrevented).toBe(false);
  });
});
