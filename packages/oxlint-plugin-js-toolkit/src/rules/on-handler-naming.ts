import { isBaseSubclass, findEnclosingClass, type Node, type RuleContext } from '../utils/ast.ts';

// onXxxYyy — the part after "on" must start with an uppercase letter
const ON_HANDLER_RE = /^on[A-Z][a-zA-Z0-9]*$/;

export const onHandlerNaming = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require event handler methods to follow the onXxxYyy naming convention',
    },
    messages: {
      invalidName:
        'Event handler "{{name}}" must follow the onXxxYyy camelCase convention (e.g. onClickButton).',
    },
  },
  create(context: RuleContext) {
    return {
      MethodDefinition(node: Node) {
        // Skip getters, setters — those are not event handlers
        if (node.kind === 'get' || node.kind === 'set') return;

        const name = node.key?.name;
        // Only lint methods that start with "on" followed by an uppercase letter —
        // that's the unambiguous signal of an intended event handler.
        if (!name || !/^on[A-Z]/.test(name)) return;
        if (ON_HANDLER_RE.test(name)) return;

        const ancestors = context.getAncestors
          ? context.getAncestors()
          : context.sourceCode?.getAncestors?.(node) ?? [];

        const enclosingClass = findEnclosingClass(ancestors);
        if (!enclosingClass || !isBaseSubclass(enclosingClass, context)) return;

        context.report({ node, messageId: 'invalidName', data: { name } });
      },
    };
  },
};
