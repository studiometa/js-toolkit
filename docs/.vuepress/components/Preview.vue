<template>
  <div class="preview" :class="{ 'preview--full': full }">
    <div class="my-4 p-10 rounded" style="background-color: #f6f6f6" ref="parent">
      <slot />
    </div>
  </div>
</template>

<script>
  import Base from '../../../src';
  import * as components from '../../../src/components/';

  class App extends Base {
    static config = {
      name: 'App',
      debug: true,
      components,
    };
  }

  export default {
    props: {
      full: {
        type: Boolean,
        default: false,
      },
    },
    async mounted() {
      this.$nextTick(() => {
        this.component = new App(this.$refs.parent);
        this.component.$mount();
      });
    },
    updated() {
      if (!this.component) {
        return;
      }

      this.component.$destroy();
      this.component = new App(this.$refs.parent);
      this.component.$mount();
    },
    beforeDestroy() {
      this.component.$destroy();
    },
  };
</script>

<style lang="scss">
  @tailwind components;
  @tailwind utilities;

  .preview {
    blockquote,
    dl,
    dd,
    h1,
    h2,
    h3,
    h4,
    h5,
    h6,
    hr,
    figure,
    p,
    pre {
      margin: 0;
    }

    button {
      background-color: transparent;
      background-image: none;
      padding: 0;
    }

    button:focus {
      outline: 1px dotted;
      outline: 5px auto -webkit-focus-ring-color;
    }

    fieldset {
      margin: 0;
      padding: 0;
    }

    ol,
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    *,
    ::before,
    ::after {
      color: #3a385d;
      box-sizing: border-box;
      border-width: 0;
      border-style: solid;
      border-color: theme('borderColor.default', currentColor);
    }

    hr {
      border-top-width: 1px;
    }

    img {
      border-style: solid;
    }

    textarea {
      resize: vertical;
    }

    input::placeholder,
    textarea::placeholder {
      color: #a0aec0;
    }

    button,
    [role='button'] {
      cursor: pointer;
    }

    table {
      border-collapse: collapse;
    }

    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      font-size: inherit;
      font-weight: inherit;
    }

    a {
      color: inherit;
      text-decoration: inherit;
    }

    button,
    input,
    optgroup,
    select,
    textarea {
      padding: 0;
      font: inherit;
      line-height: inherit;
      color: inherit;
    }

    img,
    svg,
    video,
    canvas,
    audio,
    iframe,
    embed,
    object {
      display: block;
      vertical-align: middle;
    }

    img,
    video {
      max-width: 100%;
      height: auto;
    }
  }

  .preview--full {
    position: relative;
    left: 50%;
    width: calc(100vw - 30rem);
    min-width: 100%;
    transform: translateX(-50%);
  }
</style>
