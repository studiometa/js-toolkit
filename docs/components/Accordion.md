---
sidebar: auto
sidebarDepth: 5
prev: /components/
next: false
---

# Accordion

## Examples

### Simple

To hide the `AccordionItem` just put `style="display: none;"` and `aria-hidden="true"`.

You can add in html `tabindex="-1"` to the `AccordionItem` components, this has the effect of disabling the selection of elements inside the accordion. This is a good practice for accessibility. The component will change this attribute when the accordion is opened and re-closed.

To open an accordion, use instead the html element `<button type="button">`, because it allows to be selected with the keyboard and is therefore better suited for people using the "accessibility" features of their browsers.

<Preview>
  <div class="accordion" data-component="Accordion">
    <article class="border -mb-px p-4" data-component="AccordionItem">
      <header>
        <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
          Question
        </button>
      </header>
      <div
        data-ref="AccordionItem.content"
        aria-hidden="true"
        tabindex="-1"
        style="display: none;">
        <div class="pt-4">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
            Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
            Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
          </p>
        </div>
      </div>
    </article>
    <article class="border -mb-px p-4" data-component="AccordionItem">
      <header>
        <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
          Question
        </button>
      </header>
      <div
        data-ref="AccordionItem.content"
        aria-hidden="true"
        tabindex="-1"
        style="display: none;">
        <div class="pt-4">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
            Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
            Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
          </p>
        </div>
      </div>
    </article>
  </div>
</Preview>

```html
<div class="accordion" data-component="Accordion">
  <article class="border -mb-px p-4" data-component="AccordionItem">
    <header>
      <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
        Question
      </button>
    </header>
    <div
      data-ref="AccordionItem.content"
      aria-hidden="true"
      tabindex="-1"
      style="display: none;">
      <div class="pt-4">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
          Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
          Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
        </p>
      </div>
    </div>
  </article>
  <article class="border -mb-px p-4" data-component="AccordionItem">
    <header>
      <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
        Question
      </button>
    </header>
    <div
      data-ref="AccordionItem.content"
      aria-hidden="true"
      tabindex="-1"
      style="display: none;">
      <div class="pt-4">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
          Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
          Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
        </p>
      </div>
    </div>
  </article>
</div>
```

### Default open item

It is possible to display an `AccordionItem` by default. To do this it's very simple, just don't set the block style to `none` and set the `aria-hidden` to `false`.

<Preview>
  <div class="accordion" data-component="Accordion">
    <article class="border -mb-px p-4" data-component="AccordionItem">
      <header>
        <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
          Question
        </button>
      </header>
      <div
        data-ref="AccordionItem.content"
        aria-hidden="false">
        <div class="pt-4">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
            Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
            Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
          </p>
        </div>
      </div>
    </article>
    <article class="border -mb-px p-4" data-component="AccordionItem">
      <header>
        <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
          Question
        </button>
      </header>
      <div
        data-ref="AccordionItem.content"
        aria-hidden="true"
        tabindex="-1"
        style="display: none;">
        <div class="pt-4">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
            Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
            Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
          </p>
        </div>
      </div>
    </article>
  </div>
</Preview>

```html
<div class="accordion" data-component="Accordion">
  <article class="border -mb-px p-4" data-component="AccordionItem">
    <header>
      <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
        Question
      </button>
    </header>
    <div
      data-ref="AccordionItem.content"
      aria-hidden="false">
      <div class="pt-4">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
          Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
          Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
        </p>
      </div>
    </div>
  </article>
  <article class="border -mb-px p-4" data-component="AccordionItem">
    <header>
      <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
        Question
      </button>
    </header>
    <div
      data-ref="AccordionItem.content"
      aria-hidden="true"
      tabindex="-1"
      style="display: none;">
      <div class="pt-4">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
          Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
          Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
        </p>
      </div>
    </div>
  </article>
</div>
```

### Items auto-close

To close items other than the one you just clicked, just pass the `itemAutoClose: true` parameter. This option is passed to the `Accordion` component.

