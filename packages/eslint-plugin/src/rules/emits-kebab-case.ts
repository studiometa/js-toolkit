import { isBaseSubclass, type Node, type RuleContext, createRule } from '../utils/ast.ts';

/**
 * Returns true if the string is kebab-case:
 * all lowercase letters, digits and hyphens, no underscores or uppercase.
 */
function isKebabCase(value: string): boolean {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(value);
}

/**
 * Converts a camelCase, PascalCase or snake_case string to kebab-case.
 */
function toKebabCase(value: string): string {
  return value
    .replace(/([A-Z])/g, (_, c: string) => `-${c.toLowerCase()}`)
    .replace(/_/g, '-')
    .replace(/^-/, '')
    .toLowerCase();
}

function check(node: Node, context: RuleContext) {
  if (!isBaseSubclass(node, context)) return;

  const body: Node[] = node.body?.body ?? [];

  const configProp = body.find(
    (member: Node) =>
      member.type === 'PropertyDefinition' &&
      member.static === true &&
      member.key?.name === 'config',
  );

  if (!configProp?.value || configProp.value.type !== 'ObjectExpression') return;

  const emitsProp = configProp.value.properties?.find(
    (prop: Node) => prop.type === 'Property' && prop.key?.name === 'emits',
  );

  if (!emitsProp?.value || emitsProp.value.type !== 'ArrayExpression') return;

  for (const element of emitsProp.value.elements ?? []) {
    if (!element || element.type !== 'Literal') continue;
    const name = element.value;
    if (typeof name !== 'string') continue;
    if (!isKebabCase(name)) {
      const fixed = toKebabCase(name);
      context.report({
        node: element,
        messageId: 'notKebabCase',
        data: { name },
        fix: (fixer: any) => fixer.replaceText(element, `'${fixed}'`),
      });
    }
  }
}

export const emitsKebabCase = createRule({
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Require emit names in static config to be kebab-case',
    },
    messages: {
      notKebabCase: 'Emit name "{{name}}" must be kebab-case (e.g. "content-change").',
    },
  },
  createOnce(context: RuleContext) {
    return {
      ClassDeclaration(node: Node) {
        check(node, context);
      },
      ClassExpression(node: Node) {
        check(node, context);
      },
    };
  },
});
