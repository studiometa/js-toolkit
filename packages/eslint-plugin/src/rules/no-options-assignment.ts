import {
  createRule,
  findEnclosingClass,
  getAncestors,
  isComponentClass,
  type Node,
  type RuleContext,
} from '../utils/ast.ts';

/**
 * Returns true if an expression is `this.$options`, or a path reaching into it.
 */
function isOptionsPath(node: Node): boolean {
  let current = node;

  while (current?.type === 'MemberExpression') {
    if (
      current.object?.type === 'ThisExpression' &&
      !current.computed &&
      current.property?.name === '$options'
    ) {
      return true;
    }
    current = current.object;
  }

  return false;
}

export const noOptionsAssignment = createRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow writing to this.$options — it is a read-only view of the attributes',
    },
    messages: {
      assignment:
        '`$options` is a read-only view of the element attributes: every property is a getter with no setter, so this throws at runtime. Write the attribute instead, with setAttribute().',
      objectAssign:
        'Object.assign() onto `$options` writes properties which are getters with no setter, so this throws at runtime. Write the attributes instead, with setAttribute().',
    },
  },
  createOnce(context: RuleContext) {
    function inComponent(node: Node): boolean {
      const enclosing = findEnclosingClass(getAncestors(node, context));
      return Boolean(enclosing && isComponentClass(enclosing));
    }

    return {
      AssignmentExpression(node: Node) {
        const left = node.left;
        if (left?.type !== 'MemberExpression') return;
        // `this.$options` itself is a plain field; only its properties throw.
        if (left.object?.type === 'ThisExpression') return;
        if (!isOptionsPath(left)) return;
        if (!inComponent(node)) return;

        context.report({ node, messageId: 'assignment' });
      },

      CallExpression(node: Node) {
        const callee = node.callee;
        if (callee?.type !== 'MemberExpression') return;
        if (callee.object?.type !== 'Identifier' || callee.object.name !== 'Object') return;
        if (callee.property?.name !== 'assign') return;

        const target = node.arguments?.[0];
        if (!target || target.type !== 'MemberExpression') return;
        if (!isOptionsPath(target)) return;
        if (!inComponent(node)) return;

        context.report({ node, messageId: 'objectAssign' });
      },
    };
  },
});
