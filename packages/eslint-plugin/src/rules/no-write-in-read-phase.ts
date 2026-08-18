import {
  createRule,
  findEnclosingClass,
  getAncestors,
  getKeyName,
  hasDecorator,
  isComponentClass,
  isFunctionNode,
  walk,
  type Node,
  type RuleContext,
} from '../utils/ast.ts';

/**
 * Hooks whose service fans its subscribers out inside `defaultScheduler.read()`.
 *
 * `raf.ts`, `scroll.ts` and `scroll-progress.ts` all coalesce into the read
 * phase. The other services — resize, pointer, key, mutation, in-view — emit
 * straight from their listener or observer, in no phase at all, so their hooks
 * are not read-phase contexts and are deliberately absent.
 */
const READ_PHASE_HOOKS = new Set(['ticked', 'scrolled', 'scrolledInView']);

/** Services whose `subscribe()` callback runs in the read phase. */
const READ_PHASE_SERVICES = new Set([
  'useRaf',
  'useScroll',
  'useWindowScroll',
  'useScrollProgress',
]);

/** A method carrying either of these already names its own phase. */
const PHASE_DECORATORS = new Set(['read', 'write']);

/** Properties whose assignment mutates the DOM. */
const WRITE_PROPERTIES = new Set([
  'textContent',
  'innerHTML',
  'className',
  'scrollTop',
  'scrollLeft',
  'value',
]);

/** Methods which mutate the DOM. */
const WRITE_METHODS = new Set([
  'setProperty',
  'setAttribute',
  'removeAttribute',
  'toggleAttribute',
  'append',
  'prepend',
  'remove',
  'replaceChildren',
  'insertAdjacentHTML',
  'scrollTo',
  'scrollIntoView',
  'animate',
]);

/** Globals a component may reach the DOM through. */
const DOM_GLOBALS = new Set(['document', 'window']);

type MemberPath = { base: Node | null; path: (string | null)[] };

/**
 * Splits a member expression into the expression it starts from and the chain
 * of property names read off it. A computed property contributes `null`.
 */
function memberPath(node: Node): MemberPath {
  const path: (string | null)[] = [];
  let current = node;

  while (current?.type === 'MemberExpression') {
    path.unshift(current.computed ? null : (current.property?.name ?? null));
    current = current.object;
  }

  return { base: current ?? null, path };
}

/**
 * Returns true if an expression reaches the DOM from one of the roots a v4
 * component owns: `this.$el`, `this.$refs.*`, `document`, `window`, or a local
 * initialised from one of those.
 *
 * Anchoring the receiver is what makes a type-free rule accurate enough to
 * turn on: without it, every `foo.value = 1` in the file would be a candidate.
 */
function isAnchored(node: Node, aliases: Set<string>): boolean {
  if (!node) return false;

  // `this.$el.querySelector('.x')` is anchored through its callee.
  if (node.type === 'CallExpression') {
    return isAnchored(node.callee, aliases);
  }

  const { base, path } = memberPath(node);

  if (!base) return false;

  if (base.type === 'ThisExpression') {
    return path[0] === '$el' || path[0] === '$refs';
  }

  if (base.type === 'Identifier') {
    return DOM_GLOBALS.has(base.name) || aliases.has(base.name);
  }

  return false;
}

/**
 * Names the DOM write an assignment performs, or null if it is not one.
 */
function assignmentWrite(node: Node, aliases: Set<string>): string | null {
  const left = node.left;
  if (left?.type !== 'MemberExpression') return null;
  if (!isAnchored(left, aliases)) return null;

  const { path } = memberPath(left);
  const last = path[path.length - 1];

  if (path.includes('style')) return 'style';
  if (typeof last === 'string' && WRITE_PROPERTIES.has(last)) return last;

  return null;
}

/**
 * Names the DOM write a call performs, or null if it is not one.
 */
