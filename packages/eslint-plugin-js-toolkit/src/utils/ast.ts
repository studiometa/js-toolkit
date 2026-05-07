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
