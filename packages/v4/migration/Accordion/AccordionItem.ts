import { Base } from '../../src/index.js';
import { transition, type ClassesOrStyles } from '../../src/utils/transition.js';

export type AccordionItemStates = Partial<Record<'open' | 'active' | 'closed', ClassesOrStyles>>;

export interface AccordionItemSettings {
  isOpen: boolean;
  styles: Record<string, AccordionItemStates>;
}

export interface AccordionItemProps {
  $refs: { btn: HTMLElement; content: HTMLElement; container: HTMLElement };
  $options: { isOpen: boolean; styles: Record<string, AccordionItemStates> };
  $emits: { open: void; close: void };
}

const ACCORDION_SELECTOR = '[data-component~="Accordion"]';

/** Read live ancestor defaults without depending on component mount order. */
function inheritedSettings(el: HTMLElement): Partial<AccordionItemSettings> {
  const accordion = el.parentElement?.closest(ACCORDION_SELECTOR);
  const raw = accordion?.getAttribute('data-option-item');
  if (!raw) {
    return {};
  }
  try {
    return JSON.parse(raw) as Partial<AccordionItemSettings>;
  } catch {
    return {};
  }
}

/** A collapsible panel with animated height and ARIA state. */
export class AccordionItem extends Base<AccordionItemProps> {
  static config = {
    name: 'AccordionItem',
    refs: ['btn', 'content', 'container'],
    options: {
      isOpen: Boolean,
      styles: { type: Object, default: () => ({}) as Record<string, AccordionItemStates> },
    },
  };

  #isOpen = false;

  get contentId(): string {
    return `content-${this.$id}`;
  }

  get isOpen(): boolean {
    return this.#isOpen;
  }

  /**
   * Own options merged under the ancestor Accordion's `item` defaults.
   */
  get settings(): AccordionItemSettings {
    const inherited = inheritedSettings(this.$el);
    return {
      isOpen: this.$el.hasAttribute('data-option-is-open')
        ? this.$options.isOpen
        : (inherited.isOpen ?? false),
      styles: { ...inherited.styles, ...this.$options.styles },
    };
  }

  /**
   * The refs that carry declared styles, `container` excluded — that one is
   * driven by the measured height instead.
   */
  get styledRefs(): Array<[HTMLElement, AccordionItemStates]> {
    const entries: Array<[HTMLElement, AccordionItemStates]> = [];
    for (const [name, states] of Object.entries(this.settings.styles)) {
      if (name === 'container') {
        continue;
      }
      const ref = (this.$refs as Record<string, HTMLElement | HTMLElement[]>)[name];
      if (ref instanceof HTMLElement) {
        entries.push([ref, states]);
      }
    }
    return entries;
  }

  mounted() {
    const { btn, content, container } = this.$refs;

    btn.setAttribute('id', this.$id);
    btn.setAttribute('aria-controls', this.contentId);
    content.setAttribute('aria-labelledby', this.$id);
    content.setAttribute('id', this.contentId);

    this.#isOpen = this.settings.isOpen;
    this.updateAttributes(this.#isOpen);

    for (const [ref, { open = '', closed = '' }] of this.styledRefs) {
      transition(ref, { to: this.#isOpen ? open : closed }, 'keep');
    }

    return () => {
      container.style.visibility = '';
      container.style.height = '';
    };
  }

  onBtnClick(): void {
    if (this.#isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  updateAttributes(isOpen: boolean): void {
    const { btn, content, container } = this.$refs;
    container.style.visibility = isOpen ? '' : 'hidden';
    container.style.height = isOpen ? '' : '0';
    content.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
    btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  async open(): Promise<void> {
    if (this.#isOpen) {
      return;
    }

    this.$emit('open');
    this.#isOpen = true;
    this.updateAttributes(true);

    const { container, content } = this.$refs;
    container.style.visibility = '';
    const { active } = this.settings.styles.container ?? {};

    await Promise.all([
      transition(container, {
        from: { height: '0' },
        active,
        to: { height: `${content.offsetHeight}px` },
      }).then(() => {
        // Only clear the style if the item was not closed again meanwhile.
        if (this.#isOpen) {
          content.style.position = '';
        }
      }),
      ...this.styledRefs.map(([ref, { open = '', active: refActive = '', closed = '' }]) =>
        transition(ref, { from: closed, active: refActive, to: open }, 'keep'),
      ),
    ]);
  }

  async close(): Promise<void> {
    if (!this.#isOpen) {
      return;
    }

    this.$emit('close');
    this.#isOpen = false;

    const { container, content } = this.$refs;
    const height = container.offsetHeight;
    content.style.position = 'absolute';
    const { active } = this.settings.styles.container ?? {};

    await Promise.all([
      transition(container, {
        from: { height: `${height}px` },
        active,
        to: { height: '0' },
      }).then(() => {
        if (!this.#isOpen) {
          container.style.height = '0';
          container.style.visibility = 'hidden';
          this.updateAttributes(false);
        }
      }),
      ...this.styledRefs.map(([ref, { open = '', active: refActive = '', closed = '' }]) =>
        transition(ref, { from: open, active: refActive, to: closed }, 'keep'),
      ),
    ]);
  }
}
