import type { Base, BaseEl } from '../Base/index.js';
import { getInstances, hasInstance } from '../Base/utils.js';
import { memo } from '../utils/memo.js';
import { getAncestorWhere } from '../utils/dom/ancestors.js';

export interface QueryOptions {
  from?: HTMLElement | Document;
}

type ComponentState = 'mounted' | 'destroyed' | 'terminated';
export type ParsedQuery = {
  name: string;
  cssSelector?: string;
  state?: string;
};

const REGEX_QUERY = /([a-zA-Z0-9]+)(\((.*)\))?(:([a-z]+))?/;

/**
 * Parse a query string like 'Foo(.css-selector):mounted' into its parts.
 */
export const parseQuery = memo((query: string): ParsedQuery => {
  const [, name, , cssSelector, , state] = query.match(REGEX_QUERY) as [
    string,
    string,
    string | undefined,
    string | undefined,
    string | undefined,
    ComponentState | undefined,
  ];

  return {
    name,
    cssSelector,
    state,
  };
});

export function instanceIsMatching(instance: Base, parsedQuery: ParsedQuery): boolean {
  if (instance.$config.name !== parsedQuery.name) return false;
  if (parsedQuery.cssSelector && !instance.$el.matches(parsedQuery.cssSelector)) return false;

  if (parsedQuery.state === 'mounted' && !instance.$isMounted) return false;
  if (parsedQuery.state === 'destroyed' && instance.$isMounted) return false;

  return true;
}

/**
 * Resolve the live instance attached to an element under a given name.
 *
 * Reads the element's `__base__` map (the same O(1)-per-element lookup
 * `closestComponent` uses) and applies the single matching gate:
 *   - the entry must exist and not be the literal `'terminated'` string
 *     written by `$terminate` (`Base.ts`);
 *   - the instance must still be "live" (registered in the global storage
 *     between `before-mounted` and `after-destroyed`) — `__base__` keeps
 *     destroyed-but-not-terminated instances that `getInstances()` has already
 *     dropped, so `hasInstance` preserves the historical visibility window;
 *   - it must satisfy `instanceIsMatching` (name, CSS selector, state).
 *
 * The lookup is keyed on `parsedQuery.name` only — never on a name-derived DOM
 * selector — because `__base__` membership is independent of whether the element
 * carries a `data-component` attribute or a `w-name` tag.
 */
function resolveMatch<T extends Base>(element: BaseEl, parsedQuery: ParsedQuery): T | undefined {
  const baseMap = element.__base__;
  if (!baseMap) return undefined;

  const instance = baseMap.get(parsedQuery.name);
  if (!instance || instance === 'terminated') return undefined;
  if (!hasInstance(instance) || !instanceIsMatching(instance, parsedQuery)) return undefined;

  return instance as T;
}

/**
 * Yield the instances matching the given query within the `from` root.
 *
 * When `from` is the document, there is no containment/attachment constraint, so
 * every live matching instance is returned even if its `$el` is detached from the
 * global document — the global instance storage is the source of truth here (a
 * `document.querySelectorAll` scan would miss detached elements entirely).
 *
 * When `from` is an element, matches are resolved via a scoped
 * `querySelectorAll('*')` descendant traversal plus an explicit check of `from`
 * itself (which `querySelectorAll` excludes), each resolved through its
 * `__base__` map. This scales with the size of the `from` subtree instead of the
 * global instance count. `'*'` is required — a name-derived selector would miss
 * components mounted on elements that carry no matching attribute/tag (e.g.
 * `withName(Base, name)` on a plain element, or a component registered under an
 * arbitrary CSS selector).
 */
function* queryMatches<T extends Base>(
  parsedQuery: ParsedQuery,
  from: HTMLElement | Document,
): Generator<T> {
  if (from === document) {
    for (const instance of getInstances()) {
      if (hasInstance(instance) && instanceIsMatching(instance, parsedQuery)) {
        yield instance as T;
      }
    }
    return;
  }

  const seen = new Set<T>();

  const selfMatch = resolveMatch<T>(from as BaseEl, parsedQuery);
  if (selfMatch) {
    seen.add(selfMatch);
    yield selfMatch;
  }

  for (const element of from.querySelectorAll<HTMLElement>('*')) {
    const match = resolveMatch<T>(element as BaseEl, parsedQuery);
    if (match && !seen.has(match)) {
      seen.add(match);
      yield match;
    }
  }
}

/**
 * Get the first instance of component with the given query.
 */
export function queryComponent<T extends Base = Base>(
  query: string,
  options: QueryOptions = {},
): T | undefined {
  const parsedQuery = parseQuery(query);
  const { from = document } = options;

  for (const instance of queryMatches<T>(parsedQuery, from)) {
    return instance;
  }

  return undefined;
}

/**
 * Get all instances of component with the given query.
 */
export function queryComponentAll<T extends Base = Base>(
  query: string,
  options: QueryOptions = {},
): T[] {
  const parsedQuery = parseQuery(query);
  const { from = document } = options;

  return Array.from(queryMatches<T>(parsedQuery, from));
}

/**
 * Get the closest component instance by traversing up the DOM tree.
 */
export function closestComponent<T extends Base = Base>(
  query: string,
  options: { from: HTMLElement } = { from: null },
): T | undefined {
  const { from } = options;
  const parsedQuery = parseQuery(query);
  let closestInstance: T | undefined;

  getAncestorWhere(from, (element) => {
    if (!element) return false;

    // Use the element's __base__ map for O(1) lookup by component name
    const baseMap = (element as BaseEl).__base__;
    if (!baseMap) return false;

    const instance = baseMap.get(parsedQuery.name) as T;
    if (
      instance &&
      instance !== ('terminated' as unknown) &&
      instanceIsMatching(instance, parsedQuery)
    ) {
      closestInstance = instance;
      return true;
    }

    return false;
  });

  return closestInstance;
}
