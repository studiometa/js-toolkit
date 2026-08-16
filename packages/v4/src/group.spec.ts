import { afterEach, describe, expect, it } from 'vitest';
import { Base, type BaseConfig, type BaseProps, type MountedReturn } from './Base.js';
import { createContext, type Signal } from './context.js';
import { subscribeContext } from './context-subscription.js';
import { createGroup, type Group } from './group.js';
import { registerComponents } from './registry.js';
import { getInstance, resetDom, settle } from './test-utils.js';

afterEach(resetDom);

/** A member stand-in for the unit tests, which need an element and nothing else. */
function member(el: Element): { $el: Element } {
  return { $el: el };
}

describe('createGroup', () => {
  it('publishes the roster in document order whatever the join order', () => {
    const root = document.createElement('div');
    root.innerHTML = '<i></i><i></i><i></i>';
    document.body.append(root);
    const [first, second, third] = [...root.children].map((el) => member(el));

    const group = createGroup();
    group.join(third);
    group.join(first);
    group.join(second);

    expect(group.members.value).toEqual([first, second, third]);
  });

  it('removes a member through the leave function it returned', () => {
    const el = document.createElement('div');
    const only = member(el);
    const group = createGroup();

    const leave = group.join(only);
    expect(group.members.value).toEqual([only]);
    leave();
    expect(group.members.value).toEqual([]);
  });

  it('treats membership as a set', () => {
    const el = document.createElement('div');
    const only = member(el);
    const group = createGroup();
    const rosters: ReadonlyArray<unknown>[] = [];
    group.members.subscribe((value) => rosters.push(value));

    const leave = group.join(only);
    group.join(only);
    leave();
    leave();

    // One join and one leave, whatever the number of calls.
    expect(rosters).toEqual([[only], []]);
  });

  it('publishes a new array on every change', () => {
    const root = document.createElement('div');
    root.innerHTML = '<i></i><i></i>';
    document.body.append(root);
    const [a, b] = [...root.children].map((el) => member(el));
    const group = createGroup();

    group.join(a);
    const before = group.members.value;
    group.join(b);

    expect(group.members.value).not.toBe(before);
    expect(before).toEqual([a]);
  });
});

// -----------------------------------------------------------------------------
// The Disclosure pattern: a group and its members finding each other with no
// mount order guarantee, using only `createGroup()`, `$provide()` and
// `subscribeContext()`.
// -----------------------------------------------------------------------------

/**
 * What the group exposes to its members: the roster to read and one command.
 * The invariant stays with the coordinator; a member only asks.
 */
interface DisclosureGroupApi {
  readonly members: Signal<readonly Disclosure[]>;
  join(member: Disclosure): () => void;
  open(member: Disclosure): void;
}

const DisclosureGroupContext = createContext<DisclosureGroupApi>('DisclosureGroup');

interface DisclosureProps extends BaseProps {
  $refs: { trigger: HTMLButtonElement; panel: HTMLElement };
  $options: { open: boolean };
}

/** A disclosure that works alone and defers to its nearest group when one exists. */
class Disclosure extends Base<DisclosureProps> {
  static config: BaseConfig = {
    name: 'Disclosure',
    refs: ['trigger', 'panel'],
    options: { open: Boolean },
  };

  group?: DisclosureGroupApi;

  isOpen = false;

  mounted(): MountedReturn {
    this.setOpen(this.$options.open);

    // The nearest group, whenever it appears. Joining is the answer, leaving is
    // its teardown, so a nearer group mounting later takes over without either
    // side knowing the other's mount order.
    return subscribeContext(this.$el, DisclosureGroupContext, (group) => {
      this.group = group;
      const leave = group.join(this);
      return () => {
        leave();
        this.group = undefined;
      };
    });
  }

  onTriggerClick(): void {
    this.toggle();
  }

  toggle(): void {
    if (this.isOpen) {
      this.setOpen(false);
    } else if (this.group) {
      this.group.open(this);
    } else {
      this.setOpen(true);
    }
  }

