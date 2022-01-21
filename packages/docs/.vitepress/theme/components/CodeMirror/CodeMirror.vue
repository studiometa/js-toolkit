<script setup>
  import { ref, unref, onMounted, watchEffect } from 'vue';
  import Codemirror from 'codemirror';
  import 'codemirror/lib/codemirror.css';
  import 'codemirror/mode/javascript/javascript.js';
  import 'codemirror/mode/css/css.js';
  import 'codemirror/mode/htmlmixed/htmlmixed.js';
  import 'codemirror/mode/twig/twig.js';
  import 'codemirror/addon/edit/closebrackets.js';
  import 'codemirror/addon/edit/closetag.js';
  import 'codemirror/addon/comment/comment.js';
  import 'codemirror/addon/fold/foldcode.js';
  import 'codemirror/addon/fold/foldgutter.js';
  import 'codemirror/addon/fold/brace-fold.js';
  import 'codemirror/addon/fold/indent-fold.js';
  import 'codemirror/addon/fold/comment-fold.js';
  // import './CodeMirror.css';

  const el = ref();
  const props = defineProps({
    value: String,
  });

  let editor;

  onMounted(() => {
    editor = Codemirror(unref(el), {
      value: unref(props.value),
      lineNumbers: true,
      readOnly: true,
    });

    watchEffect(() => {
      const cur = editor.getValue();
      if (props.value !== cur) {
        editor.setValue(props.value);
      }
    });
  });
</script>

<template>
  <div class="dark" ref="el" />
</template>
