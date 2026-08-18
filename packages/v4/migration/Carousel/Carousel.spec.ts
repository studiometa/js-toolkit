import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Carousel } from './Carousel.js';
import { CarouselBtn } from './CarouselBtn.js';
import { CarouselDrag } from './CarouselDrag.js';
import { CarouselItem } from './CarouselItem.js';
import { CarouselWrapper } from './CarouselWrapper.js';
import { getClosestIndex } from './utils.js';

registerComponents(Carousel, CarouselBtn, CarouselDrag, CarouselItem, CarouselWrapper);

afterEach(resetDom);

const WRAPPER_STYLE =
  'display:flex;overflow:auto;width:200px;height:100px;scroll-snap-type:x mandatory';
const ITEM_STYLE = 'flex:0 0 200px;width:200px;height:100px';

function slides(count: number): string {
  return Array.from(
    { length: count },
    (_, index) =>
      `<div data-component="CarouselItem" style="${ITEM_STYLE}" data-index="${index}"></div>`,
  ).join('');
}

interface Rendered {
  root: HTMLElement;
  el: HTMLElement;
  carousel: Carousel;
  wrapper: HTMLElement;
}

async function render({
  count = 3,
  attributes = '',
  buttons = '',
}: { count?: number; attributes?: string; buttons?: string } = {}): Promise<Rendered> {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-component="Carousel" ${attributes}>
      <div data-component="CarouselWrapper" style="${WRAPPER_STYLE}">${slides(count)}</div>
      ${buttons}
    </div>`;
  document.body.append(root);
  await settle();
  const el = root.firstElementChild as HTMLElement;
  return {
    root,
    el,
    carousel: getInstance<Carousel>(el, 'Carousel'),
    wrapper: el.querySelector('[data-component~="CarouselWrapper"]') as HTMLElement,
  };
}

/** Let the scheduler, the frame loop and the smooth scroll settle. */
async function settled(count = 10): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    await settle();
  }
}

function itemElements(el: HTMLElement): HTMLElement[] {
  return [...el.querySelectorAll<HTMLElement>('[data-component="CarouselItem"]')];
}

function activeFlags(el: HTMLElement): string[] {
  return itemElements(el).map((item) => item.style.getPropertyValue('--carousel-item-active'));
}

describe('getClosestIndex', () => {
  it('returns the index of the closest number', () => {
    expect(getClosestIndex([0, 200, 400], 190)).toBe(1);
    expect(getClosestIndex([0, 200, 400], 10)).toBe(0);
    expect(getClosestIndex([0, 200, 400], 500)).toBe(2);
  });

  it('returns 0 for an empty list', () => {
    expect(getClosestIndex([], 42)).toBe(0);
  });
});

describe('slide positions', () => {
  it('centres each slide in its scroller, clamped to the scroll range', async () => {
    const { el } = await render({ count: 3 });
    const carousel = getInstance<Carousel>(el, 'Carousel');

    // Each slide fills the scroller, so centring is the same as aligning —
    // and the arithmetic is core's now, through `scrollPosition({ align })`.
    expect(carousel.positions.map((position) => position.left)).toEqual([0, 200, 400]);
  });
});

describe('Carousel — the index', () => {
  it('derives its length from the live slide collection', async () => {
    const { carousel } = await render({ count: 4 });
    expect(carousel.length).toBe(4);
    expect(carousel.maxIndex).toBe(3);
  });

  it('clamps at the ends by default', async () => {
    const { carousel } = await render({ count: 3 });

    await carousel.goPrev();
    expect(carousel.currentIndex).toBe(0);

    await carousel.goTo(99);
    expect(carousel.currentIndex).toBe(2);
  });

  it('wraps around with the `loop` boundary', async () => {
    const { carousel } = await render({ count: 3, attributes: 'data-option-boundary="loop"' });

    await carousel.goPrev();
    expect(carousel.currentIndex).toBe(2);

    await carousel.goNext();
    expect(carousel.currentIndex).toBe(0);
  });

  /**
   * Gap 2, hit again: v3 flips `isReverse` by writing `$options.reverse`, and
   * `$options` is a read-only view over attributes in v4. It is private state
   * seeded from the option here.
   */
  it('reflects the travel direction at a bound with the `bounce` boundary', async () => {
    const { carousel } = await render({ count: 3, attributes: 'data-option-boundary="bounce"' });

    await carousel.goNext();
    await carousel.goNext();
    expect(carousel.currentIndex).toBe(2);
    expect(carousel.isReverse).toBe(false);

    await carousel.goNext();
    expect(carousel.currentIndex).toBe(1);
    expect(carousel.isReverse).toBe(true);
  });

  it('resolves the named instructions', async () => {
    const { carousel } = await render({ count: 4 });

    await carousel.goTo('last');
    expect(carousel.currentIndex).toBe(3);

    await carousel.goTo('first');
    expect(carousel.currentIndex).toBe(0);
  });

  it('emits `index` only when the index really changed', async () => {
    const { el, carousel } = await render({ count: 3 });
    const seen: number[] = [];
    el.addEventListener('index', (event) => {
      seen.push((event as CustomEvent<{ index: number }>).detail.index);
    });

    await carousel.goTo(1);
    await carousel.goTo(1);
    await carousel.goTo(2);

    expect(seen).toEqual([1, 2]);
  });
});

describe('Carousel — the controls', () => {
  it('marks the first slide active on mount, with no navigation at all', async () => {
    const { el } = await render({ count: 3 });
    await settled();

    expect(activeFlags(el)).toEqual(['1', '0', '0']);
  });

  it('moves the active flag with the index', async () => {
    const { el, carousel } = await render({ count: 3 });

    await carousel.goTo(2);
    await settled();

    expect(activeFlags(el)).toEqual(['0', '0', '1']);
  });

  it('disables the prev button at the first slide and the next one at the last', async () => {
    const { el, carousel } = await render({
      count: 3,
      buttons: `
        <button data-component="CarouselBtn" data-option-action="prev"></button>
        <button data-component="CarouselBtn" data-option-action="next"></button>`,
    });
    await settled();

    const [prev, next] = [...el.querySelectorAll('button')];
    expect([prev.disabled, next.disabled]).toEqual([true, false]);

    await carousel.goTo(2);
    await settled();

    expect([prev.disabled, next.disabled]).toEqual([false, true]);
  });

  it('never disables a button with the `loop` boundary', async () => {
    const { el } = await render({
      count: 3,
      attributes: 'data-option-boundary="loop"',
      buttons: `<button data-component="CarouselBtn" data-option-action="prev"></button>`,
    });
    await settled();

    expect(el.querySelector('button')?.disabled).toBe(false);
  });

  it('navigates on a click', async () => {
    const { el, carousel } = await render({
      count: 3,
      buttons: `<button data-component="CarouselBtn" data-option-action="next"></button>`,
    });
    await settled();

    el.querySelector('button')?.click();

    expect(carousel.currentIndex).toBe(1);
  });

  it('goes to a numeric action', async () => {
    const { el, carousel } = await render({
      count: 4,
      buttons: `<button data-component="CarouselBtn" data-option-action="2"></button>`,
    });
    await settled();

    el.querySelector('button')?.click();

    expect(carousel.currentIndex).toBe(2);
  });

  /**
   * The whole of v3's `AbstractCarouselChild.__connect()` — retried from three
   * hooks — exists for this case. The context protocol replays to a pending
   * consumer, so the control simply waits.
   */
  it('connects a control that mounts before its carousel', async () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div>
        <button data-component="CarouselBtn" data-option-action="prev"></button>
      </div>`;
    document.body.append(root);
    await settled();

    const button = root.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(false);

    // The carousel arrives afterwards, around the control that is already there.
    const host = root.firstElementChild as HTMLElement;
    host.setAttribute('data-component', 'Carousel');
    host.insertAdjacentHTML(
      'afterbegin',
      `<div data-component="CarouselWrapper" style="${WRAPPER_STYLE}">${slides(3)}</div>`,
    );
    await settled();

    expect(button.disabled).toBe(true);
  });

  it('releases its subscription when the control leaves the DOM', async () => {
    const { el, carousel } = await render({
      count: 3,
      buttons: `<button data-component="CarouselBtn" data-option-action="next"></button>`,
    });
    await settled();
    const button = el.querySelector('button') as HTMLButtonElement;

    button.remove();
    await settled();
    await carousel.goTo(2);
    await settled();

    // Still the state it had when it left, rather than a post-teardown write.
    expect(button.disabled).toBe(false);
  });
});

