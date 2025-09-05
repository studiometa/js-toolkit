# AGENTS

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is @studiometa/js-toolkit, a JavaScript data-attributes driven micro-framework with utility functions. The project is a monorepo using NPM workspaces with the following structure:

- **packages/js-toolkit/**: Main framework code (TypeScript)
- **packages/tests/**: Test suite using Vitest
- **packages/demo/**: Demo application
- **packages/docs/**: VitePress documentation site

The framework allows defining components as classes that bind to DOM elements via `data-component` attributes, with refs (`data-ref`), options (`data-option-*`), and child components.

## Development Commands

### Testing

- `npm test` - Run all tests
- `npm test -- -- <PATTERN>` - Run tests matching `<PATTERN>`
- `npm run test:watch` - Watch mode for tests

### Linting and Type Checking

- `npm run lint` - Run all linting (oxlint, TypeScript, docs formatting)
- `npm run lint:oxlint` - JavaScript/TypeScript linting with oxlint
- `npm run lint:types` - TypeScript type checking
- `npm run lint:docs` - Check docs formatting with Prettier
- `npm run fix` - Auto-fix formatting issues

### Building

- `npm run build` - Full build (cleans dist, builds package, types, copies files)
- `npm run build:pkg` - Build JavaScript bundle with esbuild
- `npm run build:types` - Generate TypeScript declarations

### Development Servers

- `npm run demo:dev` - Start demo development server
- `npm run demo:build` - Build demo for production
- `npm run docs:dev` - Start documentation development server
- `npm run docs:build` - Build documentation

## Architecture

### Core Framework Structure

- **Base class** (`packages/js-toolkit/Base/`): Main component base class with lifecycle methods, managers for refs/options/children/events
- **Managers** (`packages/js-toolkit/Base/managers/`): Handle refs, options, children, events, and services
- **Decorators** (`packages/js-toolkit/decorators/`): Higher-order functions that extend component functionality (withMountWhenInView, withDrag, withMutation, etc.)
- **Services** (`packages/js-toolkit/services/`): Global services like scheduler, mutation observer, etc.
- **Helpers** (`packages/js-toolkit/helpers/`): Framework utilities including `createApp` function
- **Utils** (`packages/js-toolkit/utils/`): Comprehensive utility functions organized by category (DOM, CSS, math, collision detection, etc.)

### Key Concepts

- Components extend the `Base` class and define a static `config` object
- `createApp()` instantiates root components on page load
- Components use lifecycle methods (`mounted()`, `destroyed()`, event handlers like `onRefClick()`)
- Decorators provide reusable behaviors across components
- Data attributes drive component instantiation and configuration

### Build System

- Uses esbuild for bundling TypeScript to ESM
- TypeScript compilation with multiple tsconfig files (build, lint)
- Outputs to `dist/` directory preserving source structure
- Package.json gets modified during build (index.ts → index.js)

### Testing

- Vitest with Happy DOM environment
- Tests use `#private/*` imports to access internal modules
- Coverage tracking with v8 provider
- Test files mirror source structure in `packages/tests/`

## Import Patterns

- Main exports: `import { Base, createApp } from '@studiometa/js-toolkit'`
- Utils only: `import { debounce, nextFrame } from '@studiometa/js-toolkit/utils'`
- Internal (tests): `import { ... } from '#private/...'`
- Test utils: `import { ... } from '#test-utils'`
