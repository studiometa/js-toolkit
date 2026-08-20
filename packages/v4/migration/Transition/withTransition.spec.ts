import { afterEach, describe, expect, it } from 'vitest';
import { Base, registerComponents, type BaseConfig } from '../../src/index.js';
import { resolveConfig } from '../../src/Base.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Transition } from './Transition.js';
import { withTransition } from './withTransition.js';

/**
 * A consumer declaring no transition options of its own — the whole point of
 * the mixin carrying them.
 */
class TransitionProbe extends withTransition(Base) {
  static config: BaseConfig = { name: 'TransitionProbe' };
}

/** A consumer that forces an option, the way `MenuList` forces both keeps. */
class ForcedProbe extends withTransition(Base) {
  static config: BaseConfig = { name: 'ForcedProbe' };

  get transitionOptions() {
    return { ...super.transitionOptions, enterKeep: true };
  }
}

/** A consumer whose visible part is a set of refs, not its own root. */
class MultiProbe extends withTransition(Base) {
  static config: BaseConfig = { name: 'MultiProbe', refs: ['item[]'] };

  get target(): HTMLElement[] {
    return this.$refs.item as HTMLElement[];
  }
}

registerComponents(Transition, TransitionProbe, ForcedProbe, MultiProbe);

afterEach(resetDom);

async function render(name: string, attributes = ''): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = `<div data-component="${name}" ${attributes}></div>`;
  document.body.append(root);
  await settle();
  return root.firstElementChild as HTMLElement;
}

describe('withTransition config merging', () => {
  it('gives a consumer the transition options without it declaring any', async () => {
    expect(Object.keys(resolveConfig(TransitionProbe).options ?? {})).toEqual([
      'enterFrom',
      'enterActive',
      'enterTo',
      'enterKeep',
      'leaveFrom',
      'leaveActive',
      'leaveTo',
      'leaveKeep',
    ]);

    const el = await render('TransitionProbe', 'data-option-enter-to="on"');
    expect(getInstance<TransitionProbe>(el, 'TransitionProbe').$options.enterTo).toBe('on');
  });

  /**
   * The mixin's config carries no `name`, so it must contribute to the
   * consumer's config without replacing its identity — otherwise every
   * consumer would register under one shared name.
   */
  it('does not take over the consumer name', () => {
    expect(resolveConfig(TransitionProbe).name).toBe('TransitionProbe');
    expect(resolveConfig(Transition).name).toBe('Transition');
  });
});

describe('withTransition behaviour', () => {
  it('runs the enter transition and keeps its end state when asked', async () => {
    const el = await render(
      'TransitionProbe',
      'data-option-enter-to="visible" data-option-enter-keep="true"',
    );
    const instance = getInstance<TransitionProbe>(el, 'TransitionProbe');

    await instance.enter();

    expect(instance.state).toBe('entering');
    expect(el.classList.contains('visible')).toBe(true);
  });

  it('toggles between enter and leave', async () => {
    const el = await render(
      'TransitionProbe',
      'data-option-enter-to="visible" data-option-enter-keep="true" data-option-leave-to="gone" data-option-leave-keep="true"',
    );
    const instance = getInstance<TransitionProbe>(el, 'TransitionProbe');

    await instance.toggle();
    expect(el.classList.contains('visible')).toBe(true);

    await instance.toggle();
    expect(instance.state).toBe('leaving');
    expect(el.classList.contains('gone')).toBe(true);
  });

  /** v3's `target` getter returned `HTMLElement | HTMLElement[]`. */
  it('transitions every element when the target getter returns a list', async () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-component="MultiProbe" data-option-enter-to="on" data-option-enter-keep="true">
        <span data-ref="item[]"></span>
        <span data-ref="item[]"></span>
      </div>`;
    document.body.append(root);
    await settle();
    const el = root.firstElementChild as HTMLElement;
    const instance = getInstance<MultiProbe>(el, 'MultiProbe');
    const items = [...el.querySelectorAll('[data-ref="item[]"]')];

    await instance.enter();

    expect(items.map((item) => item.classList.contains('on'))).toEqual([true, true]);
    // The root itself is not a target here.
    expect(el.classList.contains('on')).toBe(false);
  });

  /** v3's `enter(target?)`/`leave(target?)` took an explicit override. */
  it('lets one call name its own target, replacing the getter', async () => {
    const el = await render(
      'TransitionProbe',
      'data-option-enter-to="on" data-option-enter-keep="true"',
    );
    const instance = getInstance<TransitionProbe>(el, 'TransitionProbe');
    const other = document.createElement('div');
    document.body.append(other);

    await instance.enter(other);

    expect(other.classList.contains('on')).toBe(true);
    // Replaced rather than added to: the default target is untouched.
    expect(el.classList.contains('on')).toBe(false);
  });

  it('passes a named target through toggle, in both directions', async () => {
    const el = await render(
      'TransitionProbe',
      'data-option-enter-to="on" data-option-enter-keep="true" data-option-leave-to="off" data-option-leave-keep="true"',
    );
    const instance = getInstance<TransitionProbe>(el, 'TransitionProbe');
    const other = document.createElement('div');
    document.body.append(other);

    await instance.toggle(other);
    expect(other.classList.contains('on')).toBe(true);

    await instance.toggle(other);
    expect(other.classList.contains('off')).toBe(true);
    expect(el.classList.contains('off')).toBe(false);
  });

  /**
   * `transitionOptions` is the override point that replaces v3's `$options`
   * getter override, whose only two uses in ui were exactly this.
   */
  it('lets a consumer force an option the markup did not ask for', async () => {
    const el = await render('ForcedProbe', 'data-option-enter-to="visible"');
    const instance = getInstance<ForcedProbe>(el, 'ForcedProbe');

    expect(instance.$options.enterKeep).toBe(false);
    expect(instance.transitionOptions.enterKeep).toBe(true);

    await instance.enter();

    // Kept, because the forced value won over the absent attribute.
    expect(el.classList.contains('visible')).toBe(true);
  });
});
