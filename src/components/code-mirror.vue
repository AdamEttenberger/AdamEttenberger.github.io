<script setup lang="ts">
import { computed, onBeforeUnmount, useTemplateRef, watch } from 'vue'
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

type SupportedLanguage = 'cpp'|'css'|'gdscript'|'go'|'html'|'javascript'|'json'|'python'|'rust'|'text'|'vue'|'yaml';

const LanguageExtensionLookup: Record<SupportedLanguage, () => undefined|Promise<LanguageSupport>> = {
  'cpp': () => import("@codemirror/lang-cpp").then(x => x['cpp']()),
  'css': () => import("@codemirror/lang-css").then(x => x['css']()),
  'go': () => import("@codemirror/lang-go").then(x => x['go']()),
  'gdscript': () => import("@codemirror/lang-python").then(x => x['python']()),
  'html': () => import("@codemirror/lang-html").then(x => x['html']()),
  'javascript': () => import("@codemirror/lang-javascript").then(x => x['javascript']()),
  'json': () => import("@codemirror/lang-json").then(x => x['json']()),
  'python': () => import("@codemirror/lang-python").then(x => x['python']()),
  'rust': () => import("@codemirror/lang-rust").then(x => x['rust']()),
  'text': () => undefined,
  'vue': () => import("@codemirror/lang-vue").then(x => x['vue']()),
  'yaml': () => import("@codemirror/lang-yaml").then(x => x['yaml']()),
};

const props = withDefaults(defineProps<ITextDocumentParam & {
  lang?:  SupportedLanguage;
  caption?:  string;
}>(), {
  lang: 'cpp',
});

const display_caption = computed<undefined|string>(() => {
  if (props.caption) {
    return props.caption;
  }
  if (props.file && typeof props.file === 'string') {
    return props.file.substring(props.file.lastIndexOf('/') + 1);
  }
});

const { status, content: document_content } = useTextDocument(() => ({ file: props.file, content: props.content }));

const editor = useTemplateRef<Element|DocumentFragment>('editor');
let editor_view: undefined|EditorView;
let controller: undefined|AbortController;

const watch_handle = watch(() => editor.value ? status.value : AsyncDocumentLoaderStatus.Loading,
      async (new_status: AsyncDocumentLoaderStatus) => {
  reset();
  if (new_status !== AsyncDocumentLoaderStatus.Ready) {
    return;
  }
  controller = new AbortController();
  const language = await LanguageExtensionLookup[props.lang]();
  if (controller.signal.aborted) {
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
      language ?? [],
    ],
  });
});

function reset() {
  controller?.abort();
  editor_view?.destroy();
  editor_view = undefined;
}

onBeforeUnmount(() => {
  watch_handle.stop();
  reset();
});
</script>

<template>
  <Figure :caption="display_caption">
    <Note v-if="status === AsyncDocumentLoaderStatus.Error" :color="ThemeColor.Error">
      Error loading code view
    </Note>
    <div ref="editor" class="editor"></div>
  </Figure>
</template>
