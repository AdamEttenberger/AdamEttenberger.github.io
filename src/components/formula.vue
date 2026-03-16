<script setup lang="ts">
import { useTemplateRef, watch } from 'vue'
import Figure from '@/components/figure.vue'
import Layer from '@/components/layer.vue'
import Note from '@/components/note.vue'
import { ThemeColor, type IThemeProps } from '@/composables/theme'
import useTextDocument, { type ITextDocumentParam, AsyncDocumentLoaderStatus } from '@/types/text_document'

const props = defineProps<IThemeProps & ITextDocumentParam & {
  text?: string;
  caption: string;
}>();

const { status, content: document_content } = useTextDocument(() => ({ file: props.file, content: props.content }));

const formula = useTemplateRef<ParentNode>('formula');

watch(() => formula.value ? status.value : AsyncDocumentLoaderStatus.Loading,
      (status: AsyncDocumentLoaderStatus) => {
  if (status === AsyncDocumentLoaderStatus.Loading) {
    return;
  }
  const mathml_root = TeXZilla.toMathML(document_content.value) as undefined|MathMLElement;
  if (!mathml_root) {
    throw new Error('failed to build formula');
  }
  formula.value?.replaceChildren(mathml_root);
});
</script>

<template>
  <Figure :caption>
    <Note v-if="status === AsyncDocumentLoaderStatus.Error" :color="ThemeColor.Error">
      Error loading code view
    </Note>
    <Layer v-else :color>
      <div ref="formula" class="math"></div>
    </Layer>
  </Figure>
</template>

<style scoped>
.math {
  text-align: center;
  overflow: auto hidden;
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  border: none;

  font-size: x-large;
  @container (max-width: 40rem) {
    font-size: unset;
  }
}
</style>