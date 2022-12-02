# Changelog

All notable changes to this project will be documented in this file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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
