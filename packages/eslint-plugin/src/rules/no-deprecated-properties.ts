import {
  createRule,
  findComponentConfig,
  findEnclosingClass,
  getAncestors,
  getKeyName,
  getProperty,
  isBaseSubclass,
  isComponentClass,
  type Node,
  type RuleContext,
} from '../utils/ast.ts';

/** Deprecated in v3, still present at runtime. */
const V3_DEPRECATED = new Map([
  ['$parent', '$closest()'],
  ['$root', '$closest()'],
  ['$children', '$query()'],
]);

/** Removed in v4. Reaching for any of these is a runtime error, not a warning. */
const V4_REMOVED = new Map([
  ['$parent', '$closest()'],
  ['$root', '$closest()'],
  ['$children', '$watchChildren()'],
  ['$update', 'nothing — $refs and $options read the DOM on every access'],
  ['$warn', 'console.warn()'],
  ['$log', 'console.log()'],
  ['$terminate', '$destroy()'],
]);

/** Methods v4 no longer calls. Defining one is dead code. */
const V4_REMOVED_METHODS = new Map([
  ['updated', '$watchChildren(), or an option<Name>Changed() hook'],
  ['terminated', 'destroyed()'],
]);

/** `$services` survives, but its two switches do not. */
const V4_REMOVED_SERVICE_METHODS = new Map([
  ['enable', 'this.$services.<hook>.start()'],
  ['disable', 'this.$services.<hook>.stop()'],
]);

export const noDeprecatedProperties = createRule({
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow deprecated Base properties, and the members v4 removed',
    },
    schema: [
      {
        type: 'object',
        properties: { version: { enum: ['v3', 'v4'] } },
        additionalProperties: false,
      },
    ],
    messages: {
      deprecated: '"{{name}}" is deprecated. Use {{replacement}} instead.',
      removed: '"{{name}}" is removed in v4. Use {{replacement}} instead.',
      removedMethod:
        '"{{name}}()" is removed in v4, so this method is never called. Use {{replacement}} instead.',
      removedConfig:
        '`config.emits` is removed in v4. Declare the events in the `$emits` type of the component instead — nothing of it stays in the bundle.',
    },
  },
  createOnce(context: RuleContext) {
    /**
     * `createOnce` runs once for the whole run, while `context` tracks the file
     * being linted. Options are therefore read per file, at report time.
     */
    const isV4Mode = (): boolean => context.options?.[0]?.version === 'v4';

    /**
     * v3 resolves a component class by its `Base` superclass; v4 also writes
     * `extends with<Service>(…)` and `@component({ … })`.
     */
    function isComponent(node: Node): boolean {
      return isV4Mode() ? isComponentClass(node) : isBaseSubclass(node, context);
    }

    function enclosingComponent(node: Node): Node | null {
      const enclosing = findEnclosingClass(getAncestors(node, context));
      return enclosing && isComponent(enclosing) ? enclosing : null;
    }

    return {
      MemberExpression(node: Node) {
        const name = node.property?.name;
        if (!name) return;

        const isV4 = isV4Mode();

        // `this.$services.enable(…)` — the receiver is a member, not `this`.
        if (
          isV4 &&
          V4_REMOVED_SERVICE_METHODS.has(name) &&
          node.object?.type === 'MemberExpression' &&
          node.object.object?.type === 'ThisExpression' &&
          node.object.property?.name === '$services'
        ) {
          if (!enclosingComponent(node)) return;
          context.report({
            node,
            messageId: 'removed',
            data: {
              name: `$services.${name}`,
              replacement: V4_REMOVED_SERVICE_METHODS.get(name),
            },
          });
          return;
        }

        const members = isV4 ? V4_REMOVED : V3_DEPRECATED;
        if (!members.has(name)) return;

        // Only flag `this.$parent` etc. — not arbitrary object access
        if (node.object?.type !== 'ThisExpression') return;
        if (!enclosingComponent(node)) return;

        context.report({
          node,
          messageId: isV4 ? 'removed' : 'deprecated',
          data: { name, replacement: members.get(name) },
        });
      },

      MethodDefinition(node: Node) {
        if (!isV4Mode()) return;

        const name = getKeyName(node);
        if (!name || !V4_REMOVED_METHODS.has(name)) return;
        if (node.static === true) return;
        if (!enclosingComponent(node)) return;

        context.report({
          node: node.key ?? node,
          messageId: 'removedMethod',
          data: { name, replacement: V4_REMOVED_METHODS.get(name) },
        });
      },

      ClassDeclaration(node: Node) {
        checkConfig(node);
      },
      ClassExpression(node: Node) {
        checkConfig(node);
      },
    };

    function checkConfig(node: Node) {
      if (!isV4Mode() || !isComponent(node)) return;

      const config = findComponentConfig(node);
      const emits = getProperty(config, 'emits');
      if (!emits) return;

      context.report({ node: emits, messageId: 'removedConfig' });
    }
  },
});
