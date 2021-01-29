export default function round(value) {
  var decimals = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  return Number(value.toFixed(decimals));
}
//# sourceMappingURL=round.js.map