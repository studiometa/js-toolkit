import { describe, it, expect } from "vitest";
import {
  loadElement,
  loadIframe,
  loadImage,
  loadLink,
  loadScript,
} from "@studiometa/js-toolkit/utils";
import type { LoadableElementsNames } from "@studiometa/js-toolkit/utils";
import { h, mockElementLoad } from "#test-utils";

const items = [
  ["embed", "src", HTMLEmbedElement],
  ["iframe", "src", HTMLIFrameElement, loadIframe],
  ["img", "src", HTMLImageElement, loadImage],
  ["link", "href", HTMLLinkElement, loadLink],
  ["script", "src", HTMLScriptElement, loadScript],
  ["track", "src", HTMLTrackElement],
] as [LoadableElementsNames, string, any, Function?][];

describe("The `loadElement` utility function", () => {
  for (const [name, prop, type, fn] of items) {
    it(`should load a ${name}`, async () => {
      const { unmock } = mockElementLoad(name, prop);
      const { event, element } = await loadElement("fake-url", name);
      expect(element).toBeInstanceOf(type);
      expect(element[prop]).toBe("fake-url");
      expect(event.type).toBe("load");
      unmock();
    });

    it(`should load a ${name} and add it to the DOM`, async () => {
      const { unmock } = mockElementLoad(name, prop);
      const div = h("div");
      const { event, element } = await loadElement("fake-url", name, {
        appendTo: div,
      });
      expect(element).toBeInstanceOf(type);
      expect(element[prop]).toBe("fake-url");
      expect(div.contains(element)).toBe(true);
      expect(event.type).toBe("load");
      unmock();
    });

    if (fn) {
      it(`should provide an alias ${fn.name}`, async () => {
        const { unmock } = mockElementLoad(name, prop);
        const { event, element } = await fn("fake-url");
        expect(element).toBeInstanceOf(type);
        expect(element[prop]).toBe("fake-url");
        expect(event.type).toBe("load");
        unmock();
      });
    }
  }
});

describe("The loadScript function", () => {
  it("should append the script to the <head> by default", async () => {
    const { unmock } = mockElementLoad("script");
    const { event, element } = await loadScript("fake-url");
    expect(element).toBeInstanceOf(HTMLScriptElement);
    expect(element.src).toBe("fake-url");
    expect(event.type).toBe("load");
    expect(document.head.contains(element)).toBe(true);
    unmock();
  });
});