describe('Carousel — live slides', () => {
  it('picks up a slide added after mount', async () => {
    const { el, carousel, wrapper } = await render({ count: 2 });
    await settled();
    expect(carousel.length).toBe(2);

    wrapper.insertAdjacentHTML(
      'beforeend',
      `<div data-component="CarouselItem" style="${ITEM_STYLE}"></div>`,
    );
    await settled();

    expect(carousel.length).toBe(3);
    expect(activeFlags(el)).toEqual(['1', '0', '0']);
  });

  it('re-normalises the index when the slide it points at is removed', async () => {
    const { carousel, wrapper } = await render({ count: 3 });
    await carousel.goTo(2);
    await settled();
    expect(carousel.currentIndex).toBe(2);

    wrapper.lastElementChild?.remove();
    await settled();

    expect(carousel.length).toBe(2);
    expect(carousel.currentIndex).toBe(1);
  });

  it('re-enables a next button once slides are appended past the end', async () => {
    const { el, carousel, wrapper } = await render({
      count: 2,
      buttons: `<button data-component="CarouselBtn" data-option-action="next"></button>`,
    });
    await carousel.goTo(1);
    await settled();
    const next = el.querySelector('button') as HTMLButtonElement;
    expect(next.disabled).toBe(true);

    wrapper.insertAdjacentHTML(
      'beforeend',
      `<div data-component="CarouselItem" style="${ITEM_STYLE}"></div>`,
    );
    await settled();

    expect(next.disabled).toBe(false);
  });

  it('re-measures the slide positions when the list changes', async () => {
    const { carousel, wrapper } = await render({ count: 2 });
    await settled();
    expect(carousel.positions).toHaveLength(2);

    wrapper.insertAdjacentHTML(
      'beforeend',
      `<div data-component="CarouselItem" style="${ITEM_STYLE}"></div>`,
    );
    await settled();

    expect(carousel.positions.map(({ left }) => left)).toEqual([0, 200, 400]);
  });
});