function callWrite(node: Node, aliases: Set<string>): string | null {
  const callee = node.callee;
  if (callee?.type !== 'MemberExpression') return null;
  if (!isAnchored(callee, aliases)) return null;

  const { path } = memberPath(callee);
  const last = path[path.length - 1];

  if (path.includes('classList')) return 'classList';
  if (typeof last === 'string' && WRITE_METHODS.has(last)) return `${last}()`;

  return null;
}

/**
 * Collects, in one pass over the file, the names a member path may be anchored
 * to and the names holding a `smoothTo()` value.
 *
 * A pre-pass rather than incremental collection, so that a field declared after
 * the method using it is still resolved.
 */
function collectNames(program: Node): { aliases: Set<string>; smooth: Set<string> } {
  const aliases = new Set<string>();
  const smooth = new Set<string>();
  const candidates: { name: string; init: Node }[] = [];

  walk(program, (node) => {
    let name: string | null = null;
    let init: Node | null = null;

    if (node.type === 'VariableDeclarator' && node.id?.type === 'Identifier') {
      name = node.id.name;
      init = node.init;
    } else if (node.type === 'PropertyDefinition') {
      name = getKeyName(node);
      init = node.value;
    }

    if (!name || !init) return;

    if (init.type === 'CallExpression' && init.callee?.type === 'Identifier') {
      if (init.callee.name === 'smoothTo') smooth.add(name);
    }

    candidates.push({ name, init });
  });

  // An alias may be initialised from another alias, so settle to a fixpoint.
  let changed = true;
  while (changed) {
    changed = false;
    for (const { name, init } of candidates) {
      if (aliases.has(name)) continue;
      if (isAnchored(init, aliases)) {
        aliases.add(name);
        changed = true;
      }
    }
  }

  return { aliases, smooth };
}

/**
 * Returns true if `object` is something whose `subscribe()` callback runs in
 * the read phase.
 */
function isReadPhaseSubscribable(object: Node, smooth: Set<string>): boolean {
  if (!object) return false;

  if (object.type === 'CallExpression' && object.callee?.type === 'Identifier') {
    return READ_PHASE_SERVICES.has(object.callee.name);
  }

  if (
    object.type === 'MemberExpression' &&
    object.object?.type === 'ThisExpression' &&
    !object.computed
  ) {
    return smooth.has(object.property?.name);
  }

  if (object.type === 'Identifier') {
    return smooth.has(object.name);
  }

  return false;
}

/** Returns true for `this.$read(fn)` and `defaultScheduler.read(fn)`. */
function isReadScheduling(callee: Node): boolean {
  const name = callee?.property?.name;

  if (name === '$read' && callee.object?.type === 'ThisExpression') return true;

  return (
    name === 'read' &&
    callee.object?.type === 'Identifier' &&
    callee.object.name === 'defaultScheduler'
  );
}

