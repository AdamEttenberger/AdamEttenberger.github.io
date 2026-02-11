<script setup lang="ts">
import Term from '@/components/term.vue'
import TermList from '@/components/term_list.vue'
import { ILicenseInfo } from '@/types/license_types'
defineProps<ILicenseInfo>();
</script>

<template>
  <TermList :heading="subpath">
    <Term term="Name">
      {{  name }}
    </Term>
    <Term term="Author">{{  author }}</Term>
    <Term term="Year">{{ date.getFullYear() }}</Term>
  </TermList>
</template>

<style scoped>
.license-summary *:not(:last-child)::after {
  content: ', ';
}
</style>