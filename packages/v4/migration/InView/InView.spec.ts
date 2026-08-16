import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Base, registerComponents, type BaseConfig } from '../../src/index.js';
import { INSTANCES } from '../../src/protocol-symbols.js';
import { resetDom, settle } from '../../src/test-utils.js';
import { InView } from './InView.js';
import { InViewOnce } from './InViewOnce.js';

const OFFSCREEN = 'position:absolute;top:300vh;left:0;width:50px;height:50px';
const ONSCREEN = 'position:absolute;top:0;left:0;width:50px;height:50px';

/** Subclass that relies on the inherited mount strategy. */
class InViewSubclass extends InView {
  static config: BaseConfig = { name: 'InViewSubclass' };
}

registerComponents(InView, InViewOnce, InViewSubclass);

afterEach(resetDom);

/** Give the observer a few frames to deliver. */
async function observed(): Promise<void> {
  for (let i = 0; i < 6; i += 1) {
    await settle();
  }
}

function render(name: string, style: string, attributes: Record<string, string> = {}) {
  const el = document.createElement('div');
  el.setAttribute('data-component', name);
  el.setAttribute('style', style);
  for (const [key, value] of Object.entries(attributes)) {
    el.setAttribute(key, value);
  }
  document.body.append(el);
  return el;
}

/** Record events on `document` because the component may not exist before entry. */
function record(): { events: string[]; stop: () => void } {
  const events: string[] = [];
  const listener = (event: Event) => events.push(event.type);
  document.addEventListener('in-view', listener);
  document.addEventListener('out-of-view', listener);
  return {
    events,
    stop() {
      document.removeEventListener('in-view', listener);
      document.removeEventListener('out-of-view', listener);
    },
  };
}

let log: ReturnType<typeof record>;

beforeEach(() => {
  log = record();
});

afterEach(() => {
  log.stop();
});

describe('InView', () => {
  it('emits `in-view` when the element enters the viewport', async () => {
    const el = render('InView', OFFSCREEN);
    await observed();
    expect(log.events).toEqual([]);

    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(log.events).toEqual(['in-view']);
  });

  it('emits `out-of-view` when the element leaves the viewport', async () => {
    const el = render('InView', ONSCREEN);
    await observed();

    el.setAttribute('style', OFFSCREEN);
    await observed();

    expect(log.events).toEqual(['in-view', 'out-of-view']);
  });

  it('re-emits `in-view` on each re-entry, from the same instance', async () => {
    const el = render('InView', ONSCREEN);
    await observed();
    const instance = el[INSTANCES]?.get('InView');

    el.setAttribute('style', OFFSCREEN);
    await observed();
    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(log.events).toEqual(['in-view', 'out-of-view', 'in-view']);
    expect(el[INSTANCES]?.get('InView')).toBe(instance);
  });

  it('does not instantiate the component until it is first seen', async () => {
    const el = render('InView', OFFSCREEN);
    await observed();

    expect(el[INSTANCES]?.get('InView')).toBeUndefined();
  });
});

describe('InViewOnce', () => {
  it('emits `in-view` when the element enters the viewport', async () => {
    const el = render('InViewOnce', OFFSCREEN);
    await observed();

    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(log.events).toEqual(['in-view']);
  });

  it('never emits `out-of-view`, and does not re-emit on a later entry', async () => {
    const el = render('InViewOnce', ONSCREEN);
    await observed();

    el.setAttribute('style', OFFSCREEN);
    await observed();
    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(log.events).toEqual(['in-view']);
  });

  it('stays mounted after leaving the viewport, where v3 terminated', async () => {
    const el = render('InViewOnce', ONSCREEN);
    await observed();
    const instance = el[INSTANCES]?.get('InViewOnce');

    el.setAttribute('style', OFFSCREEN);
    await observed();

    expect(instance?.$isMounted).toBe(true);
    expect(instance?.$isTerminated).toBe(false);
  });

  it('still emits `out-of-view` never, when the element is removed from the DOM', async () => {
    const el = render('InViewOnce', ONSCREEN);
    await observed();

    el.remove();
    await observed();

    expect(log.events).toEqual(['in-view']);
  });
});

describe('mount strategy gaps found by the port', () => {
  /** The root margin is part of the strategy string used before instantiation. */
  it('accepts a rootMargin in the per-element strategy', async () => {
    const el = render('InView', OFFSCREEN, { 'data-mount': 'in-view:400px' });
    await observed();
    expect(log.events).toEqual([]);

    el.setAttribute('style', ONSCREEN);
    await observed();

    expect(log.events).toEqual(['in-view']);
    expect(el[INSTANCES]?.get('InView')?.$isMounted).toBe(true);
  });

  /** Subclasses must inherit the resolved mount strategy. */
  it('inherits the mount strategy in a subclass that declares its own config', async () => {
    const el = render('InViewSubclass', OFFSCREEN);
    await observed();

    expect(el[INSTANCES]?.get('InViewSubclass')).toBeUndefined();
  });
});

describe('the strategy is per element, which the decorator never was', () => {
  class Eager extends Base {
    static config: BaseConfig = { name: 'InViewEagerProbe' };
    mounts = 0;
    mounted(): void {
      this.mounts += 1;
    }
  }
  registerComponents(Eager);

  it('lets `data-mount` override the class default on one element', async () => {
    const el = render('InView', OFFSCREEN, { 'data-mount': 'eager' });
    await observed();

    expect(el[INSTANCES]?.get('InView')?.$isMounted).toBe(true);
    expect(log.events).toEqual(['in-view']);
  });

  it('lets `data-mount="in-view"` give the strategy to a component that never asked', async () => {
    const el = render('InViewEagerProbe', OFFSCREEN, { 'data-mount': 'in-view' });
    await observed();
    expect(el[INSTANCES]?.get('InViewEagerProbe')).toBeUndefined();

    el.setAttribute('style', ONSCREEN);
    await observed();
    expect((el[INSTANCES]?.get('InViewEagerProbe') as Eager | undefined)?.mounts).toBe(1);
  });
});
