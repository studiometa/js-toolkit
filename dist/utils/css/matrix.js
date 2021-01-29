export default function matrix(transform) {
  transform = transform || {};
  return "matrix(".concat(transform.scaleX || 1, ", ").concat(transform.skewX || 0, ", ").concat(transform.skewY || 0, ", ").concat(transform.scaleY || 1, ", ").concat(transform.translateX || 0, ", ").concat(transform.translateY || 0, ")");
}
//# sourceMappingURL=matrix.js.map