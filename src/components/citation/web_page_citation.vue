<script setup lang="ts">
import { computed } from 'vue'
import Button from '../button.vue';

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
    <Button :to="url" :alt="`link to webpage: ${webpage_title}`" :transparent="true">
      <div class="web-page">
        <span class="author-last-name">{{ lastname }}</span>,
        <span class="author-first-name">{{ firstname }}</span>.
        "<span class="webpage-title">{{ webpage_title  }}</span>."
        <i class="website-title">{{  website_title }}</i>,
        <span v-if="publisher"><span class="publisher">{{ publisher }}</span>,</span>
        <span v-if="date_published"><span class="date-published">{{ DateUtil.formatMLA(date_published) }}</span>,</span>
        <span class="link">{{ display_url }}</span>.
      </div>
    </Button>
  </cite>
</template>

<style scoped>
.web-page {
  width: 100%;
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
