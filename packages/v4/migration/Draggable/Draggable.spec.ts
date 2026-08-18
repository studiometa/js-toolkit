import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Draggable, type DraggablePosition } from './Draggable.js';

registerComponents(Draggable);

const PARENT = 'position:absolute;top:0;left:0;width:400px;height:300px';
const TARGET = 'position:absolute;top:0;left:0;width:100px;height:50px';

afterEach(async () => {
  release();
  await resetDom();
});

async function render(attributes = ''): Promise<{
  root: HTMLElement;
  el: HTMLElement;
  target: HTMLElement;
  instance: Draggable;
}> {
  const root = document.createElement('div');
  root.innerHTML = `
    <div data-component="Draggable" style="${PARENT}" ${attributes}>
      <div data-ref="target" style="${TARGET}"></div>
    </div>`;
  document.body.append(root);
  await settle();
  const el = root.firstElementChild as HTMLElement;
  return {
    root,
    el,
    target: el.querySelector('[data-ref="target"]') as HTMLElement,
    instance: getInstance<Draggable>(el, 'Draggable'),
  };
}

function grab(el: HTMLElement, x: number, y: number): void {
  el.dispatchEvent(
    new PointerEvent('pointerdown', {
      button: 0,
      buttons: 1,
      clientX: x,
      clientY: y,
      pointerType: 'mouse',
      bubbles: true,
    }),
  );
}

function move(x: number, y: number): void {
  document.dispatchEvent(
    new PointerEvent('pointermove', {
      buttons: 1,
      clientX: x,
      clientY: y,
      pointerType: 'mouse',
    }),
  );
}

function release(): void {
  window.dispatchEvent(new PointerEvent('pointerup'));
}

/** Let the drag service, the frame loop and the scheduler lanes run. */
async function settled(count = 12): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    await settle();
  }
}

/** Collect the drag lifecycle events the component emits. */
function record(root: EventTarget): Array<{ type: string; detail: DraggablePosition }> {
  const events: Array<{ type: string; detail: DraggablePosition }> = [];
  for (const type of [
    'drag-start',
    'drag-drag',
    'drag-drop',
    'drag-inertia',
    'drag-stop',
    'drag-fit',
    'drag-render',
  ]) {
    root.addEventListener(type, (event) => {
      events.push({ type, detail: { ...(event as CustomEvent<DraggablePosition>).detail } });
    });
  }
  return events;
}

describe('Draggable — geometry', () => {
  it('reads a single margin value into all four sides', async () => {
    const { instance } = await render('data-option-margin="10"');
    expect(instance.margin).toEqual({ top: 10, right: 10, bottom: 10, left: 10 });
  });

  it('reads a two-value margin as vertical then horizontal', async () => {
    const { instance } = await render('data-option-margin="10 20"');
    expect(instance.margin).toEqual({ top: 10, right: 20, bottom: 10, left: 20 });
  });

  it('reads a three-value margin as top, horizontal, bottom', async () => {
    const { instance } = await render('data-option-margin="10 20 30"');
    expect(instance.margin).toEqual({ top: 10, right: 20, bottom: 30, left: 20 });
  });

  it('reads a four-value margin clockwise from the top', async () => {
    const { instance } = await render('data-option-margin="10 20 30 40"');
    expect(instance.margin).toEqual({ top: 10, right: 20, bottom: 30, left: 40 });
  });

  it('derives the bounds from the target inside its parent', async () => {
    const { instance } = await render();
    // The target starts at the parent's origin, so it may only move right and down.
    const { xMin, xMax, yMin, yMax } = instance.bounds;
    expect([xMin, xMax, yMin, yMax]).toEqual([-0, 300, -0, 250]);
  });

  it('widens the bounds by the margin', async () => {
    const { instance } = await render('data-option-margin="10"');
    expect(instance.bounds).toEqual({ xMin: 10, xMax: 290, yMin: 10, yMax: 240 });
  });

  /**
   * `resized()` is bound to the **viewport**, exactly as v3's is: its
   * `$services` resize hook is the window one, so a change to the element's
   * own box was never what invalidated these bounds.
   */
  it('subscribes `resized()` for the mount cycle', async () => {
    const { instance } = await render();
    expect(instance.$services.resized.isActive).toBe(true);
  });

  it('measures again after a resize', async () => {
    const { el, instance } = await render();
    expect(instance.bounds.xMax).toBe(300);

    el.style.width = '600px';
    instance.resized();

    expect(instance.bounds.xMax).toBe(500);
  });

  /**
   * The bounds are a per-mount-cycle memo, not a per-instance one: a v4 move
   * is a destroy plus a mount, and the geometry it lands in is a different
   * one. v3 memoises for the instance's whole life, and no resize event
   * describes a target that changed size on its own.
   */
  it('measures again after the component is moved', async () => {
    const { el, target, instance } = await render();
    expect(instance.bounds.xMax).toBe(300);

    target.style.width = '200px';
    const other = document.createElement('div');
    document.body.append(other);
    other.append(el);
    await settled();

    expect(getInstance<Draggable>(el, 'Draggable').bounds.xMax).toBe(200);
  });
});

