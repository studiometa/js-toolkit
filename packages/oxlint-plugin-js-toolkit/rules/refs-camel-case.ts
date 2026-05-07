import { isBaseSubclass, isCamelCase, type Node, type RuleContext } from '../utils/ast.js';

export const refsCamelCase = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require ref names in static config to be camelCase',
    },
    messages: {
      notCamelCase: 'Ref name "{{name}}" must be camelCase.',
    },
  },
  create(context: RuleContext) {
    return {
      ClassDeclaration(node: Node) {
        check(node, context);
      },
      ClassExpression(node: Node) {
        check(node, context);
      },
    };
  },
};

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

  const refsProp = configProp.value.properties?.find(
    (prop: Node) => prop.type === 'Property' && prop.key?.name === 'refs',
  );

  if (!refsProp?.value || refsProp.value.type !== 'ArrayExpression') return;

  for (const element of refsProp.value.elements ?? []) {
    if (!element || element.type !== 'Literal') continue;
    const raw = element.value;
    if (typeof raw !== 'string') continue;
    // Strip the multiple-ref suffix before checking casing
    const name = raw.endsWith('[]') ? raw.slice(0, -2) : raw;
    if (!isCamelCase(name)) {
      context.report({
        node: element,
        messageId: 'notCamelCase',
        data: { name },
      });
    }
  }
}
