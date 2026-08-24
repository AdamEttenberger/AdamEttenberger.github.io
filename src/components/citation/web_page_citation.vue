<script setup lang="ts">
import { computed } from 'vue'
import Link from '@/components/link.vue'
import { date_formatMLA, type DateLike } from '@/util/date'

const props = defineProps<{
  url: string,
  firstname: string,
  lastname: string,
  websiteTitle: string,
  webpageTitle: string,
  publisher?: string,
  datePublished?: DateLike,
}>();

const display_url = computed<undefined|string>(() => {
  const url = URL.parse(props.url);
  return url ? url.href.substring(url.protocol.length + 2) : undefined;
});
</script>

<template>
  <cite>
    <Link class="cite-link" :to="url" :alt="`link to webpage: ${webpageTitle}`" transparent>
      <span class="author-last-name">{{ lastname }}</span>,
      <span class="author-first-name">{{ firstname }}</span>.
      "<span class="webpage-title">{{ webpageTitle  }}</span>."
      <i class="website-title">{{  websiteTitle }}</i>,
      <span v-if="publisher"><span class="publisher">{{ publisher }}</span>,</span>
      <span v-if="datePublished"><span class="date-published">{{ date_formatMLA(datePublished) }}</span>,</span>
      <span class="link">{{ display_url }}</span>.
    </Link>
  </cite>
</template>

<style scoped>
cite {
  display: flex;
  flex-direction: column;
  text-align: center;
}
</style>