  setOpen(open: boolean): void {
    this.isOpen = open;
    this.$refs.panel.hidden = !open;
    this.$refs.trigger.setAttribute('aria-expanded', String(open));
  }
}

interface DisclosureGroupProps extends BaseProps {
  $options: { multiple: boolean };
}

/** Owns the group invariant and nothing of its members' markup or lifecycle. */
class DisclosureGroup extends Base<DisclosureGroupProps> {
  static config: BaseConfig = {
    name: 'DisclosureGroup',
    options: { multiple: Boolean },
  };

  #peers: Group<Disclosure> = createGroup<Disclosure>();

  // Provided during construction, so a member that mounts first still resolves it.
  api: DisclosureGroupApi = this.$provide<DisclosureGroupApi>(DisclosureGroupContext, {
    members: this.#peers.members,
    join: (peer) => this.#peers.join(peer),
    open: (peer) => this.open(peer),
  });

  get members(): readonly Disclosure[] {
    return this.#peers.members.value;
  }

  /** A peer arriving or leaving can break the invariant, so re-check the roster. */
  mounted(): MountedReturn {
    return this.#peers.members.subscribe(() => this.reconcile(), { immediate: true });
  }

  open(peer: Disclosure): void {
    if (!this.$options.multiple) {
      for (const other of this.members) {
        if (other !== peer) {
          other.setOpen(false);
        }
      }
    }
    peer.setOpen(true);
  }

  /**
   * Document order decides which peer keeps its open state, so the outcome does
   * not depend on which one mounted first.
   */
  reconcile(): void {
    if (this.$options.multiple) {
      return;
    }
    const [, ...extra] = this.members.filter((peer) => peer.isOpen);
    for (const peer of extra) {
      peer.setOpen(false);
    }
  }
}

registerComponents(Disclosure, DisclosureGroup);

function disclosureMarkup(id: string, open = false): string {
  return `
    <div id="${id}" data-component="Disclosure"${open ? ' data-option-open' : ''}>
      <button data-ref="trigger"></button>
      <div data-ref="panel"></div>
    </div>
  `;
}

async function render(html: string): Promise<HTMLElement> {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.append(root);
  await settle();
  return root;
}

function disclosure(root: ParentNode, id: string): Disclosure {
  return getInstance<Disclosure>(root.querySelector(`#${id}`), 'Disclosure');
}

function group(root: ParentNode, id: string): DisclosureGroup {
  return getInstance<DisclosureGroup>(root.querySelector(`#${id}`), 'DisclosureGroup');
}

