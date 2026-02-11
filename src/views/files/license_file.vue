<script setup lang="ts">
import { ref, unref } from 'vue'
import { ILicenseInfo } from '@/types/license_types'
import Layer from '@/components/layer.vue'
import TermList from '@/components/term_list.vue'
import Term from '@/components/term.vue'

const props = defineProps<ILicenseInfo>();
const license_content = ref(null);
unref(props.file_import)().then(async (content) => {
  if (typeof content === 'string') {
    license_content.value = content;
  } else if (content[Symbol.toStringTag] === 'Module') {
    license_content.value = content.default;
  } else if (content[Symbol.toStringTag] === 'Response' &&
             typeof content.text === 'function') {
    license_content.value = await content.text();
  }
});
</script>

<template>
  <article>
    <Layer>
      <TermList heading="Third-Party License Information">
        <Term term="Name">{{  name }}</Term>
        <Term term="Author">{{  author }}</Term>
        <Term term="Year">{{ date.getFullYear() }}</Term>
      </TermList>
    </Layer>
    <Layer>
      <pre v-if="license_content">
        {{ license_content }}
      </pre>
    </Layer>
  </article>
</template>

<style scoped>
pre {
  overflow: auto;
}
</style>