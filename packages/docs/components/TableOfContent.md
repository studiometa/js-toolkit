---
sidebar: auto
sidebarDepth: 5
prev: /components/Modal.md
next: /components/Tabs.md
---

# Table of content

An accessible, flexible and responsive table of content component, easy to use and easy to extend.

## Example

```html
<div class="TableOfContent">
  <nav data-component="nav">
    <!-- Anchors generated automatically -->
  </nav>

  <section id="first-section" data-ref="sections[]">
    <h2>First section</h2>
    <p>Hendrerit ex nullam viverra eu venenatis litora lacus ultrices, malesuada lobortis lectus volutpat.</p>
  </section>

  <section id="second-section" data-ref="sections[]">
    <h2>Second section</h2>
    <p>Hendrerit ex nullam viverra eu venenatis litora lacus ultrices, malesuada lobortis lectus volutpat.</p>
  </section>

  <section id="third-section" data-ref="sections[]">
    <h2>Third section</h2>
    <p>Hendrerit ex nullam viverra eu venenatis litora lacus ultrices, malesuada lobortis lectus volutpat.</p>
  </section>
</div>
```

## Usage

### JavaScript

You can directly instantiate the `TableOfContent` class on an element:

```js
import TableOfContent from '@studiometa/js-toolkit/components/TableOfContent';

const tableOfContent = new TableOfContent(document.querySelector('.my-custom-table-of-content-element'));
tableOfContent.$mount();
```

Or you can use the component as a child of another one:

```js
import Base from '@studiometa/js-toolkit';
import TableOfContent from '@studiometa/js-toolkit/components/TableOfContent';

class App extends Base {
  static config = {
    name: 'App',
    components: {
      TableOfContent,
    },
  };
}

new App(document.documentElement).$mount();
```

### HTML

The following little HTML is required for the `TableOfContent` component:

```html
<div class="container" data-component="TableOfContent">
  <nav data-ref="nav">
    <!-- Anchors generated automatically -->
  </nav>

  <section id="my-first-section" data-ref="sections[]">
    <!-- Section content -->
  </section>

  <section id="my-second-section" data-ref="sections[]">
    <!-- Section content -->
  </section>
</div>
```

::: tip
The `id` attribute is used to define the anchor `href`.
:::

## API

### Refs

#### `TableOfContent.nav`

This ref is used to define the container where anchors are append.

#### `TableOfContent.anchors[]`

This ref refered to define anchors.

#### `TableOfContent.sections[]`

This ref is used to define sections.

### Options

::: tip
Options can be defined per component via the `data-option-<option-name>` attribute or by extending the `TableOfContent` class.
:::

#### `activeClasses`

- Type: `String`
- Default: `is-active`

### Methods

#### `scrollTo`

You can change the method of scrolling to the section. You need to set the `id` parameter which refers to the targeted section.