describe('a group of disclosures', () => {
  it('collects its members in document order', async () => {
    const root = await render(`
      <div id="grp" data-component="DisclosureGroup">
        ${disclosureMarkup('a')}
        ${disclosureMarkup('b')}
      </div>
    `);

    expect(group(root, 'grp').members).toEqual([disclosure(root, 'a'), disclosure(root, 'b')]);
    expect(disclosure(root, 'a').group).toBe(group(root, 'grp').api);
  });

  it('keeps one open at a time', async () => {
    const root = await render(`
      <div id="grp" data-component="DisclosureGroup">
        ${disclosureMarkup('a')}
        ${disclosureMarkup('b')}
      </div>
    `);
    const a = disclosure(root, 'a');
    const b = disclosure(root, 'b');

    a.$refs.trigger.click();
    expect([a.isOpen, b.isOpen]).toEqual([true, false]);
    b.$refs.trigger.click();
    expect([a.isOpen, b.isOpen]).toEqual([false, true]);
  });

  it('works with no group above it', async () => {
    const root = await render(disclosureMarkup('lonely'));
    const lonely = disclosure(root, 'lonely');

    expect(lonely.group).toBeUndefined();
    lonely.$refs.trigger.click();
    expect(lonely.isOpen).toBe(true);
  });

  it('lets an open peer that mounts later lose to the one before it in the DOM', async () => {
    const root = await render(`
      <div id="grp" data-component="DisclosureGroup">
        ${disclosureMarkup('a', true)}
      </div>
    `);
    const a = disclosure(root, 'a');
    expect(a.isOpen).toBe(true);

    // The late peer follows `a` in the DOM, so `a` keeps the open state.
    root.querySelector('#grp')?.insertAdjacentHTML('beforeend', disclosureMarkup('b', true));
    await settle();
    const b = disclosure(root, 'b');

    expect(group(root, 'grp').members).toEqual([a, b]);
    expect([a.isOpen, b.isOpen]).toEqual([true, false]);
  });

  it('lets an open peer that mounts later win when it precedes the others', async () => {
    const root = await render(`
      <div id="grp" data-component="DisclosureGroup">
        ${disclosureMarkup('b', true)}
      </div>
    `);
    const b = disclosure(root, 'b');
    expect(b.isOpen).toBe(true);

    // Same late mount, opposite document position: the newcomer wins instead.
    root.querySelector('#grp')?.insertAdjacentHTML('afterbegin', disclosureMarkup('a', true));
    await settle();
    const a = disclosure(root, 'a');

    expect(group(root, 'grp').members).toEqual([a, b]);
    expect([a.isOpen, b.isOpen]).toEqual([true, false]);
  });

  it('joins a group that mounts after its members', async () => {
    const root = await render(`
      <div id="grp">
        ${disclosureMarkup('a')}
        ${disclosureMarkup('b')}
      </div>
    `);
    const a = disclosure(root, 'a');
    expect(a.group).toBeUndefined();

    root.querySelector('#grp')?.setAttribute('data-component', 'DisclosureGroup');
    await settle();

    expect(a.group).toBe(group(root, 'grp').api);
    expect(group(root, 'grp').members).toEqual([a, disclosure(root, 'b')]);
  });

  it('gives a nested group its own members', async () => {
    const root = await render(`
      <div id="outer" data-component="DisclosureGroup">
        ${disclosureMarkup('o', true)}
        <div id="inner" data-component="DisclosureGroup">
          ${disclosureMarkup('i')}
        </div>
      </div>
    `);
    const outer = group(root, 'outer');
    const inner = group(root, 'inner');
    const o = disclosure(root, 'o');
    const i = disclosure(root, 'i');

    expect(outer.members).toEqual([o]);
    expect(inner.members).toEqual([i]);

    // The nested member's open state is the inner group's business only.
    i.$refs.trigger.click();
    expect([o.isOpen, i.isOpen]).toEqual([true, true]);
  });

  it('hands a member over to a nearer group inserted later', async () => {
    const root = await render(`
      <div id="outer" data-component="DisclosureGroup">
        ${disclosureMarkup('a')}
        ${disclosureMarkup('b')}
      </div>
    `);
    const outer = group(root, 'outer');
    const b = disclosure(root, 'b');
    expect(outer.members).toHaveLength(2);

    const inner = document.createElement('div');
    inner.id = 'inner';
    inner.setAttribute('data-component', 'DisclosureGroup');
    root.querySelector('#outer')?.append(inner);
    inner.append(b.$el);
    await settle();

    // The same instance changed hands: the subscription was re-answered, the
    // member was not destroyed and rebuilt.
    expect(disclosure(root, 'b')).toBe(b);
    expect(outer.members).toEqual([disclosure(root, 'a')]);
    expect(group(root, 'inner').members).toEqual([disclosure(root, 'b')]);
  });

  it('drops a member whose element leaves the DOM', async () => {
    const root = await render(`
      <div id="grp" data-component="DisclosureGroup">
        ${disclosureMarkup('a')}
        ${disclosureMarkup('b')}
      </div>
    `);
    const a = disclosure(root, 'a');

    disclosure(root, 'b').$el.remove();
    await settle();

    expect(group(root, 'grp').members).toEqual([a]);
  });
});
