/* eslint no-underscore-dangle: ["error", { "allow": ["_events"] }] */
import EventManager from '../../src/abstracts/EventManager';

describe('EventManager class', () => {
  it('can register callbacks to events', () => {
    const eventManager = new EventManager();
    const foo = jest.fn();
    eventManager.$on('foo', foo);
    expect(eventManager._events.foo[0]).toEqual(foo);

    eventManager.$emit('foo');
    eventManager.$emit('foo', 'bar', 'baz');

    expect(foo).toHaveBeenCalledTimes(2);
    expect(foo).toHaveBeenCalledWith('bar', 'baz');
  });

  it('returns a method to unbind the binded function', () => {
    const eventManager = new EventManager();
    const foo = jest.fn();
    const unbind = eventManager.$on('foo', foo);

    eventManager.$emit('foo');
    unbind();
    eventManager.$emit('foo');

    expect(foo).toHaveBeenCalledTimes(1);
  });

  it('fails silently when trying to unbind an unbounded method', () => {
    const eventManager = new EventManager();
    const foo = jest.fn();
    const bar = jest.fn();

    eventManager.$on('foo', foo);
    eventManager.$emit('foo');
    eventManager.$off('foo', bar);

    expect(eventManager._events.foo).toHaveLength(1);
    expect(eventManager._events.foo[0]).toBe(foo);
  });

  it('can unregister a specific callback from an event', () => {
    const eventManager = new EventManager();
    const foo = jest.fn();
    eventManager.$on('foo', foo);
    eventManager.$emit('foo');
    eventManager.$off('foo', foo);
    expect(eventManager._events.foo).toHaveLength(0);
    eventManager.$emit('foo');
    expect(foo).toHaveBeenCalledTimes(1);
  });

  it('can unregister all callbacks from an event', () => {
    const eventManager = new EventManager();
    const foo = jest.fn();
    const bar = jest.fn();
    eventManager.$on('foo', () => foo());
    eventManager.$on('foo', () => bar());

    expect(eventManager._events.foo).toHaveLength(2);

    eventManager.$emit('foo');
    eventManager.$off('foo');

    expect(foo).toHaveBeenCalledTimes(1);
    expect(bar).toHaveBeenCalledTimes(1);
    expect(eventManager._events.foo).toHaveLength(0);
  });

  it('can disable all events from itself', () => {
    const eventManager = new EventManager();
    const foo = jest.fn();
    const bar = jest.fn();
    eventManager.$on('foo', () => foo());
    eventManager.$on('bar', () => bar());

    expect(eventManager._events.foo).toHaveLength(1);
    expect(eventManager._events.bar).toHaveLength(1);

    eventManager.$off();

    expect(eventManager._events.foo).toBeUndefined();
    expect(eventManager._events.bar).toBeUndefined();

    eventManager.$emit('foo');
    eventManager.$emit('bar');

    expect(foo).toHaveBeenCalledTimes(0);
    expect(bar).toHaveBeenCalledTimes(0);
  });

  it('can listen to an event only once', () => {
    const eventManager = new EventManager();
    const foo = jest.fn();
    eventManager.$once('foo', foo);
    eventManager.$emit('foo');
    eventManager.$emit('foo');

    expect(foo).toHaveBeenCalledTimes(1);
    expect(eventManager._events.foo).toHaveLength(0);
  });
});
