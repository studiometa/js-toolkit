export function mockElementLoad(tag: string, prop = "src") {
  const ctor = document.createElement(tag).constructor as any;

  const backup = ctor.prototype.setAttribute;
  ctor.prototype.setAttribute = function (name: string, value: string) {
    backup.call(this, name, value);
    if (name === prop) {
      this.dispatchEvent(new Event("load"));
    }
  };

  return {
    unmock() {
      ctor.prototype.setAttribute = backup;
    },
  };
}
