import { describe, it, expect, vi } from 'vitest';
import { Base, BaseConfig, logTree } from '@studiometa/js-toolkit';
import { h } from '#test-utils';

class Child extends Base {
  static config: BaseConfig = {
    name: 'Child',
  };
}

class Parent extends Base {
  static config: BaseConfig = {
    name: 'Parent',
    components: { Child },
  };
}

class App extends Base {
  static config: BaseConfig = {
    name: 'App',
    components: { Parent, Child },
  };
}

describe('logTree', () => {
  it('should log the component tree without throwing', async () => {
    const div = h('div', {}, [
      h('div', { dataComponent: 'Parent' }, [
        h('div', { dataComponent: 'Child' }),
        h('div', { dataComponent: 'Child' }),
      ]),
      h('div', { dataComponent: 'Child' }),
    ]);

    const app = new App(div);
    await app.$mount();

    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const groupCollapsedSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    expect(() => logTree(app)).not.toThrow();

    // Should open a root group with the app name
    expect(groupSpy).toHaveBeenCalledWith(expect.stringContaining('App'));

    // Should have logged child components
    const allLabels = [
      ...groupCollapsedSpy.mock.calls.map((c) => c[0]),
      ...logSpy.mock.calls.map((c) => c[0]),
    ].filter((c) => typeof c === 'string');

    expect(allLabels.some((l) => l.includes('Parent'))).toBe(true);
    expect(allLabels.some((l) => l.includes('Child'))).toBe(true);

    // Should close all groups
    expect(groupEndSpy).toHaveBeenCalled();

    groupSpy.mockRestore();
    groupCollapsedSpy.mockRestore();
    groupEndSpy.mockRestore();
    logSpy.mockRestore();

    await app.$destroy();
  });

  it('should show mounted status indicator', async () => {
    const div = h('div', {}, [
      h('div', { dataComponent: 'Child' }),
    ]);

    const app = new App(div);
    await app.$mount();

    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

    logTree(app);

    // Mounted instances should have ● indicator
    const allLabels = logSpy.mock.calls.map((c) => c[0]).filter((c) => typeof c === 'string');
    expect(allLabels.some((l) => l.includes('●'))).toBe(true);

    groupSpy.mockRestore();
    logSpy.mockRestore();
    groupEndSpy.mockRestore();

    await app.$destroy();
  });

  it('should handle empty tree (no children)', async () => {
    const div = h('div');
    const app = new App(div);
    await app.$mount();

    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

    expect(() => logTree(app)).not.toThrow();

    // Should still open and close the root group
    expect(groupSpy).toHaveBeenCalledTimes(1);
    expect(groupEndSpy).toHaveBeenCalledTimes(1);

    groupSpy.mockRestore();
    groupEndSpy.mockRestore();

    await app.$destroy();
  });

  it('should nest components correctly based on DOM structure', async () => {
    const div = h('div', {}, [
      h('div', { dataComponent: 'Parent' }, [
        h('div', { dataComponent: 'Child' }),
      ]),
    ]);

    const app = new App(div);
    await app.$mount();

    const groupCollapsedSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

    logTree(app);

    // Parent should be in a groupCollapsed (has children)
    const parentCall = groupCollapsedSpy.mock.calls.find((c) =>
      typeof c[0] === 'string' && c[0].includes('Parent'),
    );
    expect(parentCall).toBeDefined();

    // Child should be in a log (leaf node)
    const childCall = logSpy.mock.calls.find((c) =>
      typeof c[0] === 'string' && c[0].includes('Child'),
    );
    expect(childCall).toBeDefined();

    groupCollapsedSpy.mockRestore();
    logSpy.mockRestore();
    groupSpy.mockRestore();
    groupEndSpy.mockRestore();

    await app.$destroy();
  });

  it('should handle deeply nested components', async () => {
    class GrandChild extends Base {
      static config: BaseConfig = { name: 'GrandChild' };
    }

    class DeepParent extends Base {
      static config: BaseConfig = {
        name: 'DeepParent',
        components: { GrandChild },
      };
    }

    class DeepApp extends Base {
      static config: BaseConfig = {
        name: 'DeepApp',
        components: { DeepParent },
      };
    }

    const div = h('div', {}, [
      h('div', { dataComponent: 'DeepParent' }, [
        h('div', { dataComponent: 'GrandChild' }),
      ]),
    ]);

    const app = new DeepApp(div);
    await app.$mount();

    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const groupCollapsedSpy = vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

    logTree(app);

    // DeepParent should be a group (has GrandChild)
    expect(groupCollapsedSpy.mock.calls.some((c) =>
      typeof c[0] === 'string' && c[0].includes('DeepParent'),
    )).toBe(true);

    // GrandChild should be a leaf log
    expect(logSpy.mock.calls.some((c) =>
      typeof c[0] === 'string' && c[0].includes('GrandChild'),
    )).toBe(true);

    groupSpy.mockRestore();
    groupCollapsedSpy.mockRestore();
    logSpy.mockRestore();
    groupEndSpy.mockRestore();

    await app.$destroy();
  });

  it('should handle multiple siblings at the same level', async () => {
    const div = h('div', {}, [
      h('div', { dataComponent: 'Child' }),
      h('div', { dataComponent: 'Child' }),
      h('div', { dataComponent: 'Child' }),
    ]);

    const app = new App(div);
    await app.$mount();

    const groupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const groupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

    logTree(app);

    // All 3 children should be logged as leaves
    const childLogs = logSpy.mock.calls.filter((c) =>
      typeof c[0] === 'string' && c[0].includes('Child'),
    );
    expect(childLogs).toHaveLength(3);

    groupSpy.mockRestore();
    logSpy.mockRestore();
    groupEndSpy.mockRestore();

    await app.$destroy();
  });
});
