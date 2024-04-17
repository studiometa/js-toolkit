# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [v3.0.0-alpha.3](https://github.com/studiometa/js-toolkit/compare/3.0.0-alpha.2..3.0.0-alpha.3) (2023-04-17)

### Added

- Add a `getInstances` helper function ([#428](https://github.com/studiometa/js-toolkit/pull/428))

### Changed

- ⚠️ Enable the `asyncChildren` feature by default ([#427](https://github.com/studiometa/js-toolkit/pull/427))
- ⚠️ Rename the `asyncChildren` feature to `blocking` ([#427](https://github.com/studiometa/js-toolkit/pull/427))

## [v3.0.0-alpha.2](https://github.com/studiometa/js-toolkit/compare/3.0.0-alpha.1..3.0.0-alpha.2) (2023-04-04)

### Added

- Add a `createRange` utility function ([#426](https://github.com/studiometa/js-toolkit/pull/426), [2cb2bac](https://github.com/studiometa/js-toolkit/commit/2cb2bac))

### Fixed

- Fix an import path ([#426](https://github.com/studiometa/js-toolkit/pull/426), [9722d74](https://github.com/studiometa/js-toolkit/commit/9722d74))

## [v3.0.0-alpha.1](https://github.com/studiometa/js-toolkit/compare/3.0.0-alpha.0..3.0.0-alpha.1) (2023-04-04)

### Added

- Add an `easeLinear` function ([#425](https://github.com/studiometa/js-toolkit/pull/425))

### Fixed

- Fix `ease...` tests ([#425](https://github.com/studiometa/js-toolkit/pull/425))

## [v3.0.0-alpha.0](https://github.com/studiometa/js-toolkit/compare/2.12.0..3.0.0-alpha.0) (2023-04-03)

### Added

- Add support for defining breakpoints when using the resize service ([#323](https://github.com/studiometa/js-toolkit/pull/323))
- Add `randomInt` and `randomItem` utility functions ([#398](https://github.com/studiometa/js-toolkit/pull/398))
- Add `isNull` and `isEmpty` utility functions ([#320](https://github.com/studiometa/js-toolkit/pull/320))
- Add an `isEmptyString` utility function ([9f8a9f5](https://github.com/studiometa/js-toolkit/commit/9f8a9f5), [9be5528](https://github.com/studiometa/js-toolkit/commit/9be5528))
- Add support for a `smooth` option for `tween` and `animate` ([#419](https://github.com/studiometa/js-toolkit/pull/419))
- Add support for a `delay` option for `tween` ([#419](https://github.com/studiometa/js-toolkit/pull/419))
- Add support for a `stagger` option for `animate` ([#419](https://github.com/studiometa/js-toolkit/pull/419))
- Add support for `duration` and `stagger` options as functions for `animate` ([#419](https://github.com/studiometa/js-toolkit/pull/419))
- Add a `mean` utility function ([#419](https://github.com/studiometa/js-toolkit/pull/419))
- Add support for custom duration and easing function for `scrollTo` ([#418](https://github.com/studiometa/js-toolkit/pull/418))

### Fixed

- Fix component resolution strategy (close [#403](https://github.com/studiometa/js-toolkit/issues/403), [#404](https://github.com/studiometa/js-toolkit/pull/404))

### Changed

- ⚠️ Rename the static `$factory` method to `$register` and make its single argument optional ([#416](https://github.com/studiometa/js-toolkit/pull/416))
- ⚠️ Refactor definition of breakpoints for the resize service ([#323](https://github.com/studiometa/js-toolkit/pull/323))
- ⚠️ Refactor `focusTrap` for simpler exports ([#406](https://github.com/studiometa/js-toolkit/pull/406))
- Migrate tests from Jest to Bun ([#411](https://github.com/studiometa/js-toolkit/pull/411))
- Refactor the requestAnimationFrame polyfill ([#411](https://github.com/studiometa/js-toolkit/pull/411), [dfd62b6](https://github.com/studiometa/js-toolkit/commit/dfd62b6), [34bb2c5](https://github.com/studiometa/js-toolkit/commit/34bb2c5))
- Improve raf service usage ([#411](https://github.com/studiometa/js-toolkit/pull/411), [352f509](https://github.com/studiometa/js-toolkit/commit/352f509))
- Migrate legacy `pageXOffset` and `pageYOffset` to their equivalent `scrollX` and `scrollY` ([#413](https://github.com/studiometa/js-toolkit/pull/413))
- Update dependencies ([#422](https://github.com/studiometa/js-toolkit/pull/422))
- ⚠️ Change the return value from `scrollTo` from `Promise<number>` to `Promise<{ left: number, top: number }>` ([#418](https://github.com/studiometa/js-toolkit/pull/418))

### Removed

- ⚠️ Remove the `withVue2` decorator ([#395](https://github.com/studiometa/js-toolkit/pull/395))
- ⚠️ Remove the `vue` dependency ([#395](https://github.com/studiometa/js-toolkit/pull/395))
- ⚠️ Remove CJS files from the package ([#394](https://github.com/studiometa/js-toolkit/pull/394))
- ⚠️ Remove the `loaded` hook ([#412](https://github.com/studiometa/js-toolkit/pull/412))
- Remove unnecessary manager instance type check ([#414](https://github.com/studiometa/js-toolkit/pull/414))
- ⚠️ Remove deprecated methods from the `withScrolledInView` decorator ([#415](https://github.com/studiometa/js-toolkit/pull/415))

## [v2.12.0](https://github.com/studiometa/js-toolkit/compare/2.11.2..2.12.0) (2023-12-01)

### Added

- Add `startsWith` and `endsWith` utils ([#389](https://github.com/studiometa/js-toolkit/pull/389))

### Changed

- Improve performance by migrating from `forEach` to `for…of` for loops ([#391](https://github.com/studiometa/js-toolkit/pull/391))
- Update NPM dependencies ([#392](https://github.com/studiometa/js-toolkit/pull/392))

## [v2.11.2](https://github.com/studiometa/js-toolkit/compare/2.11.1..2.11.2) (2023-07-13)

### Fixed

- Fix packages version ([ee0db8b](https://github.com/studiometa/js-toolkit/commit/ee0db8bf5e2faf99f8d932b4bacf8ade1324a5f6))

## [v2.11.1](https://github.com/studiometa/js-toolkit/compare/2.11.0..2.11.1) (2023-07-13)

### Changed

- Update `package-lock.json` ([0eac343](https://github.com/studiometa/js-toolkit/commit/0eac3438fedcd72a3500fdfc14494dc07ef93f46))
- Bump node version in CI ([8100481](https://github.com/studiometa/js-toolkit/commit/8100481cac3e44cf7533964a8a3fb82786f788e5))

## [v2.11.0](https://github.com/studiometa/js-toolkit/compare/2.10.3..2.11.0) (2023-07-13)

### Added

- **usePointer:** add support for props relative to an element ([#377](https://github.com/studiometa/js-toolkit/pull/377))
- Add a `withRelativePointer` decorator ([#377](https://github.com/studiometa/js-toolkit/pull/377))

### Fixed

- Fix refs name normalization when used with prefix ([#361](https://github.com/studiometa/js-toolkit/pull/361))

### Changed

- Update dependencies ([#378](https://github.com/studiometa/js-toolkit/pull/378))

## [v2.10.3](https://github.com/studiometa/js-toolkit/compare/2.10.2..2.10.3) (2023-05-17)

### Changed

- Loosen the Vue version constraint ([da22e8a](https://github.com/studiometa/js-toolkit/commit/da22e8a))

## [v2.10.2](https://github.com/studiometa/js-toolkit/compare/2.10.1..2.10.2) (2023-04-19)

### Fixed

- Fix missing extension throwing error in ESM ([3c08d58](https://github.com/studiometa/js-toolkit/commit/3c08d58))

## [v2.10.1](https://github.com/studiometa/js-toolkit/compare/2.10.0..2.10.1) (2023-04-19)

### Fixed

- Fix missing extension throwing error in ESM ([055bde4](https://github.com/studiometa/js-toolkit/commit/055bde4))

## [v2.10.0](https://github.com/studiometa/js-toolkit/compare/2.9.1..2.10.0) (2023-04-17)

### Added

- Add an `importOnMediaQuery` helper function to import a component based on a provided media query ([#313](https://github.com/studiometa/js-toolkit/pull/313))
- Add an `importWhenPrefersMotion` helper function to import a component when the user accepts motion ([#313](https://github.com/studiometa/js-toolkit/pull/313))
- Add a `withMountOnMediaQuery` decorator that mounts a component based on a provided media query ([#313](https://github.com/studiometa/js-toolkit/pull/313))
- Add a `withMountWhenPrefersMotion` decorator that mounts a component when the user accepts motion ([#313](https://github.com/studiometa/js-toolkit/pull/313))

### Fixed

- **easeInExpo**: fix the expo easing functions never reaching 0 or 1 ([#353](https://github.com/studiometa/js-toolkit/pull/353))
- Fix doc layout being broken on some pages ([3c88cbc](https://github.com/studiometa/js-toolkit/commit/3c88cbc))

### Changed

- Use VitePress native local search ([84d3e44](https://github.com/studiometa/js-toolkit/commit/84d3e44))
- Change Vue from a dev to a peer dependency ([ecffe63](https://github.com/studiometa/js-toolkit/commit/ecffe63))
- Update NPM dependencies ([#355](https://github.com/studiometa/js-toolkit/pull/355), [#358](https://github.com/studiometa/js-toolkit/pull/358), [5701a4c](https://github.com/studiometa/js-toolkit/commit/5701a4c), [d0bfa0c](https://github.com/studiometa/js-toolkit/commit/d0bfa0c))

## [v2.9.1](https://github.com/studiometa/js-toolkit/compare/2.9.0..2.9.1) (2023-02-08)

### Fixed

- **useDrag:** listen for drop events on the window instead of the target element ([#348](https://github.com/studiometa/js-toolkit/pull/348))
- **getInstanceFromElement:** fix getting an instance from a falsy element ([#349](https://github.com/studiometa/js-toolkit/pull/349))
- **withScrolledInView:** fix division by 0 resulting in `NaN` progress value ([#350](https://github.com/studiometa/js-toolkit/pull/350))

### Changed

- **createApp**: improve timing of app instanciation when using the `asyncChildren` feature ([#351](https://github.com/studiometa/js-toolkit/pull/351))

## [v2.9.0](https://github.com/studiometa/js-toolkit/compare/2.8.0..2.9.0) (2023-01-28)

### Added

- Add a `SmartQueue` utility class ([f179d8b](https://github.com/studiometa/js-toolkit/commit/f179d8b))
- Add a `wait` utility function ([7c9d038](https://github.com/studiometa/js-toolkit/commit/7c9d038))
- **Base:** add a `$warn()` helper ([#335](https://github.com/studiometa/js-toolkit/pull/335))
- **Queue:** add support for promises for easier task orchestration ([#341](https://github.com/studiometa/js-toolkit/pull/341))

### Fixed

- **Base:** fix and improve the async children feature ([#328](https://github.com/studiometa/js-toolkit/pull/328), [79f295f](https://github.com/studiometa/js-toolkit/commit/79f295f))
- **withScrolledInView:** fix props sometimes not being defined ([#343](https://github.com/studiometa/js-toolkit/pull/343))

### Changed

- Improve the `nextTick` utility function ([ca35e6b](https://github.com/studiometa/js-toolkit/commit/ca35e6b))

## [v2.8.0](https://github.com/studiometa/js-toolkit/compare/2.7.0..2.8.0) (2023-01-19)

### Added

- **Base:**
  - add support for multiple component declaration in data-component attributes ([#330](https://github.com/studiometa/js-toolkit/pull/330))
  - add support for refs with prefix ([#339](https://github.com/studiometa/js-toolkit/pull/339))
- **withScrolledInView:** add support for defining offsets ([#321](https://github.com/studiometa/js-toolkit/pull/321))
- **animate:** add support for animating CSS Custom Properties ([#332](https://github.com/studiometa/js-toolkit/pull/332))

### Fixed

- **isNumber:** fix `NaN` values being considered as numbers ([deccdd1](https://github.com/studiometa/js-toolkit/commit/deccdd1))
- **getOffsetSizes:** fix a bug where the width was used instead of the height ([c95885b](https://github.com/studiometa/js-toolkit/commit/c95885b))

## [v2.7.0](https://github.com/studiometa/js-toolkit/compare/2.6.5..2.7.0) (2022-12-02)

### Added

- Add support for feature flags ([dbb865a](https://github.com/studiometa/js-toolkit/commit/dbb865a))
- Add an `AsyncChildrenManager` to improve performance of initial app creation ([#309](https://github.com/studiometa/js-toolkit/pull/309))

```js
createApp(App, { features: { asyncChildren: true } });
```

### Changed

- Migrate remaining JS files to TypeScript ([#310](https://github.com/studiometa/js-toolkit/pull/310))

## [v2.6.5](https://github.com/studiometa/js-toolkit/compare/2.6.4...2.6.5) (2022-11-30)

### Fixed

- Fix tween never triggering the `onFinish` callback ([5f4632b](https://github.com/studiometa/js-toolkit/commit/5f4632b))

### Changed

- Release notes are now kept in a [CHANGELOG.md](https://github.com/studiometa/js-toolkit/blob/develop/CHANGELOG.md) file

## v2.6.4 (2022-11-02)

### Fixed

- **service(drag):** fix drag service on chrome when using touch by adding touchend event (#306)

## v2.6.3 (2022-10-15)

### Fixed

- Fix types (#305, 0b0137e)

## v2.6.2 (2022-10-15)

### Fixed

- Fix return function of the `useRaf` service not executing (#304, 22d92d7)

### Changed

- Update NPM dependencies (#304, dbbd1a9)

## v2.6.1 (2022-09-29)

### Fixed

- **addClass, removeClass, toggleClass:** fix a bug where empty classes could be used (#298, fix ##283)

### Changed

- Ship ESNext JavaScript (#296)
- Add sourcemaps (#296)

## v2.6.0 (2022-09-20)

### Added

- Add support for multiple target for the following utilities (#282):
  - `transition`
  - `animate`
  - `transform`
  - `addStyle`
  - `removeStyle`
  - `addClass`
  - `removeClass`
  - `toggleClass`

## v2.5.0 (2022-09-13)

### Added

- Add support for `onDocument…` and `onWindow…` hook methods (#265)
- Add a `getClosestParent` helper (#260)

### Fixed

- Fix drag service with touch events (#290)
- Limit drag service to left-click (#263)

## v2.4.7 (2022-09-12)

### Fixed

- Fix exports definition (d4efde9)

## v2.4.6 (2022-09-05)

### Fixed

- Fix a recursive type definition (90fdf96, #280)
- Fix a bug where refs could be undefined (#279, fixes #278)

## v2.4.5 (2022-09-05)

### Fixed

- Fix release GitHub Action (20998cf)

## v2.4.4 (2022-09-05)

### Changed

- Improve types (#275, closes #273)

## v2.4.3 (2022-08-19)

### Changed

- Improve new types introduced in v2.4.2 (1df4452)

## v2.4.2 (2022-08-18)

### Fixed

- **withScrolledInView**
  - Use damping on the current value instead of the progress (dd51924, #270)
  - Fix a bug where damped values were not updated on destroy (ba93c1b, #270)
- **transition**
  - Fix transition utility waiting too long between updates (74db79a)

### Changed

- **Types**
  - Improve types definition for components (#271)
  - Add service props types to the main entrypoint (23b6fe2)
- Update NPM dependencies (1e5fdfa, f6b0e52)

## v2.4.1 (2022-07-18)

### Fixed

- Fix docs title (b4709e2)

## v2.4.0 (2022-07-18)

### Added

- Add a `getDirectChildren(parentInstance, parentName, childrenName)` helper function (#253, c89e123)
- Add a `isDirectChild(parentInstance, parentName, childInstance, childName)` helper function (#253, 04693b0)

### Fixed

- Revert "Change build target to ES2022" (c51f580)

## v2.3.0 (2022-07-14)

### Added

- Add a `tween` utility function (#249)
- Add support for native event methods on child components (fix #248, #247, 3b6026d)
- Add `is...` utility functions: `isObject`, `isBoolean`, `isString`, `isNumber`, `isArray` and `hasWindow` (#247)
- Add an export of the `isDev` constant (#247)

### Changed

- Limit errors and warnings to dev environements (presence of a `__DEV__` global var) (#247)
- Refactor `is...` and `has...` test functions (#247)
- Change build target to ES2022 (fa4ebd6)

### Fixed

- Add missing support for access to the `event.detail` data when working with CustomEvent with the event hooks (#250)
- Only bind event methods to the root element for defined or native events (#247, 0e202c4)

## v2.2.3 (2022-06-23)

### Changed

- Refactor services (#244)
- Export `noop`, `noopValue` and `useService` internal functions (#244)
- Reduce log messages lengths (#244, 8492038)

## v2.2.2 (2022-06-14)

### Fixed

- Fix usage of the package server-side (#240, 88fa448)
- Fix a circular type reference (#240, cf487e8)

### Documentation

- Add example on how to pass a component option as a prop `withVue2` decorator (#238)

## v2.2.1 (2022-06-13)

### Fixed

- Fix `ease` export to contain only easing functions (#239, d6720f9)

## v2.2.0 (2022-05-26)

### Added

- Add a `useScheduler` utility function to create schedulers (#232)
- Add a `domScheduler` utility scheduler object to group read and write DOM interactions (#232)
- Add support for scheduled actions for the `useRaf` service by returning a function inside callbacks (#232)

### Changed

- Improve performance of the animate function (#232)
- Improve `EventsManager` performance by caching function results (#235)

## v2.1.0 (2022-05-16)

### Added

- Add a `withResponsiveOptions` decorator (#225)
- Add an `animate(el, keyframes[, options])` utility function (#230)
- Add a `transform(el, props)` utility function (#230)
- Add a before-mounted internal event (#230)

### Fixed

- Fix overriding methods with the `withScrolledInView` decorator (#230)

## v2.0.1 (2022-04-07)

### Fixed

- Fix usage of the scroll service props (8d34ecf)
- Fix transition failing to add the active classes (63f4476)

### Changed

- Allow overriding options with the `withFreezedOptions` decorator (f1fd094)

## v2.0.0 (2022-04-01)

### Added

- Add support for accessing registered services' props (#220)
- Add a `getInstanceFromElement` helper (4b034a0)

### Changed

- Update dependencies (#221, 88a36a7, 17690cd, 1672157, 818ad6d)

## v2.0.0-rc.2 (2022-03-22)

### Fixed

- Add support for `vueConfig` as getter (#190, #217, ebfa90d)
- Allow configuration of the freezed options (#217, a01daf3)
- Fix release of RC version with the next tag (#217, 4a459a5)

## v1.7.4 (2022-03-22)

### Fixed

- Override deployment of `2.0.0-rc.1` to the latest tag on NPM

## v2.0.0-rc.1 (2022-03-21)

### Added

- Add a `withFreezedOptions` decorator to make the `$options` property read-only (#215)
- Add support for control over `Array` and `Object` options mergeability (#214)

## v2.0.0-beta.18 (2022-02-24)

### Added

- Add support for multiple instance on a single HTML element (#206)
- Add support for optional root element for the `createApp` helper (4bee699)
- Add `nextTick` schedule utility function (#207)
- Add `nextMicrotask` schedule utility function (#207)
- Add exports for the class and style utility functions (#208)
- Add support for array of classes for the transition function object parameter (#208)

### Changed

- `nextFrame` waits only for one frame instead of chaining two `requestAnimationFrame` calls (#207)
- Improve types of the `transition` function (#208)

## v2.0.0-beta.17 (2022-02-15)

### Fixed

- **Services (drag):** remove a forbidden `preventDefault()` call (the event is passive) (a275700)

## v2.0.0-beta.16 (2022-02-14)

### Fixed

- Fix links and images usage in drag element (5c42eb5, #203)

### Added

- Add the `dragTreshold` option to the `useDrag` service (da7c20b, #203)

## v2.0.0-beta.15 (2022-01-24)

### Changed

- Allow usage of the `withIntersectionObserver` decorator without defining the intersected method (#197)

### Fixed

- Remove the obsolete `@babel/runtime` dependency (d814c38)
- Lower the build target to es2019 (4032a5e)

## v2.0.0-beta.14 (2022-01-21)

### Fixed

- Fix CJS build (c7c7d46)

## v2.0.0-beta.13 (2022-01-21)

### Fixed

- Fix extensions of built files in CJS format (56a6ee5)

## v2.0.0-beta.12 (2022-01-21)

### Added

- Add support for CommonJS usage (#193)

### Changed

- Improve docs (#168)

### Fixed

- Add a missing export (213f4ce)

## v2.0.0-beta.11 (2022-01-20)

### Fixed

- Fix the calculation of the scroll target offsets (1e072a1)

## v2.0.0-beta.10 (2022-01-14)

### Added

- Add a search bar to the doc with `vue-kbar` (#188)

## v2.0.0-beta.9 (2022-01-13)

### Added

- Add easing functions (#184)

### Fixed

- Add support for custom `IntersectionObserver` options for the `withScrolledInView` decorator (#185)
- Add missing doc for decorators
- Fix a bug where refs could be undefined (#183, #186, 9e891bf)
- Add a missing event definition (#183, #186, fc8ef57)

## v2.0.0-beta.8 (2022-01-10)

### Fixed

- Fix types (b28a39e)

## v2.0.0-beta.7 (2022-01-10)

### Changed

- Improve `withScrolledInView` decorator performance (#180)

## v2.0.0-beta.6 (2022-01-08)

### Changed

- Improve services performances (#176)
- Breaking: Events emitted by a component must be configured (#178)

```diff
  class Foo extends Base {
    static config = {
      name: 'Foo',
+     emits: ['open', 'close'],
    };

    open() {
      this.$emit('open');
    }

    close() {
      this.$emit('close);
    }
  }
```

- Update NPM dependencies (#177)

### Removed

- Breaking: Remove `get:...` events to alter `$refs`, `$options`, `$services` and `$children` getters (4e29610)
  The getters should be overwritten in child classes to alter their value:

```js
class Foo extends Base {
  static config = {
    name: 'Foo',
  };

  get $refs() {
    const $refs = super.$refs;
    $refs.myCustomRef = document.querySelector('.my-custom-ref');
    return $refs;
  }
}
```

## v2.0.0-beta.5 (2021-12-13)

### Fixed

- Fix the `scrollTo` utility calculations (8c03043)

### Changed

- Update NPM dependencies (#171)

## v2.0.0-beta.4 (2021-11-23)

### Fixed

- Bump version number in `package.json` files (b25cd3f)

## v2.0.0-beta.3 (2021-11-23)

### Fixed

- Fix changelog generation in release action (8226d9a)

### Changed

- Improve GitHub actions performances (746c4d4)

## v2.0.0-beta.2 (2021-11-23)

### Fixed

- Fix release action (f8895e7)

## v2.0.0-beta.1 (2021-11-22)

### Added

- **Doc:** Add a migration guide from v1 to v2 (#164)

### Fixed

- **Doc:** Fix a broken link (#163)

## v2.0.0-beta.0 (2021-11-16)

### Changed

- Breaking: Refs are searched from the ones defined in the config only

```html
<div data-component="Foo">
  <div data-ref="defined"></div>
  <div data-ref="undefined"></div>
</div>

<script>
  class Foo extends Base {
    static config = {
      name: 'Foo',
      refs: ['defined'],
    };

    mounted() {
      console.log(this.$refs); // Before: { defined: HTMLElement, undefined: HTMLElement }
      console.log(this.$refs); // After: { defined: HTMLElement }
    }
  }
</script>
```

- Breaking: Refs are no longer resolved to the element's attached Base instance if it exists

```html
<div data-component="Foo">
  <div data-ref="bar" data-component="Bar"></div>
</div>

<script>
  class Bar extends Base {
    static config = { name: 'Bar' };
  }

  class Foo extends Base {
    static config = {
      name: 'Foo',
      refs: ['bar'],
      components: { Bar },
    };

    mounted() {
      console.log(this.$refs); // Before: { bar: Bar }
      console.log(this.$refs); // After: { bar: HTMLElement }
    }
  }
</script>
```

- Breaking: Refs are only resolved when the component is mounted (#137)
- Breaking: Children components are only resolved when the component is mounted (#137)
- Improve typings (2642ab5, #137)
- Improve `Accordion` component tests (08bc1f2, #137)
- Breaking: remove the autobind of all methods (21d24e3, #137)
- Breaking: change build target to browsers supporting ESM (359cd84, #137)
- Breaking: Replace default export with named export (3a0a22c, #137)
- Breaking: Refactor `OptionsManager` to not update the DOM when setting `Array` or `Object` options (56ffe0b, #137)
- Improve `withBreakpointManager` decorator (633d2c5, #137)
- Refactor `EventsManager` to use `EventListener` objects (8c0644c, #137)
- Refactor the debug method (977b5d3, #137)
- Replace private properties by public properties prefixed by `__` (5d0d064, #137)
- Breaking: Refactor the config and options management (7556c2f, #137)
- Breaking: Refactor the events' management (b37bc9c, #137)
- Refactor the `Service` abstract class (b0eeb1e, #137)
- Refactor child components management (05f9040, #137)
- Breaking: Flatten the exports of the `@studiometa/js-toolkit/utils` path (#154)
- Breaking: Rename the `push` and `replace` function from the history utils to `historyPush` and `historyReplace` (#154)

### Added

- Add a `memoize(fn)` utility (cb6848d, db6bb74, b62deb8, #137)
- Add helpers exports to the main entry point (0e7407b, #137)
- Add support for negated boolean options with `data-option-no-...` (#143)
- Add a `withVue2` decorator (#148)
- Add a `withScrolledInView` decorator (#156)
- Add a `scrollTo` utility (#135)

### Removed

- Breaking: remove legacy helpers (bbbd9cc, #137)
- Breaking: Remove the `$once()` method (aee1acc, #137)
- Breaking: Remove the full build (13af657, #137)
- Breaking: Delete an obsolete folder level (3aeebb8, #137)
- Breaking: Remove the legacy options management (d9806a1, #137)
- Remove an obsolete import/export (02a1979, #137)
- Breaking: Remove refs resolution to component instance (131c20d, #137)

### Fixed

- Fix a bug where the `withBreakpointManager` was mixing its child instances (8875db6, #137)
- Fix a bug where the resize event was triggered by an infinite loop (9006fc2, #137)
