import { afterEach, describe, expect, it } from 'vitest';
import { registerComponents } from '../../src/index.js';
import { countRequestedFrames, getInstance, resetDom, settle } from '../../src/test-utils.js';
import { Cursor } from './Cursor.js';

registerComponents(Cursor);

/** The pointer service is page-wide, so a spec must put the button back up. */
afterEach(async () => {
  document.body.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
  await resetDom();
});

async function render(html: string): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  await settle();
  return root;
}

async function mountCursor(
  attributes = '',
  inner = '',
): Promise<{ root: HTMLElement; instance: Cursor }> {
  const root = await render(
    `<div data-component="Cursor" style="position:fixed;top:0;left:0;width:20px;height:20px" ${attributes}>${inner}</div>`,
  );
  return { root, instance: getInstance<Cursor>(root.firstElementChild as HTMLElement, 'Cursor') };
}

function movePointer(target: EventTarget, x: number, y: number, buttons = 0): void {
  target.dispatchEvent(
    new PointerEvent('pointermove', {
      clientX: x,
      clientY: y,
      buttons,
      bubbles: true,
      composed: true,
    }),
  );
}

/** Let the frame loop run for a few frames. */
async function ticked(count = 12): Promise<void> {
  for (let i = 0; i < count; i += 1) {
    await settle();
  }
}

describe('Cursor', () => {
  it('renders its identity transform on mount', async () => {
    const { instance } = await mountCursor();

    expect(instance.$el.style.transform).toContain('matrix(0, 0, 0, 0, 0, 0)');
  });

  it('records the pointer position when the pointer moves', async () => {
    const { instance } = await mountCursor();

    movePointer(document, 120, 80);
    await settle();

    expect(instance.pointerX).toBe(120);
    expect(instance.pointerY).toBe(80);
  });

  it('damps its way to the pointer instead of jumping there', async () => {
    const { instance } = await mountCursor();

    movePointer(document, 200, 100);
    await settle();

    // One frame in, it has started but not arrived.
    expect(instance.x).toBeGreaterThan(0);
    expect(instance.x).toBeLessThan(200);

    await ticked();

    expect(instance.x).toBe(200);
    expect(instance.y).toBe(100);
  });

  it('grows over an element matching `growSelectors`', async () => {
    const { root, instance } = await mountCursor(
      '',
      '<a href="#x" id="grow" style="display:block;width:10px;height:10px"></a>',
    );
    const link = root.querySelector('#grow') as HTMLElement;

    movePointer(link, 5, 5);
    await settle();

    expect(instance.pointerScale).toBe(2);
  });

  it('shrinks over an element matching `shrinkSelectors`', async () => {
    const { root, instance } = await mountCursor(
      '',
      '<span data-cursor-shrink id="shrink" style="display:block;width:10px;height:10px"></span>',
    );
    const target = root.querySelector('#shrink') as HTMLElement;

    movePointer(target, 5, 5);
    await settle();

    expect(instance.pointerScale).toBe(0.5);
  });

  it('shrinks while the pointer is down, whatever it is over', async () => {
    const { instance } = await mountCursor();

    // `isDown` comes from `pointerdown`, not from a move's `buttons`.
    document.body.dispatchEvent(
      new PointerEvent('pointerdown', {
        clientX: 40,
        clientY: 40,
        button: 0,
        buttons: 1,
        bubbles: true,
      }),
    );
    movePointer(document.body, 41, 41, 1);
    await settle();

    expect(instance.pointerScale).toBe(0.5);
  });

  it('keeps the base `scale` over anything else', async () => {
    const { instance } = await mountCursor('data-option-scale="3"');

    movePointer(document.body, 40, 40);
    await settle();

    expect(instance.pointerScale).toBe(3);
  });

  /**
   * Gap 1 consumed. v3 spells this `$services.enable`/`disable('ticked')`; v4
   * has `withRaf(..., { manual: true })` and a `Toggle`, and the point of both
   * is that an idle cursor holds no frame loop.
   */
  it('starts the frame loop on a move and stops it once it has caught up', async () => {
    const { instance } = await mountCursor();

    expect(instance.$services.ticked.isActive).toBe(false);

    movePointer(document, 150, 150);
    await settle();
    expect(instance.$services.ticked.isActive).toBe(true);

    await ticked();

    expect(instance.$services.ticked.isActive).toBe(false);
  });

  it('requests no frames at all while nothing moves', async () => {
    await mountCursor();

    const requested = await countRequestedFrames(async () => {
      await ticked(4);
    });

    expect(requested).toBe(0);
  });

  it('releases the frame loop when the element leaves the DOM mid-flight', async () => {
    const { root, instance } = await mountCursor();

    movePointer(document, 300, 300);
    await settle();
    expect(instance.$services.ticked.isActive).toBe(true);

    root.remove();
    await settle();

    expect(instance.$services.ticked.isActive).toBe(false);
  });

  it('writes the damped position and scale into one matrix', async () => {
    const { instance } = await mountCursor('data-option-scale="1"');

    movePointer(document, 50, 25);
    await ticked();

    expect(instance.$el.style.transform).toContain('matrix(1, 0, 0, 1, 50, 25)');
  });

  it('resets its state when the component mounts again', async () => {
    const { root, instance } = await mountCursor();
    movePointer(document, 90, 90);
    await ticked();
    expect(instance.x).toBe(90);

    const other = document.createElement('section');
    document.body.append(other);
    other.append(root.firstElementChild as HTMLElement);
    await settle();

    const moved = getInstance<Cursor>(other.firstElementChild as HTMLElement, 'Cursor');
    expect(moved.x).toBe(0);
    expect(moved.$el.style.transform).toContain('matrix(0, 0, 0, 0, 0, 0)');
  });
});
