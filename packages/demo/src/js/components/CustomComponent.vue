<template>
  <p>
    {{ paragraph }}
  </p>
</template>

<script>
  export default {
    name: 'CustomComponent',
    data() {
      return {
        paragraph: `Lorem ipsum dolor sit amet consectetur, adipisicing elit. Adipisci nemo quod 
        nobis laudantium iusto maiores molestias animi quos error quo consequatur, eum veniam sequi
        repellat placeat rerum a labore. Sit.`,
      };
    },
  };
</script>
