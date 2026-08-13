import { type Node, type RuleContext, createRule } from '../utils/ast.ts';

/** A relative import of a barrel: `'./utils/index.js'`, `'../Base/index.js'`. */
const RELATIVE_BARREL_RE = /^\.{1,2}\/.*\/index\.js$/;

export const noInternalBarrelImport = createRule({
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow importing an internal barrel inside the package — import the declaring module instead',
    },
    messages: {
      noBarrelImport:
        'Import from "{{source}}" pulls in every symbol the barrel names. Import the module declaring the symbol instead, so a consumer served by a CDN only downloads what it uses.',
    },
  },
  createOnce(context: RuleContext) {
    return {
      ImportDeclaration(node: Node) {
        const source: string = node.source.value;
        if (!RELATIVE_BARREL_RE.test(source)) return;

        context.report({ node, messageId: 'noBarrelImport', data: { source } });
      },
    };
  },
});
