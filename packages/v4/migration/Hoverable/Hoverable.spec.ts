import { afterEach, describe, expect, it, vi } from 'vitest';
import { registerComponents, type ElementPointerProps, type RafProps } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Hoverable } from './Hoverable.js';

registerComponents(Hoverable);

afterEach(resetDom);

const PARENT = 'position:absolute;top:0;left:0;width:100px;height:100px';
const TARGET = 'position:absolute;top:10px;left:10px;width:20px;height:20px';

async function render(attributes = ''): Promise<{ el: HTMLElement; instance: Hoverable }> {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-component="Hoverable" style="${PARENT}" ${attributes}>
      <div data-ref="target" style="${TARGET}"></div>
    </div>`;
  document.body.append(root);
  await settle();
  const el = root.firstElementChild as HTMLElement;
  return { el, instance: getInstance<Hoverable>(el, 'Hoverable') };
}

function progress(x: number, y: number): ElementPointerProps {
  return { relativeProgressX: x, relativeProgressY: y } as ElementPointerProps;
}

function stubBounds(instance: Hoverable): void {
  vi.spyOn(instance, 'bounds', 'get').mockReturnValue({ xMin: 0, xMax: 100, yMin: 0, yMax: 100 });
}

describe('Hoverable', () => {
  it('exposes `target` and `parent` getters', async () => {
    const { el, instance } = await render();
    expect(instance.target).toBe(el.querySelector('[data-ref="target"]'));
    expect(instance.parent).toBe(el);
  });

  it('computes bounds from the real target and parent boxes', async () => {
    const { instance } = await render();
    expect(instance.bounds).toEqual({ xMin: -10, yMin: -10, xMax: 70, yMax: 70 });
  });

  it('maps pointer progress into bounds, clamped to 0–1', async () => {
    const { instance } = await render();
    stubBounds(instance);

    instance.moved(progress(0, 0));
    expect(instance.props).toMatchObject({ x: 0, y: 0 });

    instance.moved(progress(0.5, 0.5));
    expect(instance.props).toMatchObject({ x: 50, y: 50 });

    instance.moved(progress(1, 1));
    expect(instance.props).toMatchObject({ x: 100, y: 100 });

    // Past the box, progress is clamped rather than extrapolated.
    instance.moved(progress(1.5, 1.5));
    expect(instance.props).toMatchObject({ x: 100, y: 100 });
  });

  it('reverses direction when `reversed` is set', async () => {
    const { instance } = await render('data-option-reversed="true"');
    stubBounds(instance);

    instance.moved(progress(0, 0));
    expect(instance.props).toMatchObject({ x: 100, y: 100 });

    instance.moved(progress(1, 1));
    expect(instance.props).toMatchObject({ x: 0, y: 0 });
  });

  it('stops updating once the pointer leaves the box when `contained` is set', async () => {
    const { instance } = await render('data-option-contained="true"');
    stubBounds(instance);

    instance.moved(progress(0, 0));
    expect(instance.props).toMatchObject({ x: 0, y: 0 });

    instance.moved(progress(0.5, 1.5));
    expect(instance.props).toMatchObject({ x: 0, y: 0 });
  });

  it('damps toward the target position each frame and writes the transform', async () => {
    const { instance } = await render();
    stubBounds(instance);
    instance.moved(progress(0.5, 0.5));

    // A large elapsed time closes the gap past `damp()`'s snap precision.
    instance.ticked({ time: 0, delta: 5000 } as RafProps);
    await settle();

    expect(instance.target.style.transform).toBe('translate3d(50px, 50px, 0px)');
  });
});
