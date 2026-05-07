import { type Node, type RuleContext, createRule } from '../utils/ast.ts';

const DEEP_UTILS_RE = /^@studiometa\/js-toolkit\/utils\/.+/;

export const noDeepUtilsImport = createRule({
  meta: {
    type: 'problem',
    fixable: 'code',
    docs: {
      description: 'Disallow deep imports from @studiometa/js-toolkit/utils/*',
    },
    messages: {
      noDeepImport:
        'Import from "{{source}}" should use the public entrypoint "@studiometa/js-toolkit/utils".',
    },
  },
  createOnce(context: RuleContext) {
    return {
      ImportDeclaration(node: Node) {
        const source: string = node.source.value;
        if (!DEEP_UTILS_RE.test(source)) return;

        context.report({
          node,
          messageId: 'noDeepImport',
          data: { source },
          fix(fixer: any) {
            const specifiers: Node[] = node.specifiers ?? [];
            const parts: string[] = [];

            for (const s of specifiers) {
              if (s.type === 'ImportDefaultSpecifier') {
                parts.push(s.local.name);
              } else if (s.type === 'ImportSpecifier') {
                const imported = s.imported.name;
                const local = s.local.name;
                parts.push(imported === local ? imported : `${imported} as ${local}`);
              }
            }

            const named = parts.join(', ');
            return fixer.replaceText(
              node,
              `import { ${named} } from '@studiometa/js-toolkit/utils';`,
            );
          },
        });
      },
    };
  },
});
