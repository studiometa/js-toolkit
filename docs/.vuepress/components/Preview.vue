<template>
  <div class="preview">
    <div class="my-10 p-10 rounded" style="background-color: rgba(27,31,35,0.05);" ref="parent">
      <slot />
    </div>
  </div>
</template>

<script>
  import * as toolkit from '../../../dist';

  const { Base, ...components } = toolkit;
  class App extends Base {
    get config() {
      return {
        name: 'App',
        debug: true,
        components,
      };
    }
  }

  export default {
    async mounted() {
      this.$nextTick(() => {
        this.component = new App(this.$refs.parent);
      });
    },
    updated() {
      this.component.$destroy();
      this.component = new App(this.$refs.parent);
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
      box-sizing: border-box; /* 1 */
      border-width: 0; /* 2 */
      border-style: solid; /* 2 */
      border-color: #ccc; /* 2 */
    }

    /*
 * Ensure horizontal rules are visible by default
 */

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
</style>
