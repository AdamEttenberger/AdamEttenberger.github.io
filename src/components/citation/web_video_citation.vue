<script setup lang="ts">
import { computed } from 'vue'
import Link from '@/components/link.vue';
import DateUtil from '@/util/date'

const props = defineProps<{
  url: string,
  account_name: string,
  video_title: string,
  website_title: string,
  publisher?: string,
  date_published: Date,
}>();

const display_url = computed(() => {
  const url = URL.parse(props.url);
  return url.href.substring(url.protocol.length + 2);
});
</script>

<template>
  <cite>
    <Link :to="url">
      "<span class="video-title">{{ video_title  }}</span>."
      <i class="website-title">{{  website_title }}</i>,
      uploaded by
      <span class="author-account-name">{{ account_name }}</span>,
      <span v-if="publisher"><span class="publisher">{{ publisher }}</span>,</span>
      <span class="date-published">{{ DateUtil.formatMLA(date_published) }}</span>,
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
