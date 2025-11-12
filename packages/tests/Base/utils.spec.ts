import { describe, it, expect, vi } from 'vitest';
import { Base, withName, getInstances } from '@studiometa/js-toolkit';
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
      foo.$emit(new CustomEvent('mounted'));

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
      foo.$emit(new CustomEvent('mounted'));
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
});
