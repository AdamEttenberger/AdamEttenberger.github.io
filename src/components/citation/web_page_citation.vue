<script setup lang="ts">
import { computed } from 'vue'
import Link from '@/components/link.vue'
import { date_formatMLA, type DateLike } from '@/util/date'

const props = defineProps<{
  url: string,
  firstname: string,
  lastname: string,
  website_title: string,
  webpage_title: string,
  publisher?: string,
  date_published?: DateLike,
}>();

const display_url = computed<undefined|string>(() => {
  const url = URL.parse(props.url);
  return url ? url.href.substring(url.protocol.length + 2) : undefined;
});
</script>

<template>
  <cite>
    <Link class="cite-link" :to="url" :alt="`link to webpage: ${webpage_title}`" transparent>
      <span class="author-last-name">{{ lastname }}</span>,
      <span class="author-first-name">{{ firstname }}</span>.
      "<span class="webpage-title">{{ webpage_title  }}</span>."
      <i class="website-title">{{  website_title }}</i>,
      <span v-if="publisher"><span class="publisher">{{ publisher }}</span>,</span>
      <span v-if="date_published"><span class="date-published">{{ date_formatMLA(date_published) }}</span>,</span>
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
