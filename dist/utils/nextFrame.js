export var getRaf = function getRaf() {
  return typeof window !== 'undefined' && window.requestAnimationFrame ? window.requestAnimationFrame.bind(window) : setTimeout;
};
export default function nextFrame() {
  var fn = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
  var raf = getRaf();
  return new Promise(function (resolve) {
    raf(function () {
      return raf(function () {
        return resolve(fn());
      });
    });
  });
}
//# sourceMappingURL=nextFrame.js.map