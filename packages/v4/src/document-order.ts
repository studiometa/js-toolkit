/**
 * Document order, the only order DOM-anchored peers can agree on without
 * either the coordinator or the mount sequence arbitrating it.
 *
 * Imports nothing, so ordering costs a consumer no component graph.
 */
export function compareDocumentOrder(a: Node, b: Node): number {
  const position = a.compareDocumentPosition(b);
  if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
    return -1;
  }
  if (position & Node.DOCUMENT_POSITION_PRECEDING) {
    return 1;
  }
  return 0;
}
