/**
 * v3 against the v4 prototype, on the operations the v4 design makes
 * claims about.
 *
 * Setup mounts through each version's own path — v3's `$mount()` is
 * awaited, v4's instances are mounted directly — so both sides really
 * hold the same tree before anything is measured. What the benchmarks
 * then compare is the work per operation.
 *
 * Nothing here may touch global framework state: `defineFeatures()` and
 * friends mutate a module-level map, and everything in this file shares
 * one realm, so a global set here would follow every benchmark below it.
 */
import { bench, describe } from 'vitest';
import { Base as BaseV3, type BaseConfig } from '@studiometa/js-toolkit';
import { queryComponentAll, closestComponent } from '#private/helpers/queryComponent.js';
import { Base as BaseV4 } from '../../../v4/src/index.js';

// --- v3 components -----------------------------------------------------

class ItemV3 extends BaseV3 {
  static config: BaseConfig = { name: 'Item', refs: ['label'] };
  onClick() {}
}

class ListV3 extends BaseV3 {
  static config: BaseConfig = {
    name: 'List',
    refs: ['title', 'rows[]'],
    components: { Item: ItemV3 },
    options: { speed: { type: Number, default: 1 } },
  };
  onItemClick() {}
  onTitleClick() {}
}

// --- v4 components -----------------------------------------------------

class ItemV4 extends BaseV4 {
  static config = { name: 'Item', refs: ['label'] };
  onClick() {}
}

class ListV4 extends BaseV4 {
  static config = {
    name: 'List',
    refs: ['title', 'rows[]'],
    components: { Item: ItemV4 },
    options: { speed: { type: Number, default: 1 } },
  };
  onItemClick() {}
  onTitleClick() {}
}

/**
 * A list with `count` item components, each holding a ref, plus the
 * list's own refs.
 */
function createList(count: number): HTMLElement {
  const el = document.createElement('div');
  el.dataset.component = 'List';
  el.innerHTML = `
    <h2 data-ref="title">title</h2>
    ${Array.from(
      { length: count },
      () => `
      <div data-component="Item" data-ref="rows">
        <span data-ref="label">label</span>
      </div>`,
    ).join('')}
  `;
  document.body.append(el);
  return el;
}

const CHILDREN = 25;

// v3 mounts asynchronously, so every v3 fixture is built once here with a
// top-level await. Doing it in a hook is not an option: vitest does not run
// `beforeAll` in benchmark mode, and forcing v3 to mount synchronously means
// setting the global `blocking` feature, which would follow every other
// benchmark in the suite.
const refsListV3 = await new ListV3(createList(CHILDREN)).$mount();
const queryListV3 = createList(CHILDREN);
await new ListV3(queryListV3).$mount();
const closestListV3 = createList(CHILDREN);
await new ListV3(closestListV3).$mount();
const closestFromV3 = closestListV3.querySelector<HTMLElement>('[data-component="Item"]')!;
const emitListV3 = createList(1);
await new ListV3(emitListV3).$mount();
const itemV3 = emitListV3
  .querySelector<HTMLElement>('[data-component="Item"]')!
  .__base__?.get('Item') as ItemV3;

/**
 * Mounting a whole tree costs milliseconds where everything else here
 * costs microseconds, so these two are sampled for a fixed short window.
 * Left to run to the default duration they dominate the suite's wall time
 * and, with files sampled in parallel, skew their neighbours.
 */
const HEAVY = { time: 200 };

describe('mount a list of 25 children', () => {
  bench(
    'v3',
    async () => {
      const el = createList(CHILDREN);
      await new ListV3(el).$mount();
      el.remove();
    },
    HEAVY,
  );

  bench(
    'v4',
    () => {
      const el = createList(CHILDREN);
      // v4's children are the registry's job rather than the parent's, so
      // they are mounted here too — otherwise this would compare a whole
      // tree against a single component.
      new ListV4(el).$mount();
      for (const child of el.querySelectorAll<HTMLElement>('[data-component="Item"]')) {
        new ItemV4(child).$mount();
      }
      el.remove();
    },
    HEAVY,
  );
});

describe('config access', () => {
  const listV3 = new ListV3(createList(0));
  const listV4 = new ListV4(createList(0));

  // v3 walks the prototype chain on every access; v4 caches per class.
  bench('v3 __config', () => {
    void listV3.__config;
  });

  bench('v4 $config', () => {
    void listV4.$config;
  });
});

describe('ref access', () => {
  const elV4 = createList(CHILDREN);
  const listV4 = new ListV4(elV4).$mount();

  // v3 resolved its refs once at mount, so this is a property read; v4
  // re-reads the DOM to stay live through markup swaps. This is the cost
  // of dropping `$update()`.
  bench('v3 single ref', () => {
    void refsListV3.$refs.title;
  });

  bench('v4 single ref', () => {
    void listV4.$refs.title;
  });

  bench('v3 ref list (25)', () => {
    void refsListV3.$refs.rows;
  });

  bench('v4 ref list (25)', () => {
    void listV4.$refs.rows;
  });
});

describe('descendant resolution (25 children)', () => {
  // Both sides must really hold 25 mounted children, or the two queries
  // are not answering the same question. In blocking mode v3 mounts its
  // children as part of the parent; v4's are the registry's job.
  const elV4 = createList(CHILDREN);
  const listV4 = new ListV4(elV4).$mount();
  for (const child of elV4.querySelectorAll<HTMLElement>('[data-component="Item"]')) {
    new ItemV4(child).$mount();
  }

  bench('v3 queryComponentAll', () => {
    queryComponentAll('Item', { from: queryListV3 });
  });

  bench('v4 $query', () => {
    listV4.$query('Item');
  });
});

describe('ancestor resolution', () => {
  const elV4 = createList(CHILDREN);
  new ListV4(elV4).$mount();
  const firstV4 = elV4.querySelector<HTMLElement>('[data-component="Item"]')!;
  const itemV4 = new ItemV4(firstV4).$mount();

  bench('v3 closestComponent', () => {
    closestComponent('List', { from: closestFromV3 });
  });

  bench('v4 $closest', () => {
    itemV4.$closest('List');
  });
});

describe('event dispatch to a parent', () => {
  const elV4 = createList(1);
  new ListV4(elV4).$mount();
  const itemElV4 = elV4.querySelector<HTMLElement>('[data-component="Item"]')!;
  const itemV4 = new ItemV4(itemElV4).$mount();

  // v3 dispatches a non-bubbling event the parent bound per child; v4
  // dispatches a bubbling one the parent resolves by delegation.
  bench('v3 $emit', () => {
    itemV3.$emit('change');
  });

  bench('v4 $emit', () => {
    itemV4.$emit('change');
  });
});
