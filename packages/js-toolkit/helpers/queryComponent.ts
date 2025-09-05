import type { Base } from '../Base/index.js';
import { getInstances } from '../Base/index.js';
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
 * Get the first instance of component with the given query.
 */
export function queryComponent<T extends Base = Base>(
  query: string,
  options: QueryOptions = {},
): T | undefined {
  const parsedQuery = parseQuery(query);
  const { from = document } = options;
  const instances = getInstances() as Set<T>;

  for (const instance of instances) {
    if (!instanceIsMatching(instance, parsedQuery)) continue;
    if (from !== document && !(from === instance.$el || from.contains(instance.$el))) continue;

    return instance;
  }
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
  const instances = getInstances() as Set<T>;
  const selectedInstances = new Set<T>();

  for (const instance of instances) {
    if (!instanceIsMatching(instance, parsedQuery)) continue;
    if (from !== document && !(from === instance.$el || from.contains(instance.$el))) continue;

    selectedInstances.add(instance);
  }

  return Array.from(selectedInstances);
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
  const instances = getInstances() as Set<T>;
  let closestInstance = null;

  getAncestorWhere(from, (element) => {
    if (!element) return false;
    if (parsedQuery.cssSelector && !element.matches(parsedQuery.cssSelector)) return false;

    for (const instance of instances) {
      if (instanceIsMatching(instance, parsedQuery)) {
        closestInstance = instance;
        return true;
      }
    }

    return false;
  }) ?? undefined;

  return closestInstance ?? undefined;
}
