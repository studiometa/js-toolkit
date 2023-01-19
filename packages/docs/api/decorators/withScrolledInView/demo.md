---
layout: false
---

<script setup>
  import { onMounted, onBeforeUnmount } from 'vue';

  let instances;

  onMounted(async () => {
    const { Base, withScrolledInView } = await import('@studiometa/js-toolkit');

    class ScrolledInViewOffset extends withScrolledInView(Base) {
      /**
       * Config.
       */
      static config = {
        name: 'ScrolledInViewOffset',
        refs: ['progress'],
      };

      /**
       * Scrolled in view.
       * @param   {import('@studiometa/js-toolkit').ScrolledInViewProps} props
       * @returns {void}
       */
      scrolledInView(props) {
        const { x, y } = props.progress;
        this.$refs.progress.textContent = `{ x: ${x.toFixed(3)}, y: ${y.toFixed(3)} }`;
      }
    }

    const instances = ScrolledInViewOffset.$factory('ScrolledInViewOffset');
  });

  onBeforeUnmount(() => {
    instances.forEach(instance => instance.$destroy());
  })
</script>

<style>
  body { width: 350vw !important; height: auto !important; background: var(--vp-sidebar-bg-color); }
</style>

<div class="z-10 fixed top-1/4 left-0 w-full h-px pl-1 bg-red-800">
  0.25
</div>
<div class="z-10 fixed top-3/4 left-0 w-full h-px pl-1 bg-red-800">
  0.75
</div>
<div class="z-10 fixed left-1/4 top-0 w-px h-full pt-1 bg-red-800">
  &nbsp;0.25
</div>
<div class="z-10 fixed left-3/4 top-0 w-px h-full pt-1 bg-red-800">
  &nbsp;0.75
</div>

<div class="absolute top-0 left-0 flex items-center justify-center w-screen h-[75vh]">
  Scroll right and/or down.
</div>

<div class="flex items-center justify-center w-full h-[75vh]">
  Scroll down.
</div>
<div class="flex items-center justify-between w-full">
  <div class="w-[75vw] text-center">
    Scroll right.
  </div>
  <div class="flex flex-wrap items-center justify-center gap-20">
    <div data-component="ScrolledInViewOffset"
      data-option-offset="start end / end start"
      class="flex items-center w-48 h-48 text-center rounded bg-red-400">
      <div class="w-full">
        <div>
          start end
        </div>
        <div>
          end start
        </div>
        <div data-ref="progress">
          0
        </div>
      </div>
    </div>
    <div data-component="ScrolledInViewOffset"
      data-option-offset="end end / start start"
      class="flex items-center w-48 h-48 text-center rounded bg-green-400">
      <div class="w-full">
        <div>
          end end
        </div>
        <div>
          start start
        </div>
        <div data-ref="progress">
          0
        </div>
      </div>
    </div>
    <div data-component="ScrolledInViewOffset"
      data-option-offset="end 0.75 / start 0.25"
      class="flex items-center w-48 h-48 text-center rounded bg-blue-400">
      <div class="w-full">
        <div>
          end 0.75
        </div>
        <div>
          start 0.25
        </div>
        <div data-ref="progress">
          0
        </div>
      </div>
    </div>
    <div data-component="ScrolledInViewOffset"
      data-option-offset="start 0.25 / end 0.75"
      class="flex items-center w-48 h-48 text-center rounded bg-purple-400">
      <div class="w-full">
        <div>
          start 0.25
        </div>
        <div>
          end 0.75
        </div>
        <div data-ref="progress">
          0
        </div>
      </div>
    </div>
    <div data-component="ScrolledInViewOffset"
      data-option-offset="0.5 0.75 / 0.5 0.25"
      class="flex items-center w-48 h-48 text-center rounded bg-orange-400">
      <div class="w-full">
        <div>
          0.5 0.75
        </div>
        <div>
          0.5 0.25
        </div>
        <div data-ref="progress">
          0
        </div>
      </div>
    </div>
    <div data-component="ScrolledInViewOffset"
      data-option-offset="25px 0.75 / 25px 0.25"
      class="relative flex items-center w-48 h-48 text-center rounded bg-emerald-400">
      <div class="absolute top-[25px] left-0 w-full h-px pl-1 bg-red-800 text-left text-sm">
        25px
      </div>
      <div class="absolute left-[25px] top-0 w-px h-full pt-1 bg-red-800 text-left text-sm">
        &nbsp;25px
      </div>
      <div class="w-full">
        <div>
          25px 0.75
        </div>
        <div>
          25px 0.25
        </div>
        <div data-ref="progress">
          0
        </div>
      </div>
    </div>
    <div data-component="ScrolledInViewOffset"
      data-option-offset="-25px 0.75 / -25px 0.25"
      class="relative flex items-center w-48 h-48 text-center rounded bg-cyan-400">
      <div class="absolute top-[-25px] left-0 w-full h-px pl-1 bg-red-800 text-left text-sm">
        -25px
      </div>
      <div class="absolute left-[-25px] top-0 w-px h-full pt-1 bg-red-800 text-left text-sm">
        &nbsp;-25px
      </div>
      <div class="w-full">
        <div>
          -25px 0.75
        </div>
        <div>
          -25px 0.25
        </div>
        <div data-ref="progress">
          0
        </div>
      </div>
    </div>
  </div>
  <div class="w-[75vw] text-center">
    Scroll left.
  </div>
</div>
<div class="flex items-center justify-center w-full h-[75vh]">
  Scroll up.
</div>