<Preview>
  <div class="accordion" data-component="Accordion" data-options='{ "itemAutoClose": true }'>
    <article class="border -mb-px p-4" data-component="AccordionItem">
      <header>
        <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
          Question
        </button>
      </header>
      <div
        data-ref="AccordionItem.content"
        aria-hidden="true"
        tabindex="-1"
        style="display: none;">
        <div class="pt-4">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
            Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
            Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
          </p>
        </div>
      </div>
    </article>
    <article class="border -mb-px p-4" data-component="AccordionItem">
      <header>
        <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
          Question
        </button>
      </header>
      <div
        data-ref="AccordionItem.content"
        aria-hidden="true"
        tabindex="-1"
        style="display: none;">
        <div class="pt-4">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
            Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
            Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
          </p>
        </div>
      </div>
    </article>
  </div>
</Preview>

```html
<div class="accordion" data-component="Accordion" data-options='{ "itemAutoClose": true }'>
  <article class="border -mb-px p-4" data-component="AccordionItem">
    <header>
      <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
        Question
      </button>
    </header>
    <div
      data-ref="AccordionItem.content"
      aria-hidden="true"
      tabindex="-1"
      style="display: none;">
      <div class="pt-4">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
          Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
          Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
        </p>
      </div>
    </div>
  </article>
  <article class="border -mb-px p-4" data-component="AccordionItem">
    <header>
      <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
        Question
      </button>
    </header>
    <div
      data-ref="AccordionItem.content"
      aria-hidden="true"
      tabindex="-1"
      style="display: none;">
      <div class="pt-4">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
          Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
          Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
        </p>
      </div>
    </div>
  </article>
</div>
```

### Animation

By default, the `AccordionItem` component offers an animation. Animations are managed individually for each item.

If you want to disable an animation you will have to switch `animation: false` to the item. And if you want to set your animation duration, you'll have to pass the `animationDuration: 500` parameter (the time is in milliseconds).

#### Disable animation

<Preview>
  <div class="accordion" data-component="Accordion">
    <article class="border -mb-px p-4" data-component="AccordionItem" data-options='{ "animation": false }'>
      <header>
        <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
          Question
        </button>
      </header>
      <div
        data-ref="AccordionItem.content"
        aria-hidden="true"
        tabindex="-1"
        style="display: none;">
        <div class="pt-4">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
            Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
            Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
          </p>
        </div>
      </div>
    </article>
    <article class="border -mb-px p-4" data-component="AccordionItem" data-options='{ "animation": false }'>
      <header>
        <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
          Question
        </button>
      </header>
      <div
        data-ref="AccordionItem.content"
        aria-hidden="true"
        tabindex="-1"
        style="display: none;">
        <div class="pt-4">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
            Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
            Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
          </p>
        </div>
      </div>
    </article>
  </div>
</Preview>

```html
<div class="accordion" data-component="Accordion">
  <article class="border -mb-px p-4" data-component="AccordionItem" data-options='{ "animation": false }'>
    <header>
      <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
        Question
      </button>
    </header>
    <div
      data-ref="AccordionItem.content"
      aria-hidden="true"
      tabindex="-1"
      style="display: none;">
      <div class="pt-4">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
          Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
          Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
        </p>
      </div>
    </div>
  </article>
  <article class="border -mb-px p-4" data-component="AccordionItem" data-options='{ "animation": false }'>
    <header>
      <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
        Question
      </button>
    </header>
    <div
      data-ref="AccordionItem.content"
      aria-hidden="true"
      tabindex="-1"
      style="display: none;">
      <div class="pt-4">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
          Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
          Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
        </p>
      </div>
    </div>
  </article>
</div>
```

#### Choice animation duration

<Preview>
  <div class="accordion" data-component="Accordion">
    <article class="border -mb-px p-4" data-component="AccordionItem" data-options='{ "animationDuration": 1000 }'>
      <header>
        <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
          Question
        </button>
      </header>
      <div
        data-ref="AccordionItem.content"
        aria-hidden="true"
        tabindex="-1"
        style="display: none;">
        <div class="pt-4">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
            Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
            Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
          </p>
        </div>
      </div>
    </article>
    <article class="border -mb-px p-4" data-component="AccordionItem" data-options='{ "animationDuration": 1000 }'>
      <header>
        <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
          Question
        </button>
      </header>
      <div
        data-ref="AccordionItem.content"
        aria-hidden="true"
        tabindex="-1"
        style="display: none;">
        <div class="pt-4">
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
            Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
            Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
          </p>
        </div>
      </div>
    </article>
  </div>
