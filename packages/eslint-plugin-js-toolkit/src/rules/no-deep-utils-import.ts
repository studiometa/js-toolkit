import { type Node, type RuleContext, createRule } from '../utils/ast.ts';

const UTILS_PREFIX = '@studiometa/js-toolkit/utils/';

/**
 * A published per-symbol subpath: exactly one segment after `utils/`, and no dot in it.
 *
 * Since v3.9.0 every util is exported at `@studiometa/js-toolkit/utils/<name>`. Those subpaths are
 * public API and the cheapest way to import a util — they resolve to the module declaring the symbol,
 * so a consumer served by a CDN downloads that module instead of the whole `utils` barrel. Anything
 * deeper (`utils/math/damp.js`) reaches into the package layout, which is not part of the API and
 * changes without notice.
 *
 * Every key of the `exports` map is a symbol name, so none of them contains a dot; rejecting the dot
 * outright keeps a file path out (`utils/damp.ts`, `utils/foo.css`) whatever its extension.
 */
const PUBLIC_SUBPATH_RE = /^[^/.]+$/;

export const noDeepUtilsImport = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow importing internal module paths from @studiometa/js-toolkit/utils — use the public per-symbol subpath',
    },
    messages: {
      noDeepImport:
        'Import from "{{source}}" reaches into the package layout. Use the public subpath "@studiometa/js-toolkit/utils/<name>" for a single util, or "@studiometa/js-toolkit/utils" for several.',
    },
  },
  createOnce(context: RuleContext) {
    return {
      ImportDeclaration(node: Node) {
        const source: string = node.source.value;
        if (!source.startsWith(UTILS_PREFIX)) return;

        if (PUBLIC_SUBPATH_RE.test(source.slice(UTILS_PREFIX.length))) return;

        // No autofix: the subpath key is the symbol's exported name, which does not always match the
        // module path (`utils/history.js` exports `push`, published as `utils/historyPush`), so a
        // mechanical rewrite can produce a subpath which does not exist.
        context.report({ node, messageId: 'noDeepImport', data: { source } });
      },
    };
  },
});
