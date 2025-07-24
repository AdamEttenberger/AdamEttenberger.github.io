<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {basicSetup} from "codemirror"
import {EditorState} from "@codemirror/state"
import {EditorView} from "@codemirror/view"
import Figure from '@/components/figure.vue'
import { cpp } from "@codemirror/lang-cpp"
import { css } from "@codemirror/lang-css"
import { go } from "@codemirror/lang-go"
import { html } from "@codemirror/lang-html"
import { javascript } from "@codemirror/lang-javascript"
import { json } from "@codemirror/lang-json"
import { rust } from "@codemirror/lang-rust"
import { vue } from "@codemirror/lang-vue"
import { yaml } from "@codemirror/lang-yaml"
import { oneDark } from "@codemirror/theme-one-dark"
// Pinia Stores
import { useScrollAffectingContentWaiterStore } from '@/stores/scroll_affecting_content_waiter'

const scrollAffectingContentWaiter = useScrollAffectingContentWaiterStore();

const props = defineProps({
  text: { type: String, default: null },
  file: { type: String, default: null },
  lang: { type: String, default: "cpp" },
  caption: { type: String, default: null },
})

const caption = computed(() => {
  if (props.caption) {
    return props.caption;
  }
  if (props.file) {
    // Extract the filename from the path as fallback.
    return props.file.substring(props.file.lastIndexOf('/') + 1);
  }
  return null;
});

const editor = ref();
const init_failed = ref(false);

function readFileProp(resolve, reject) {
  return fetch(props.file)
    .then(response => response.text())
    .then(text => text.trimEnd())
    .then(resolve)
    .catch(reject);
}

function readTextProp() {
  let result = "";
  let lines = props.text.trimEnd().split('\n');
  let base_indent = 0;
  let found_first_line = false;
  for (var line of lines) {
    if (!found_first_line) {
      found_first_line = /[^\s]/.test(line);
      if (!found_first_line) {
        continue;
      }
      base_indent = 0;
      for (var c of line) {
        if (c == ' ') {
          base_indent += 1;
        } else {
          break;
        }
      }
    }
    if (base_indent > 0 && line.startsWith(' '.repeat(base_indent))) {
      line = line.substring(base_indent);
    }
    result += line + '\n';
  }
  return result.trimEnd();
}

function getTextAsync() {
  return new Promise((resolve, reject) => {
    if (props.file) {
      readFileProp(resolve, reject);
    } else if (props.text) {
      resolve(readTextProp());
    } else {
      reject();
    }
  });
}

function getLanguageExtension() {
  switch (props.lang) {
    case "cpp": return cpp();
    case "css": return css();
    case "go": return go();
    case "html": return html();
    case "javascript": return javascript();
    case "json": return json();
    case "rust": return rust();
    case "vue": return vue();
    case "yaml": return yaml();
  }
  // Fallback to C++
  return cpp();
}

onMounted(() => {
  var task = getTextAsync().then((text) => {
    let extensions = [
        basicSetup,
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),
        EditorView.contentAttributes.of({tabindex: "0"}),
        oneDark,
    ];
    let language_extension = getLanguageExtension();
    if (language_extension) {
      extensions.push(language_extension);
    }
    new EditorView({
      parent: editor.value,
      doc: text,
      extensions: extensions,
    });
  }).catch(() => {
    init_failed.value = true
  });
  scrollAffectingContentWaiter.add(task);
});
</script>

<template>
  <Figure :caption="caption">
    <div v-if="init_failed" class="error">
      <font-awesome-icon :icon="['fas', 'file-circle-xmark']" />
      <br />
      <div>Error loading code view</div>
    </div>
    <div v-else ref="editor" class="editor"></div>
  </Figure>
</template>

<style scoped>
.error {
  text-align: center;
  font-size: xx-large;
}
</style>