<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import {basicSetup} from "codemirror"
import {EditorState} from "@codemirror/state"
import {EditorView} from "@codemirror/view"
import Figure from '@/components/figure.vue'
import Note from '@/components/note.vue'
import { oneDark } from "@codemirror/theme-one-dark"
// Pinia Stores
import { useScrollAffectingContentWaiterStore } from '@/stores/scroll_affecting_content_waiter'
import { ThemeColor } from '@/composables/theme'

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

async function getLanguageExtension() {
  var pending = null;
  switch (props.lang) {
    default:
    case "cpp": pending = import("@codemirror/lang-cpp").then(x => x['cpp']()); break;
    case "css": pending = import("@codemirror/lang-css").then(x => x['css']()); break;
    case "go": pending = import("@codemirror/lang-go").then(x => x['go']()); break;
    case "html": pending = import("@codemirror/lang-html").then(x => x['html']()); break;
    case "javascript": pending = import("@codemirror/lang-javascript").then(x => x['javascript']()); break;
    case "json": pending = import("@codemirror/lang-json").then(x => x['json']()); break;
    case "rust": pending = import("@codemirror/lang-rust").then(x => x['rust']()); break;
    case "vue": pending = import("@codemirror/lang-vue").then(x => x['vue']()); break;
    case "yaml": pending = import("@codemirror/lang-yaml").then(x => x['yaml']()); break;
  }
  return await pending;
}

onMounted(() => {
  var task = getTextAsync().then(async (text) => {
    let extensions = [
        basicSetup,
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),
        EditorView.contentAttributes.of({tabindex: "0"}),
        oneDark,
    ];
    let language_extension = await getLanguageExtension();
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
    <Note v-if="init_failed" :color="ThemeColor.Error">
      Error loading code view
    </Note>
    <div v-else ref="editor" class="editor"></div>
  </Figure>
</template>
