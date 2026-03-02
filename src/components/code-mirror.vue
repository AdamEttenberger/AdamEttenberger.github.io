<script setup lang="ts">
import { onBeforeUnmount, useTemplateRef, watch } from 'vue'
import { type LanguageSupport } from "@codemirror/language"
import {basicSetup} from "codemirror"
import {EditorState} from "@codemirror/state"
import {EditorView} from "@codemirror/view"
import Figure from '@/components/figure.vue'
import Note from '@/components/note.vue'
import { oneDark } from "@codemirror/theme-one-dark"
// Pinia Stores
import { ThemeColor } from '@/composables/theme'
import useTextDocument, { type ITextDocumentParam, AsyncDocumentLoaderStatus } from '@/types/text_document'

const props = defineProps<ITextDocumentParam & {
  lang?:  string;
  caption?:  string;
}>();

const { status, content: document_content } = useTextDocument(() => ({ file: props.file, content: props.content }));

const editor = useTemplateRef<Element|DocumentFragment>('editor');
let editor_view: undefined|EditorView;

async function getLanguageExtension(): Promise<LanguageSupport> {
  let pending = null;
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

const watch_handle = watch(() => editor.value ? status.value : AsyncDocumentLoaderStatus.Loading,
      async (status: AsyncDocumentLoaderStatus) => {
  if (status !== AsyncDocumentLoaderStatus.Ready) {
    return;
  }
  editor_view = new EditorView({
    parent: editor.value ?? undefined,
    doc: document_content.value,
    extensions: [
      basicSetup,
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      EditorView.contentAttributes.of({tabindex: "0"}),
      oneDark,
      await getLanguageExtension(),
    ],
  });
});

onBeforeUnmount(() => {
  watch_handle.stop();
  editor_view?.destroy();
});
</script>

<template>
  <Figure :caption>
    <Note v-if="status === AsyncDocumentLoaderStatus.Error" :color="ThemeColor.Error">
      Error loading code view
    </Note>
    <div ref="editor" class="editor"></div>
  </Figure>
</template>
