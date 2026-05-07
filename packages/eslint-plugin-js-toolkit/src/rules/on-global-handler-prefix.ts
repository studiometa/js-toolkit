import { isBaseSubclass, findEnclosingClass, type Node, type RuleContext, createRule } from '../utils/ast.ts';

// Events that only make sense on window/document, never on a DOM element.
// Pointer, keyboard, and form events are intentionally excluded — they can all
// fire on elements too, so onResize/onScroll without a prefix is the only
// unambiguous mistake worth flagging automatically.
const GLOBAL_ONLY_EVENTS = new Set(['Resize']);

export const onGlobalHandlerPrefix = createRule({
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Require global event handlers (resize, scroll, etc.) to be prefixed with onWindow or onDocument',
    },
    messages: {
      missingPrefix:
        '"{{name}}" looks like a global event handler. Use "onWindow{{event}}" or "onDocument{{event}}" to bind to window/document events.',
    },
  },
  createOnce(context: RuleContext) {
    return {
      MethodDefinition(node: Node) {
        const name = node.key?.name;
        if (!name || !name.startsWith('on')) return;

        const suffix = name.slice(2); // strip "on"
        const event = GLOBAL_ONLY_EVENTS.has(suffix) ? suffix : null;
        if (!event) return;

        // Allow onWindow* and onDocument* — those are correct
        if (name.startsWith('onWindow') || name.startsWith('onDocument')) return;

        const ancestors = context.getAncestors
          ? context.getAncestors()
          : context.sourceCode?.getAncestors?.(node) ?? [];

        const enclosingClass = findEnclosingClass(ancestors);
        if (!enclosingClass || !isBaseSubclass(enclosingClass, context)) return;

        context.report({
          node,
          messageId: 'missingPrefix',
          data: { name, event },
        });
      },
    };
  },
});
