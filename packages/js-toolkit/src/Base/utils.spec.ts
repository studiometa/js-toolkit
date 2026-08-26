import { describe, it, expect, vi } from 'vitest';
import { Base, BaseConfig, withName, getInstances } from '@studiometa/js-toolkit';
import { nextTick } from '@studiometa/js-toolkit/utils';
import {
  getComponentElements,
  addToQueue,
  getSelector,
  addToRegistry,
  getElements,
} from '#private/Base/utils.js';
import { destroy, h, mockFeatures, mount } from '#test-utils';

describe('The Base utils', () => {
  describe('The `getSelector` function', () => {
    it('should return a list of selectors', () => {
      expect(getSelector('Foo')).toMatchInlineSnapshot(
        `"tk-foo,[data-component="Foo"],[data-component*=" Foo "],[data-component$=" Foo"],[data-component^="Foo "]"`,
      );
      expect(getSelector('FooBar')).toMatchInlineSnapshot(
        `"tk-foo-bar,[data-component="FooBar"],[data-component*=" FooBar "],[data-component$=" FooBar"],[data-component^="FooBar "]"`,
      );
    });
  });

  describe('The `getComponentElements` function', () => {
    it('should find components with multiple declarations', () => {
      const div = h('div');
      div.innerHTML = `
      <div data-component="Foo"></div>
      <div data-component="Foo Bar"></div>
      <div data-component="Bar Foo"></div>
      <div data-component="Bar Foo Baz"></div>
      <div data-component="Baz"></div>
      <!-- The following should not be found -->
      <div data-component="FooBaz"></div>
      <div data-component="FooBaz BarFoo"></div>
    `;

      expect(getComponentElements('Foo', div)).toHaveLength(4);
      expect(getComponentElements('Bar', div)).toHaveLength(3);
      expect(getComponentElements('Baz', div)).toHaveLength(2);
    });

    it('should not find DOM elements with the same name as a defined component', () => {
      const div = h('div', [h('figure'), h('button')]);

      expect(getComponentElements('Figure', div)).toHaveLength(0);
      expect(getComponentElements('Button', div)).toHaveLength(0);
    });
  });

  describe('The `addToQueue` function', () => {
    it('should delay given tasks if the `blocking` feature is disabled', async () => {
      const { unmock } = mockFeatures({ blocking: false });
      const fn = vi.fn();

      addToQueue(fn);
      expect(fn).not.toHaveBeenCalled();
      await nextTick();
      expect(fn).toHaveBeenCalledTimes(1);
      unmock();
    });
  });

  describe('The instance helpers', () => {
    it('should save and get instances for a given constructor', () => {
      const Foo = withName(Base, 'Foo');
      const Bar = withName(Base, 'Bar');

      expect(getInstances(Foo)).toHaveLength(0);
      expect(getInstances(Bar)).toHaveLength(0);

      const foo = new Foo(h('div'));
      new Bar(h('div'));
      foo.$emit(new CustomEvent('before-mounted'));

      expect(getInstances(Foo)).toHaveLength(1);
      expect(getInstances(Bar)).toHaveLength(0);
      expect(getInstances(Foo).has(foo)).toBe(true);
    });

    it('should return a set with all instances if no constructor given', () => {
      const Foo = withName(Base, 'Foo');
      const foo = new Foo(h('div'));
      const instances = getInstances();
      expect(instances).toBeInstanceOf(Set);
      expect(getInstances().has(foo)).toBe(false);
      foo.$emit(new CustomEvent('before-mounted'));
      expect(getInstances().has(foo)).toBe(true);
    });

    it('should return a defensive copy when no constructor is given', () => {
      const Foo = withName(Base, 'Foo');
      const foo = new Foo(h('div'));
      foo.$emit(new CustomEvent('before-mounted'));

      const instances = getInstances() as Set<Base>;
      instances.clear();

      expect(getInstances().has(foo)).toBe(true);
    });
  });

  describe('The getElements function', () => {
    it('should return a set of elements having one or more instances attached to them', async () => {
      const Foo = withName(Base, 'Foo');
      const div = h('div');
      const foo = new Foo(div);
      expect(getElements()).toHaveLength(0);
      await mount(foo);
      expect(getElements()).toHaveLength(1);
      expect(getElements()).toEqual(new Set([div]));
      await destroy(foo);
      expect(getElements()).toHaveLength(0);
    });
  });

  describe('The `addToRegistry` helper', () => {
    it('should not override an existing component', async () => {
      const Foo = withName(Base, 'Foo');
      const Bar = withName(Base, 'Bar');

      // Register Foo as the component for the 'TestComponent' name
      addToRegistry('TestComponent', Foo);

      // Try to register Bar with the same name
      addToRegistry('TestComponent', Bar);

      // Create an element and mount it
      const el = h('div', [h('div', { 'data-component': 'TestComponent' })]);
      document.body.appendChild(el);

      // Wait for the mutation observer to detect the change
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Get instances - should only find Foo instances, not Bar
      const fooInstances = getInstances(Foo);
      const barInstances = getInstances(Bar);

      expect(fooInstances.size).toBe(1);
      expect(barInstances.size).toBe(0);

      // Clean up
      el.remove();
      await Promise.all(Array.from(fooInstances).map((i) => i.$destroy()));
    });

    it('should warn in dev mode when a name is registered with a different component', () => {
      const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const Foo = withName(Base, 'Foo');
      const Bar = withName(Base, 'Bar');

      addToRegistry('CollisionName', Foo);
      // Re-registering the SAME class is idempotent and must not warn.
      addToRegistry('CollisionName', Foo);
      expect(warn).not.toHaveBeenCalled();

      // A DIFFERENT class under the same name stays register-once (ignored) but warns.
      addToRegistry('CollisionName', Bar);
      expect(warn).toHaveBeenCalledTimes(1);
      expect(warn.mock.calls[0][0]).toContain('CollisionName');
      expect(warn.mock.calls[0][0]).toContain('customElements.define');

      warn.mockRestore();
    });

    it('should register new components', async () => {
      const TestComponent = withName(Base, 'TestComponent');
      const registryKey = '__JS_TOOLKIT_REGISTRY__';

      // Clear the registry for this test
      const registry = globalThis[registryKey];
      const hadTestComponent = registry?.has('NewTestComponent');
      registry?.delete('NewTestComponent');

      // Register the component
      addToRegistry('NewTestComponent', TestComponent);

      // Check that it's in the registry
      expect(registry.has('NewTestComponent')).toBe(true);
      expect(registry.get('NewTestComponent')).toBe(TestComponent);

      // Clean up
      registry.delete('NewTestComponent');
      if (!hadTestComponent) {
        registry.delete('NewTestComponent');
      }
    });

    it('should register child components', async () => {
      const registry = (globalThis.__JS_TOOLKIT_REGISTRY__ ??= new Map());
      const Child = withName(Base, 'Child');
      const Parent = withName(Base, 'Parent');
      Parent.config.components = { Child, div: Child };

      addToRegistry('Parent', Parent);

      expect(registry.has('Parent')).toBe(true);
      expect(registry.get('Parent')).toBe(Parent);

      expect(registry.has('Child')).toBe(true);
      expect(registry.get('Child')).toBe(Child);

      expect(registry.has('div')).toBe(true);
      expect(registry.get('div')).toBe(Child);
    });

    it('should mount components newly injected in the DOM', async () => {
      const DynamicComponent = withName(Base, 'DynamicComponent');

      // Register the component
      addToRegistry('DynamicComponent', DynamicComponent);

      // Create a container
      const container = h('div');
      document.body.appendChild(container);

      // Dynamically add a component element to the DOM
      const componentEl = h('div', { 'data-component': 'DynamicComponent' });
      container.appendChild(componentEl);

      // Wait for mutation observer and mounting
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check that an instance was created and mounted
      const instances = getInstances(DynamicComponent);
      expect(instances.size).toBeGreaterThan(0);

      const instance = Array.from(instances)[0];
      expect(instance.$el).toBe(componentEl);
      expect(instance.$isMounted).toBe(true);

      // Clean up
      container.remove();
      await Promise.all(Array.from(instances).map((i) => i.$destroy()));
    });

    it('should destroy components whose root element has been removed from the DOM', async () => {
      const DestructibleComponent = withName(Base, 'DestructibleComponent');

      // Register the component
      addToRegistry('DestructibleComponent', DestructibleComponent);

      // Create a container and component element
      const container = h('div');
      document.body.appendChild(container);

      const componentEl = h('div', { 'data-component': 'DestructibleComponent' });
      container.appendChild(componentEl);

      // Wait for mounting
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      const instances = getInstances(DestructibleComponent);
      const instance = Array.from(instances)[0];

      expect(instance.$isMounted).toBe(true);

      // Remove the component element from the DOM
      componentEl.remove();

      // Wait for mutation observer and destruction
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Check that the instance was destroyed
      expect(instance.$isMounted).toBe(false);

      // Clean up
      container.remove();
    });
  });

  describe('The terminated marker and the auto-mount scan', () => {
    it('should never auto-mount a terminated element again, even when re-inserted', async () => {
      // Pins the contract behind the `'terminated'` marker: once an element is
      // stamped, the document-wide auto-mount scan in `mutationCallback()` skips
      // it forever. Note the test never calls `$terminate()` — removing the
      // element from the DOM is enough, the terminate pass of the same scan does
      // it. That is the sharp edge users actually hit.
      let mountedCount = 0;
      class PermanentComponent extends Base {
        static config: BaseConfig = { name: 'PermanentTerminatedComponent' };

        mounted() {
          mountedCount += 1;
        }
      }

      let controlMountedCount = 0;
      class ControlComponent extends Base {
        static config: BaseConfig = { name: 'TerminatedControlComponent' };

        mounted() {
          controlMountedCount += 1;
        }
      }

      addToRegistry('PermanentTerminatedComponent', PermanentComponent);
      addToRegistry('TerminatedControlComponent', ControlComponent);

      const container = h('div');
      document.body.appendChild(container);

      const el = h('div', { 'data-component': 'PermanentTerminatedComponent' });
      container.appendChild(el);

      // Wait for the mutation observer to mount the component.
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(getInstances(PermanentComponent).size).toBe(1);
      expect(mountedCount).toBe(1);
      const firstInstance = Array.from(getInstances(PermanentComponent))[0];

      // Remove the element: the terminate pass of the scan terminates the
      // instance and stamps the marker. `$terminate()` is never called by hand.
      el.remove();
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(getInstances(PermanentComponent).size).toBe(0);
      expect((el as any).__base__.get('PermanentTerminatedComponent')).toBe('terminated');

      // Re-insert the SAME element, together with a brand new control element in
      // the same mutation. The control is a positive control: it proves the scan
      // did run, so the assertions on `el` below are a real "skipped", not a
      // "the observer never fired".
      const controlEl = h('div', { 'data-component': 'TerminatedControlComponent' });
      container.append(el, controlEl);
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Positive control: the scan ran during this very mutation batch.
      expect(controlMountedCount).toBe(1);
      expect(getInstances(ControlComponent).size).toBe(1);

      // The re-inserted element stayed terminated and was skipped.
      expect(getInstances(PermanentComponent).size).toBe(0);
      expect(mountedCount).toBe(1);
      expect((el as any).__base__.get('PermanentTerminatedComponent')).toBe('terminated');

      // Escape hatch #1 — a BRAND NEW node carrying the same `data-component`
      // has no `__base__` marker, so the scan mounts a fresh instance.
      el.remove();
      const freshEl = h('div', { 'data-component': 'PermanentTerminatedComponent' });
      container.appendChild(freshEl);
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(getInstances(PermanentComponent).size).toBe(1);
      expect(mountedCount).toBe(2);
      const freshInstance = Array.from(getInstances(PermanentComponent))[0];
      expect(freshInstance).not.toBe(firstInstance);
      expect(freshInstance.$el).toBe(freshEl);

      // Clean up
      container.remove();
      await Promise.all(
        [...getInstances(PermanentComponent), ...getInstances(ControlComponent)].map((i) =>
          i.$destroy(),
        ),
      );
    });

    it('should still mount a terminated element through explicit instantiation', async () => {
      // The scan skips terminated elements, but nothing makes the element itself
      // unmountable: the constructor overwrites `__base__` unconditionally
      // (`Base.ts`), so `new Ctor(el).$mount()` clears the marker and mounts.
      let mountedCount = 0;
      class RevivableComponent extends Base {
        static config: BaseConfig = { name: 'RevivableTerminatedComponent' };

        mounted() {
          mountedCount += 1;
        }
      }

      addToRegistry('RevivableTerminatedComponent', RevivableComponent);

      const container = h('div');
      document.body.appendChild(container);

      const el = h('div', { 'data-component': 'RevivableTerminatedComponent' });
      container.appendChild(el);

      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(mountedCount).toBe(1);

      // Detach + re-attach so the element ends up terminated but connected.
      el.remove();
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));
      container.appendChild(el);
      await nextTick();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect((el as any).__base__.get('RevivableTerminatedComponent')).toBe('terminated');
      expect(mountedCount).toBe(1);

      // Explicit instantiation is the documented escape hatch.
      const revived = new RevivableComponent(el);
      expect((el as any).__base__.get('RevivableTerminatedComponent')).toBe(revived);

      await revived.$mount();

      expect(revived.$isMounted).toBe(true);
      expect(mountedCount).toBe(2);
      expect(getInstances(RevivableComponent).has(revived)).toBe(true);

      // Clean up
      container.remove();
      await Promise.all(Array.from(getInstances(RevivableComponent)).map((i) => i.$destroy()));
    });
  });
});
