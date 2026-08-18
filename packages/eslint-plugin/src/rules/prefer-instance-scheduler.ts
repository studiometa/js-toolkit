import {
  createRule,
  findEnclosingClass,
  getAncestors,
  isComponentClass,
  type Node,
  type RuleContext,
} from '../utils/ast.ts';

/** The phases a component owns an instance-scoped equivalent of. */
const PHASES = new Map([
  ['read', '$read'],
  ['write', '$write'],
]);

export const preferInstanceScheduler = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer this.$read()/this.$write() over defaultScheduler inside a component',
    },
    messages: {
      preferInstance:
        'Use `this.{{instance}}()` rather than `defaultScheduler.{{phase}}()` inside a component. The instance form ties the task to this component, so destroying it cancels the task instead of running it against a detached element.',
    },
  },
  createOnce(context: RuleContext) {
    return {
      CallExpression(node: Node) {
        const callee = node.callee;
        if (callee?.type !== 'MemberExpression' || callee.computed) return;
        if (callee.object?.type !== 'Identifier' || callee.object.name !== 'defaultScheduler') {
          return;
        }

        const phase = callee.property?.name;
        const instance = PHASES.get(phase);
        if (!instance) return;

        const enclosing = findEnclosingClass(getAncestors(node, context));
        if (!enclosing || !isComponentClass(enclosing)) return;

        context.report({ node, messageId: 'preferInstance', data: { phase, instance } });
      },
    };
  },
});
