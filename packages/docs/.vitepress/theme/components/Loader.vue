<template>
  <transition
    enter-from-class="opacity-0 transform scale-0"
    enter-active-class="transition"
    leave-to-class="opacity-0 transform scale-0"
    leave-active-class="transition"
    appear
    mode="out-in">
    <div class="absolute top-1/2 left-1/2 w-6 h-6 -mt-3 -ml-3">
      <svg
        class="animate-spin h-full w-full text-gray-500"
        style="animation-duration: 0.2s"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24">
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <span class="sr-only">Loading...</span>
    </div>
  </transition>
</template>
