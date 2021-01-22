export default function damp(targetValue, currentValue) {
  var speed = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0.5;
  var value = currentValue + (targetValue - currentValue) * speed;
  return Math.abs(targetValue - currentValue) < 0.001 ? targetValue : value;
}
//# sourceMappingURL=damp.js.map