</Preview>

```html
<div class="accordion" data-component="Accordion">
  <article class="border -mb-px p-4" data-component="AccordionItem" data-options='{ "animation": false }'>
    <header>
      <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
        Question
      </button>
    </header>
    <div
      data-ref="AccordionItem.content"
      class="pt-4"
      aria-hidden="true"
      tabindex="-1"
      style="display: none;">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
        Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
        Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
      </p>
    </div>
  </article>
  <article class="border -mb-px p-4" data-component="AccordionItem" data-options='{ "animation": false }'>
    <header>
      <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
        Question
      </button>
    </header>
    <div
      data-ref="AccordionItem.content"
      class="pt-4"
      aria-hidden="true"
      tabindex="-1"
      style="display: none;">
      <p>
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec et lacus sodales, condimentum justo at, accumsan erat.
        Fusce sagittis augue ex. Vestibulum elit lectus, pharetra eu quam eget, tempus mollis quam. Nulla dignissim justo non porta tristique.
        Nam sit amet auctor tortor. Morbi non dolor purus. Suspendisse eget odio lacinia, elementum tortor quis, congue orci.
      </p>
    </div>
  </article>
</div>
```

## Usage

### JavaScript

You can directly instantiate the `Accordion` class on an element:

```js
import { Accordion } from '@studiometa/js-toolkit';

new Accordion(document.querySelector('.my-custom-accordion-element'));
```

Or you can use the component as a child of another one:

```js
import { Base, Accordion } from '@studiometa/js-toolkit';

class App extends Base {
  get config() {
    return {
      components: {
        Accordion,
      },
    };
  }
}

new App(document.documentElement);
```

### HTML

And setup the following markup in your HTML:

```html
<div class="accordion" data-component="Accordion">
  <article class="border -mb-px p-4" data-component="AccordionItem">
    <header>
      <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
        Header #1
      </button>
    </header>
    <div
      data-ref="AccordionItem.content"
      aria-hidden="true"
      tabindex="-1"
      style="display: none;">
      <div class="pt-4">
        <p>
          Content #1
        </p>
      </div>
    </div>
  </article>
  <article class="border -mb-px p-4" data-component="AccordionItem">
    <header>
      <button type="button" class="w-full text-left cursor-pointer" data-ref="AccordionItem.btn">
        Header #2
      </button>
    </header>
    <div
      data-ref="AccordionItem.content"
      aria-hidden="true"
      tabindex="-1"
      style="display: none;">
      <div class="pt-4">
        <p>
          Content #2
        </p>
      </div>
    </div>
  </article>
</div>
```

## API `Accordion`

### Options

::: tip
Options can be defined per component via the `data-options` attribute or by extending the `Accordion` class.
:::

#### `itemAutoClose`

- Type: `Boolean`
- Default: `false`

Defines if the accordion should close items when opening another one.

## API `AccordionItem`

### Refs

#### `AccordionItem.btn`

This ref will be used as a trigger to switch the content on click.

#### `AccordionItem.content`

This ref will be used to display the content associated with a accordion element.

### Options

::: tip
Options can be defined per component via the `data-options` attribute or by extending the `AccordionItem` class.
:::

#### `animation`

- Type: `Boolean`
- Default: `true`

Activates or deactivates the opening and closing animation.

#### `animationDuration`

- Type: `Integer`
- Default: `300`

Modifies the animation duration.

### Getter

#### `isOpen`

- Type: `Boolean`
- Default: `true`

Returns whether the item is open or closed.

### Methods

#### `open`

Open the item. It is possible to pass the `animate` parameter to have an animation or not (default: `true`).

#### `close`

Close the item. It is possible to pass the `animate` parameter to have an animation or not (default: `true`).

### Events

#### `open`

Emitted when a accordion is open and return the item.

#### `close`

Emitted when a accordion is close and return the item.

#### `beforeAnimation`

Emitted before a accordion animation start and return the item.

#### `afterAnimation`

Emitted after a accordion animation finish and return the item.