export const noWriteInReadPhase = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow DOM writes in a read-phase callback — return a render function instead',
    },
    messages: {
      writeInReadPhase:
        'This writes the DOM ({{write}}) in the read phase, which forces layout for every component measuring in the same frame. Return a render function, or move the write into this.$write().',
      writeInHelper:
        'This writes the DOM ({{write}}) in the read phase, through {{helper}}(). Return a render function, or mark {{helper}}() with @write.',
    },
  },
  createOnce(context: RuleContext) {
    let aliases = new Set<string>();
    let smooth = new Set<string>();

    /** One frame per function scope. Nesting resets the armed flag by design. */
    const scopes: boolean[] = [];
    const classes: Node[] = [];
    const reported = new Set<Node>();

    const isArmed = (): boolean => scopes[scopes.length - 1] === true;

    /**
     * Decides whether entering this function enters a read-phase context.
     */
    function isReadPhaseEntry(node: Node): boolean {
      const ancestors = getAncestors(node, context);
      const parent = ancestors[ancestors.length - 1];

      if (!parent) return false;

      // A frame hook of a component class.
      if (parent.type === 'MethodDefinition' && parent.value === node) {
        const name = getKeyName(parent);
        if (!name || !READ_PHASE_HOOKS.has(name)) return false;
        const enclosing = findEnclosingClass(ancestors);
        return Boolean(enclosing && isComponentClass(enclosing));
      }

      if (parent.type !== 'CallExpression') return false;

      const callee = parent.callee;
      if (callee?.type !== 'MemberExpression') return false;

      if (isReadScheduling(callee) && parent.arguments?.includes(node)) {
        return true;
      }

      if (callee.property?.name === 'subscribe' && parent.arguments?.[0] === node) {
        return isReadPhaseSubscribable(callee.object, smooth);
      }

      return false;
    }

    /**
     * Resolves `this.<name>(…)` one level and reports the writes of that method.
     *
     * One level only, and never through a method naming its own phase with
     * `@read` or `@write` — which is how `Cursor`'s `@write render()` stays
     * correct while still being called from a frame subscriber.
     */
    function descend(node: Node): void {
      const callee = node.callee;
      if (callee?.type !== 'MemberExpression') return;
      if (callee.computed || callee.object?.type !== 'ThisExpression') return;

      const name = callee.property?.name;
      if (typeof name !== 'string' || name.startsWith('$')) return;

      const enclosing = classes[classes.length - 1];
      if (!enclosing) return;

      const method = (enclosing.body?.body ?? []).find(
        (member: Node) =>
          member.type === 'MethodDefinition' &&
          member.kind === 'method' &&
          getKeyName(member) === name,
      );

      if (!method || hasDecorator(method, PHASE_DECORATORS)) return;

      walk(method.value?.body, (inner: Node) => {
        // The armed flag clears at a nested function, here as everywhere.
        if (isFunctionNode(inner)) return false;

        const write =
          inner.type === 'AssignmentExpression'
            ? assignmentWrite(inner, aliases)
            : inner.type === 'CallExpression'
              ? callWrite(inner, aliases)
              : null;

        if (write && !reported.has(inner)) {
          reported.add(inner);
          context.report({
            node: inner,
            messageId: 'writeInHelper',
            data: { write, helper: name },
          });
        }
      });
    }

    function report(node: Node, write: string): void {
      if (reported.has(node)) return;
      reported.add(node);
      context.report({ node, messageId: 'writeInReadPhase', data: { write } });
    }

    return {
      // `createOnce` runs once for the whole run, so every piece of per-file
      // state is rebuilt here rather than carried between files.
      Program(node: Node) {
        const collected = collectNames(node);
        aliases = collected.aliases;
        smooth = collected.smooth;
        scopes.length = 0;
        classes.length = 0;
        reported.clear();
      },

      ClassDeclaration(node: Node) {
        classes.push(node);
      },
      'ClassDeclaration:exit'() {
        classes.pop();
      },
      ClassExpression(node: Node) {
        classes.push(node);
      },
      'ClassExpression:exit'() {
        classes.pop();
      },

      FunctionDeclaration(node: Node) {
        scopes.push(isReadPhaseEntry(node));
      },
      'FunctionDeclaration:exit'() {
        scopes.pop();
      },
      FunctionExpression(node: Node) {
        scopes.push(isReadPhaseEntry(node));
      },
      'FunctionExpression:exit'() {
        scopes.pop();
      },
      ArrowFunctionExpression(node: Node) {
        scopes.push(isReadPhaseEntry(node));
      },
      'ArrowFunctionExpression:exit'() {
        scopes.pop();
      },

      AssignmentExpression(node: Node) {
        if (!isArmed()) return;
        const write = assignmentWrite(node, aliases);
        if (write) report(node, write);
      },

      CallExpression(node: Node) {
        if (!isArmed()) return;

        const write = callWrite(node, aliases);
        if (write) {
          report(node, write);
          return;
        }

        descend(node);
      },
    };
  },
});
