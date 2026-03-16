<script setup lang="ts">
import { type ILicenseInfo } from '@/types/license_types'
import Layer from '@/components/layer.vue'
import TermList from '@/components/term_list.vue'
import Term from '@/components/term.vue'
import useTextDocument from '@/types/text_document'
import { date_formatYear } from '@/util/date'

const props = defineProps<ILicenseInfo>();

const { content: document_content } = useTextDocument(() => ({ file: props.file, content: props.content }));
</script>

<template>
  <article>
    <Layer>
      <TermList heading="Third-Party License Information">
        <Term term="Name">{{  name }}</Term>
        <Term term="Author">{{  author }}</Term>
        <Term term="Year">{{ date_formatYear(date) }}</Term>
      </TermList>
    </Layer>
    <Layer>
      <pre>{{ document_content }}</pre>
    </Layer>
  </article>
</template>

<style scoped>
pre {
  overflow: auto;
}
</style>