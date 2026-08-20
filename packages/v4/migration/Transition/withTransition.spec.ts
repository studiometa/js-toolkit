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

registerComponents(Transition, TransitionProbe, ForcedProbe);

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
