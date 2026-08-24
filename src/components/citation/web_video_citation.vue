<script setup lang="ts">
import { computed } from 'vue'
import Link from '@/components/link.vue';
import { date_formatMLA, type DateLike } from '@/util/date'

const props = defineProps<{
  url: string,
  accountName: string,
  videoTitle: string,
  websiteTitle: string,
  publisher?: string,
  datePublished: DateLike,
}>();

const display_url = computed(() => {
  const url = URL.parse(props.url);
  return url ? url.href.substring(url.protocol.length + 2) : undefined;
});
</script>

<template>
  <cite>
    <Link :to="url" :alt="`link to video: ${videoTitle}`" transparent>
      "<span class="video-title">{{ videoTitle  }}</span>."
      <i class="website-title">{{  websiteTitle }}</i>,
      uploaded by
      <span class="author-account-name">{{ accountName }}</span>,
      <span v-if="publisher"><span class="publisher">{{ publisher }}</span>,</span>
      <span class="date-published">{{ date_formatMLA(datePublished) }}</span>,
      <span class="url">{{ display_url }}</span>.
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
