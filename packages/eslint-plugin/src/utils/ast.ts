/**
 * ESLint v9 compatible AST node types used across rules.
 * We use loose typings here since oxlint/eslint expose their own node types.
 */

export type Node = Record<string, any>;
export type RuleContext = Record<string, any>;

export type RuleMeta = {
  type?: 'problem' | 'suggestion' | 'layout';
  fixable?: 'code' | 'whitespace';
  hasSuggestions?: boolean;
  docs?: { description?: string };
  messages?: Record<string, string>;
  schema?: unknown[];
};

export function createRule<V extends Record<string, (node: Node) => unknown>>(rule: {
  meta?: RuleMeta;
  createOnce(context: RuleContext): V;
}): { meta?: RuleMeta; createOnce(context: RuleContext): V } {
  return rule;
}

export const LIFECYCLE_METHODS = new Set([
  'mounted',
  'destroyed',
  'updated',
  'terminated',
  'ticked',
  'scrolled',
  'resized',
  'moved',
  'loaded',
  'keyed',
]);

export const TOOLKIT_PACKAGE = '@studiometa/js-toolkit';

/**
 * Returns true if a class declaration extends an identifier imported from
 * @studiometa/js-toolkit, or extends a bare identifier named `Base`.
 *
 * This is a heuristic — we cannot do full type resolution in a lint rule.
 */
