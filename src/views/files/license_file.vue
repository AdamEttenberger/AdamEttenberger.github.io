<script setup lang="ts">
import { ref, unref } from 'vue'
import { ILicenseInfo } from '@/types/license_types'
import Column from '@/components/column.vue';
import TermList from '@/components/term_list.vue';
import Term from '@/components/term.vue';

const props = defineProps<ILicenseInfo>();
const license_content = ref(null);
unref(props.file_import)().then(async (content) => {
  console.log(content.then)
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
    <Column>
      <TermList heading="License Information">
        <Term term="Name">{{  name }}</Term>
        <Term term="Author">{{  author }}</Term>
        <Term term="Year">{{ date.getFullYear() }}</Term>
      </TermList>
    </Column>
    <Column>
      <pre v-if="license_content">
        {{ license_content }}
      </pre>
    </Column>
  </article>
</template>

<style scoped>
.name {
  font-size: larger;
  color: var(--color-text-heading);
}
pre {
  overflow: auto;
}
</style>