describe('Carousel — the wrapper', () => {
  it('scrolls to the slide it was sent to', async () => {
    const { carousel, wrapper } = await render({ count: 3 });

    await carousel.goTo(2);
    await settled(20);

    expect(wrapper.scrollLeft).toBe(400);
  });

  it('reports the closest slide on a scroll, without scrolling back', async () => {
    const { carousel, wrapper } = await render({ count: 3 });
    await settled();

    wrapper.scrollTo({ left: 400, behavior: 'instant' });
    await settled();

    expect(carousel.currentIndex).toBe(2);
    expect(wrapper.scrollLeft).toBe(400);
  });

  it('publishes its progress from 0 to 1', async () => {
    const { el, carousel, wrapper } = await render({ count: 3 });
    await settled();
    expect(carousel.progress).toBe(0);

    wrapper.scrollTo({ left: 400, behavior: 'instant' });
    await settled();

    expect(carousel.progress).toBe(1);
    expect(el.style.getPropertyValue('--carousel-progress')).toBe('1');
  });

  it('emits `progress` while it changes and stops the loop once it settles', async () => {
    const { el, carousel, wrapper } = await render({ count: 3 });
    await settled();
    const seen: number[] = [];
    el.addEventListener('progress', (event) => {
      seen.push((event as unknown as CustomEvent<{ progress: number }>).detail.progress);
    });

    wrapper.scrollTo({ left: 200, behavior: 'instant' });
    await settled();

    expect(seen.at(-1)).toBeCloseTo(0.5, 5);
    expect(carousel.$services.ticked.isActive).toBe(false);
  });

  it('holds no frame loop once the progress has settled', async () => {
    const { carousel } = await render({ count: 3 });
    await settled();

    expect(carousel.$services.ticked.isActive).toBe(false);
  });

  it('does nothing on `scrollToIndex` for a slide that does not exist', async () => {
    const { carousel, wrapper } = await render({ count: 2 });
    await settled();

    carousel.wrapper?.scrollToIndex(9);
    await settled();

    expect(wrapper.scrollLeft).toBe(0);
  });
});

describe('Carousel — the drag track', () => {
  /**
   * `withMountOnMediaQuery(..., '(pointer: fine)')` is `mountStrategy:
   * 'media:(pointer: fine)'`, so whether the track exists is now the
   * registry's decision rather than a wrapped constructor's.
   */
  it('declares its media query through the mount strategy', () => {
    expect(CarouselDrag.config.mountStrategy).toBe('media:(pointer: fine)');
  });

  it('mounts only when the media query matches', async () => {
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-component="Carousel">
        <div data-component="CarouselWrapper CarouselDrag" style="${WRAPPER_STYLE}">${slides(3)}</div>
      </div>`;
    document.body.append(root);
    await settled();

    const track = root.querySelector('[data-component~="CarouselDrag"]') as HTMLElement;
    const matches = window.matchMedia('(pointer: fine)').matches;

    expect(Boolean(getInstance<CarouselDrag>(track, 'CarouselDrag'))).toBe(matches);
  });
});

describe('Carousel — orientation', () => {
  it('defaults to horizontal', async () => {
    const { carousel } = await render({ count: 3 });
    expect(carousel.isHorizontal).toBe(true);
    expect(carousel.isVertical).toBe(false);
  });

  it('reads the `axis` option', async () => {
    const { carousel } = await render({ count: 3, attributes: 'data-option-axis="y"' });
    expect(carousel.isVertical).toBe(true);
    expect(carousel.state.value.isHorizontal).toBe(false);
  });

  it('hands the orientation to its children through the context', async () => {
    const { el } = await render({ count: 3, attributes: 'data-option-axis="y"' });
    await settled();
    const wrapper = getInstance<CarouselWrapper>(
      el.querySelector('[data-component~="CarouselWrapper"]') as HTMLElement,
      'CarouselWrapper',
    );

    expect(wrapper.isVertical).toBe(true);
  });

  it('defaults a component with no carousel above it to horizontal', async () => {
    const root = document.createElement('div');
    root.innerHTML = `<div data-component="CarouselWrapper" style="${WRAPPER_STYLE}"></div>`;
    document.body.append(root);
    await settled();

    const wrapper = getInstance<CarouselWrapper>(
      root.firstElementChild as HTMLElement,
      'CarouselWrapper',
    );
    expect(wrapper.isHorizontal).toBe(true);
    expect(wrapper.carousel).toBeUndefined();
  });
});
