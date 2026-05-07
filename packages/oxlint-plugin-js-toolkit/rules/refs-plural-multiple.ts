import { isBaseSubclass, type Node, type RuleContext } from '../utils/ast.js';

export const refsPluralMultiple = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require multiple-ref names (using [] suffix) to be pluralized',
    },
    messages: {
      notPlural: 'Multiple ref "{{name}}" must be pluralized (e.g. "{{name}}s[]").',
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
    if (!raw.endsWith('[]')) continue;

    const name = raw.slice(0, -2);
    if (!name.endsWith('s')) {
      context.report({
        node: element,
        messageId: 'notPlural',
        data: { name },
      });
    }
  }
}