export function isBaseSubclass(node: Node, context: RuleContext): boolean {
  if (node.type !== 'ClassDeclaration' && node.type !== 'ClassExpression') {
    return false;
  }

  if (!node.superClass) {
    return false;
  }

  const superName = node.superClass.type === 'Identifier' ? node.superClass.name : null;

  if (!superName) {
    return false;
  }

  // Fast path: class extends Base
  if (superName === 'Base') {
    return true;
  }

  // Check if the superclass identifier is imported from @studiometa/js-toolkit
  const sourceCode = context.sourceCode ?? context.getSourceCode?.();
  const ast = sourceCode?.ast;

  if (!ast) {
    return false;
  }

  for (const node of ast.body) {
    if (node.type !== 'ImportDeclaration') continue;
    if (node.source.value !== TOOLKIT_PACKAGE) continue;

    for (const specifier of node.specifiers) {
      if (specifier.type === 'ImportSpecifier' && specifier.local.name === superName) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Returns true if the string is camelCase (starts lowercase, no separators).
 */
export function isCamelCase(value: string): boolean {
  return /^[a-z][a-zA-Z0-9]*$/.test(value);
}

/**
 * Returns true if the string is PascalCase.
 */
export function isPascalCase(value: string): boolean {
  return /^[A-Z][a-zA-Z0-9]*$/.test(value);
}

/**
 * Converts a kebab-case, snake_case or PascalCase string to camelCase.
 */
export function toCamelCase(value: string): string {
  return value
    .replace(/[-_](.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}

/**
 * Converts a kebab-case, snake_case or camelCase string to PascalCase.
 */
export function toPascalCase(value: string): string {
  return value
    .replace(/[-_](.)/g, (_, c: string) => c.toUpperCase())
    .replace(/^[a-z]/, (c) => c.toUpperCase());
}

/**
 * Walks up ancestor nodes to find the nearest class declaration/expression.
 */
export function findEnclosingClass(ancestors: Node[]): Node | null {
  for (let i = ancestors.length - 1; i >= 0; i--) {
    const node = ancestors[i];
    if (node.type === 'ClassDeclaration' || node.type === 'ClassExpression') {
      return node;
    }
  }
  return null;
}

/**
 * Returns the ancestors of a node, whichever accessor the runtime exposes.
 */
export function getAncestors(node: Node, context: RuleContext): Node[] {
  return context.getAncestors
    ? context.getAncestors()
    : (context.sourceCode?.getAncestors?.(node) ?? []);
}

/**
 * Returns true for the node types that open a new function scope.
 */
export function isFunctionNode(node: Node): boolean {
  return (
    node.type === 'FunctionDeclaration' ||
    node.type === 'FunctionExpression' ||
    node.type === 'ArrowFunctionExpression'
  );
}

/**
 * Walks every descendant node, depth first, calling `visit` on each.
 *
 * Returning `false` from `visit` skips the subtree of that node. Used by rules
 * which have to analyse a node the visitor will not hand them again, such as
 * the body of a method resolved from its call site.
 */
export function walk(node: Node, visit: (node: Node) => boolean | void): void {
  if (!node || typeof node.type !== 'string') return;

  if (visit(node) === false) return;

  for (const key of Object.keys(node)) {
    if (key === 'parent') continue;

    const value = node[key];

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item.type === 'string') walk(item, visit);
      }
    } else if (value && typeof value.type === 'string') {
      walk(value, visit);
    }
  }
}

/**
 * Returns the name of a class member key, for identifier and literal keys alike.
 */
export function getKeyName(node: Node): string | null {
  const key = node?.key;
  if (!key) return null;
  if (key.type === 'Identifier') return key.name;
  if (key.type === 'Literal' && typeof key.value === 'string') return key.value;
  return null;
}

/**
 * Returns true if a class member carries one of the named decorators, written
 * either bare (`@write`) or called (`@write()`).
 */
export function hasDecorator(node: Node, names: Set<string>): boolean {
  for (const decorator of node?.decorators ?? []) {
    const expression = decorator.expression;
    if (!expression) continue;
    if (expression.type === 'Identifier' && names.has(expression.name)) return true;
    if (
      expression.type === 'CallExpression' &&
      expression.callee?.type === 'Identifier' &&
      names.has(expression.callee.name)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Unwraps the type-argument application a v4 component writes on its
 * superclass, as in `extends withRaf(Base)<Props>`.
 */
function unwrapTypeArguments(node: Node): Node {
  return node?.type === 'TSInstantiationExpression' ? (node.expression ?? node) : node;
}

/**
 * The instance surface only a v4 component has.
 *
 * Reaching for one of these off `this` is the signal that a class extending
 * something unresolvable is a component rather than an ordinary subclass. The
 * lifecycle and service hook names are deliberately **not** in this set: they
 * are the very thing a rule like `no-write-in-read-phase` keys on, so counting
 * them as proof would make the test circular and let `class Store extends
 * Error { ticked() {} }` pass for a component.
 */
const COMPONENT_MEMBERS = new Set([
  '$el',
  '$refs',
  '$options',
  '$id',
  '$config',
  '$isMounted',
  '$emit',
  '$on',
  '$off',
  '$query',
  '$closest',
  '$watchChildren',
  '$provide',
  '$inject',
  '$injectSync',
  '$read',
  '$write',
  '$mount',
  '$destroy',
  '$services',
]);

/**
 * Returns true if the class body reaches for the framework surface off `this`.
 */
function usesComponentSurface(node: Node): boolean {
  let found = false;

  walk(node.body, (inner: Node) => {
    if (found) return false;

    // A nested class carries its own identity; do not read it as this one's.
    if (
      inner !== node.body &&
      (inner.type === 'ClassDeclaration' || inner.type === 'ClassExpression')
    ) {
      return false;
    }

    if (
      inner.type === 'MemberExpression' &&
      !inner.computed &&
      inner.object?.type === 'ThisExpression' &&
      COMPONENT_MEMBERS.has(inner.property?.name)
    ) {
      found = true;
      return false;
    }
  });

  return found;
}

/**
 * Returns true if a class looks like a v4 component.
 *
 * A component always extends something — `Base`, a `with<Service>(…)` mixin,
 * or a local abstract component — so a superclass is necessary. It is nowhere
 * near sufficient: `class Store extends Error` would read as a component, and
 * `prefer-instance-scheduler` would then tell it to call a `this.$read()` it
 * does not have, which is wrong advice rather than mere noise.
 *
 * Restricting to a list of known bases is not the answer either. `extends
 * AbstractCarouselChild`, `extends Indexable` and `extends AbstractPrefetch`
 * are the common shape in `@studiometa/ui`, and a single-file linter cannot
 * follow the chain to `Base`.
 *
 * So a superclass **plus** a second signal in the same class body: a
 * `@component({ … })` decorator, a `static config`, or use of the framework
 * surface off `this`. That keeps a subclass of a local abstract component —
 * which reads `this.$el` or emits — while rejecting a class that merely
 * extends something.
 *
 * Requiring the superclass is what keeps `Base` itself out. It declares
 * `static config` and defines the whole surface, but it extends nothing, and
 * the class defining `$read()` is not a class that should be told to call it.
 *
 * A component using none of the three anywhere in its body is missed, which
 * is the right way to be wrong: a false negative rather than advice that does
 * not apply.
 */
export function isComponentClass(node: Node): boolean {
  if (node?.type !== 'ClassDeclaration' && node?.type !== 'ClassExpression') {
    return false;
  }

  if (!unwrapTypeArguments(node.superClass)) {
    return false;
  }

  return (
    hasDecorator(node, new Set(['component'])) ||
    Boolean(findStaticConfig(node)) ||
    usesComponentSurface(node)
  );
}

/** The object literal passed to a class's `@component({ … })` decorator. */
function findDecoratorConfig(node: Node): Node | null {
  for (const decorator of node?.decorators ?? []) {
    const expression = decorator.expression;
    if (expression?.type !== 'CallExpression') continue;
    if (expression.callee?.type !== 'Identifier') continue;
    if (expression.callee.name !== 'component') continue;

    const argument = expression.arguments?.[0];
    if (argument?.type === 'ObjectExpression') return argument;
  }

  return null;
}

/** The `static config = { … }` object of a class. */
function findStaticConfig(node: Node): Node | null {
  for (const member of node?.body?.body ?? []) {
    if (member.type !== 'PropertyDefinition') continue;
    if (member.static !== true) continue;
    if (member.key?.name !== 'config') continue;
    if (member.value?.type === 'ObjectExpression') return member.value;
  }

  return null;
}

/**
 * Finds the `static config = { … }` object of a class, or the object literal
 * passed to its `@component({ … })` decorator. v4 accepts both spellings.
 */
export function findComponentConfig(node: Node): Node | null {
  return findDecoratorConfig(node) ?? findStaticConfig(node);
}

/**
 * Returns the value of a named property of an object literal.
 */
export function getProperty(node: Node, name: string): Node | null {
  for (const property of node?.properties ?? []) {
    if (property.type !== 'Property') continue;
    if (getKeyName(property) === name) return property.value ?? null;
  }
  return null;
}
