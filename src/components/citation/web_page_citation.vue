<script setup lang="ts">
import { computed } from 'vue'
import Link from '@/components/link.vue';
import DateUtil from '@/util/date'

const props = defineProps<{
  url: string,
  firstname: string,
  lastname: string,
  website_title: string,
  webpage_title: string,
  publisher?: string,
  date_published?: Date,
}>();

const display_url = computed(() => {
  const url = URL.parse(props.url);
  return url.href.substring(url.protocol.length + 2);
});
</script>

<template>
  <cite>
    <Link class="cite-link" :to="url">
      <span class="author-last-name">{{ lastname }}</span>,
      <span class="author-first-name">{{ firstname }}</span>.
      "<span class="webpage-title">{{ webpage_title  }}</span>."
      <i class="website-title">{{  website_title }}</i>,
      <span v-if="publisher"><span class="publisher">{{ publisher }}</span>,</span>
      <span v-if="date_published"><span class="date-published">{{ DateUtil.formatMLA(date_published) }}</span>,</span>
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
