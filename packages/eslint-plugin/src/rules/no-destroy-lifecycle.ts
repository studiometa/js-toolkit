import {
  createRule,
  findEnclosingClass,
  getAncestors,
  getKeyName,
  isComponentClass,
  type Node,
  type RuleContext,
} from '../utils/ast.ts';

/**
 * v4 renamed `$destroy()` to `$unmount()` and `destroyed()` to `unmounted()`.
 *
 * There is no destroyed state in v4: `#isMounted` is one boolean with two
 * values, and the method documented itself as "the reversible inverse of
 * `$mount()`". `$mount()`/`$unmount()` and `mounted()`/`unmounted()` are
 * symmetric pairs where `$mount()`/`$destroy()` was not, which is the same
 * rename Vue 3 made to `beforeDestroy`/`destroyed`.
 *
 * ## Why this is its own rule and not an entry in `no-deprecated-properties`
 *
 * Three reasons, and the first is the one that decides it.
 *
 * **`no-deprecated-properties` only flags a member expression whose object is
 * `this`.** That guard is deliberate — `$parent` and `$root` are ordinary
 * enough words that flagging `someLibrary.$parent` would be noise. But most
 * `$destroy()` calls are `instance.$destroy()`: from a registry, from a test,
 * from application code holding an instance. Folding the rename in would
 * therefore miss the common case, and lifting the guard for one entry would
 * lift it for every entry, which is exactly the false positive that guard
 * exists to prevent.
 *
 * **`no-deprecated-properties` is not fixable, and should not become so.**
 * `$parent` → `$closest()` and `$children` → `$watchChildren()` are not safe
 * textual rewrites; they change the shape of the call and often the logic
 * around it. A rename is the one case where a fixer is exactly right, and a
 * rule that is fixable for one of its eleven reports is worse than two rules.
 *
 * **The two rules say different things.** `no-deprecated-properties` reports
 * v3 names that v4 dropped. `$destroy` was never a v3-only name: it is v4's
 * own, renamed while v4 is unreleased. This rule's whole lifetime is that
 * rename window, and it is meant to be deleted, not grown.
 *
 * ## What is flagged, and what is not
 *
 * The two halves are deliberately asymmetric, because the two names are.
 *
 * `$destroy` is flagged on **any** receiver — `this.$destroy()`,
 * `instance.$destroy()`, `super.$destroy()` — and on a `$destroy()` method
 * definition, which is the shape a service mixin overriding the framework's
 * teardown writes. The `$` prefix is the toolkit's own namespace, and the rule
 * ships in `configs.v4` only, which a project turns on when it is on v4. That
 * opt-in is the guard against rewriting an unrelated library's API.
 *
 * `destroyed` has no such prefix — `emitter.destroyed`, `record.destroyed`
 * and a `destroyed` boolean are all ordinary code — so that half is narrowed
 * to the two places where it can only mean the hook: a non-static
 * `destroyed()` method definition in a class that reads as a v4 component,
 * and a `super.destroyed()` call inside one. A plain `foo.destroyed()` call is
 * left alone.
 *
 * Computed access (`instance['$destroy']()`) is not flagged. It is rare, and a
 * fixer would have to guess the quote style of a string it did not write.
 */
export const noDestroyLifecycle = createRule({
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description:
        'Require the v4 names `$unmount()` and `unmounted()` over `$destroy()` and `destroyed()`',
    },
    messages: {
      renamedMethod: '`$destroy()` is named `$unmount()` in v4.',
      renamedHook: 'The `destroyed()` hook is named `unmounted()` in v4.',
    },
  },
  createOnce(context: RuleContext) {
    function inComponent(node: Node): boolean {
      const enclosing = findEnclosingClass(getAncestors(node, context));
      return Boolean(enclosing) && isComponentClass(enclosing as Node);
    }

    function rename(target: Node, messageId: string, to: string) {
      context.report({
        node: target,
        messageId,
        fix: (fixer: any) => fixer.replaceText(target, to),
      });
    }

    return {
      MemberExpression(node: Node) {
        if (node.computed) return;

        const name = node.property?.name;

        if (name === '$destroy') {
          rename(node.property, 'renamedMethod', '$unmount');
          return;
        }

        // `super.destroyed()` chains the hook of a mixin or an abstract
        // component, so the receiver settles what a bare name cannot.
        if (name === 'destroyed' && node.object?.type === 'Super' && inComponent(node)) {
          rename(node.property, 'renamedHook', 'unmounted');
        }
      },

      MethodDefinition(node: Node) {
        if (node.computed || !node.key) return;

        const name = getKeyName(node);

        // A mixin overrides the framework's own teardown, which is why this is
        // not restricted to a class that reads as a component.
        if (name === '$destroy') {
          rename(node.key, 'renamedMethod', '$unmount');
          return;
        }

        if (name !== 'destroyed' || node.static === true) return;
        if (!inComponent(node)) return;

        rename(node.key, 'renamedHook', 'unmounted');
      },
    };
  },
});