describe('Draggable — the drag', () => {
  it('emits the drag lifecycle, never the idle mode', async () => {
    const { el, target } = await render();
    const events = record(el);

    grab(target, 10, 10);
    move(60, 40);
    release();
    await settled();

    const types = events.map(({ type }) => type);
    expect(types).toContain('drag-start');
    expect(types).toContain('drag-drag');
    expect(types).toContain('drag-drop');
    expect(types).not.toContain('drag-idle');
  });

  it('follows the pointer by the distance the service publishes', async () => {
    const { target, instance } = await render();

    grab(target, 10, 10);
    move(90, 60);
    await settled();

    expect(instance.props.x).toBe(80);
    expect(instance.props.y).toBe(50);
    release();
  });

  it('resumes from where the previous drag left off', async () => {
    const { target, instance } = await render();

    grab(target, 10, 10);
    move(60, 10);
    release();
    await settled();
    const afterFirst = instance.props.x;

    grab(target, 0, 0);
    move(20, 0);
    await settled();

    expect(instance.props.x).toBe(afterFirst + 20);
    release();
  });

  it('writes the damped position onto the target', async () => {
    const { target, instance } = await render();

    grab(target, 10, 10);
    move(110, 10);
    await settled();

    expect(target.style.transform).toContain('translate3d(');
    expect(instance.props.dampedX).toBeGreaterThan(0);
    release();
  });

  it('leaves an axis alone when its option is off', async () => {
    const { target } = await render('data-option-no-y');

    grab(target, 10, 10);
    move(110, 110);
    await settled();

    expect(target.style.transform).toContain('0px, 0px)');
    release();
  });

  it('publishes the progress of each axis over the bounds', async () => {
    const { target, instance } = await render();

    grab(target, 0, 0);
    move(150, 125);
    await settled();

    expect(instance.props.progressX).toBeCloseTo(0.5, 5);
    expect(instance.props.progressY).toBeCloseTo(0.5, 5);
    release();
  });
});

describe('Draggable — the bounds', () => {
  it('clamps during the drag with `strictFitBounds`', async () => {
    const { target, instance } = await render('data-option-strict-fit-bounds');

    grab(target, 0, 0);
    move(900, 900);
    await settled();

    expect(instance.props.x).toBe(300);
    expect(instance.props.y).toBe(250);
    release();
  });

  it('lets the target escape without `strictFitBounds`', async () => {
    const { target, instance } = await render();

    grab(target, 0, 0);
    move(900, 0);
    await settled();

    expect(instance.props.x).toBe(900);
    release();
  });

  /**
   * Gap 1 again: the fit animation is a frame loop the component owns and
   * stops as soon as the damped position has arrived.
   */
  it('animates back inside the bounds on drop with `fitBounds`', async () => {
    const { el, target, instance } = await render('data-option-fit-bounds');
    const events = record(el);

    grab(target, 0, 0);
    move(900, 0);
    release();
    await settled(40);

    expect(instance.props.x).toBe(300);
    expect(instance.props.dampedX).toBe(300);
    expect(events.map(({ type }) => type)).toContain('drag-fit');
    expect(instance.$services.ticked.isActive).toBe(false);
  });

  it('holds no frame loop before a drop', async () => {
    const { instance } = await render('data-option-fit-bounds');

    expect(instance.$services.ticked.isActive).toBe(false);
  });

  it('releases the frame loop when the element leaves the DOM mid-fit', async () => {
    const { root, target, instance } = await render('data-option-fit-bounds');

    grab(target, 0, 0);
    move(900, 0);
    // `dragged()` runs synchronously from the pointer event, so the loop is
    // already running before the next frame.
    release();
    expect(instance.$services.ticked.isActive).toBe(true);

    root.remove();
    await settled();

    expect(instance.$services.ticked.isActive).toBe(false);
  });
});
