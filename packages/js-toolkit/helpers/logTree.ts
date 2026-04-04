import type { Base } from '../Base/Base.js';
import { getInstances } from '../Base/index.js';

/**
 * Build a tree structure from a flat set of instances using DOM containment.
 */
function buildTree(root: Base): TreeNode {
  const allInstances = getInstances();
  const rootNode: TreeNode = { instance: root, children: [] };

  // Collect all instances that are descendants of root (excluding root itself)
  const descendants: Base[] = [];
  for (const instance of allInstances) {
    if (instance !== root && root.$el.contains(instance.$el)) {
      descendants.push(instance);
    }
  }

  // Sort by DOM order (depth-first)
  descendants.sort((a, b) => {
    const position = a.$el.compareDocumentPosition(b.$el);
    if (position & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
    if (position & Node.DOCUMENT_POSITION_PRECEDING) return 1;
    return 0;
  });

  // Build tree: assign each instance to its closest ancestor in the tree
  const nodeMap = new Map<Base, TreeNode>();
  nodeMap.set(root, rootNode);

  for (const instance of descendants) {
    const node: TreeNode = { instance, children: [] };
    nodeMap.set(instance, node);

    // Find the closest ancestor that is already in the tree
    let parentNode = rootNode;
    for (const [candidate, candidateNode] of nodeMap) {
      if (
        candidate !== instance &&
        candidate.$el.contains(instance.$el) &&
        // Pick the most specific (deepest) container
        parentNode.instance.$el.contains(candidate.$el)
      ) {
        parentNode = candidateNode;
      }
    }

    parentNode.children.push(node);
  }

  return rootNode;
}

interface TreeNode {
  instance: Base;
  children: TreeNode[];
}

/**
 * Log a tree node and its children using console groups.
 */
function logNode(node: TreeNode): void {
  const { instance } = node;
  const mounted = instance.$isMounted;
  const status = mounted ? '●' : '○';
  const label = `${status} ${instance.$id}`;

  if (node.children.length > 0) {
    console.groupCollapsed(label, instance.$el);
    for (const child of node.children) {
      logNode(child);
    }
    console.groupEnd();
  } else {
    console.log(label, instance.$el);
  }
}

/**
 * Log the component tree starting from the given instance.
 *
 * Uses the global instance registry and DOM containment to build the tree,
 * without relying on the deprecated `$children` API.
 *
 * @param   {Base} instance The root component instance.
 * @example
 * ```js
 * import { createApp, logTree } from '@studiometa/js-toolkit';
 *
 * const useApp = createApp(App);
 * useApp().then((app) => logTree(app));
 * ```
 */
export function logTree(instance: Base): void {
  const tree = buildTree(instance);
  console.group(`🌳 ${instance.$config.name}`);
  for (const child of tree.children) {
    logNode(child);
  }
  console.groupEnd();
}
