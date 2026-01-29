<script setup lang="ts">
import { computed } from 'vue'
import Button from '@/components/button.vue'
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
    <Button :to="url" :alt="`link to video: ${video_title}`" :transparent="true">
      <div class="web-video">
        "<span class="video-title">{{ video_title  }}</span>."
        <i class="website-title">{{  website_title }}</i>,
        uploaded by
        <span class="author-account-name">{{ account_name }}</span>,
        <span v-if="publisher"><span class="publisher">{{ publisher }}</span>,</span>
        <span class="date-published">{{ DateUtil.formatMLA(date_published) }}</span>,
        <span class="url">{{ display_url }}</span>.
      </div>
    </Button>
  </cite>
</template>

<style scoped>
.web-video {
  color: var(--color-link);
  padding: var(--size-padding-round);
  border-radius: var(--size-border-radius);
  transition: background-color var(--anim-transition);
  &:hover {
    background-color: var(--color-link-hover);
  }
  &:active {
    background-color: var(--color-link-active);
  }
}
</style>
