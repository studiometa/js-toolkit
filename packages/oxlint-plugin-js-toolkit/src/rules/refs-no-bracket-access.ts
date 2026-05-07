import { toCamelCase, type Node, type RuleContext, createRule } from '../utils/ast.ts';

function isThisRefs(node: Node): boolean {
  return (
    node.type === 'MemberExpression' &&
    node.object?.type === 'ThisExpression' &&
    node.property?.name === '$refs'
  );
}

export const refsNoBracketAccess = createRule({
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Disallow bracket access with [] suffix on this.$refs',
    },
    messages: {
      noBracketAccess:
        'Use "this.$refs.{{fixed}}" instead of "this.$refs[\'{{raw}}\']".',
    },
  },
  createOnce(context: RuleContext) {
    return {
      MemberExpression(node: Node) {
        if (!isThisRefs(node.object)) return;
        if (!node.computed) return;
        const prop = node.property;
        if (prop.type !== 'Literal' || typeof prop.value !== 'string') return;
        const raw: string = prop.value;
        if (!raw.endsWith('[]')) return;

        const stripped = raw.slice(0, -2);
        const fixed = toCamelCase(stripped);

        context.report({
          node,
          messageId: 'noBracketAccess',
          data: { raw, fixed },
          fix(fixer: any) {
            const src = context.sourceCode ?? context.getSourceCode?.();
            const objText = src.getText(node.object);
            return fixer.replaceText(node, `${objText}.${fixed}`);
          },
        });
      },
    };
  },
});
