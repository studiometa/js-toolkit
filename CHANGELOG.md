# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

- Release notes are now keep in a [CHANGELOG.md](https://github.com/studiometa/js-toolkit/blob/develop/CHANGELOG.md) file
