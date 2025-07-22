<script setup lang="ts">
// Pinia Stores
import userPrefsStore from '@/stores/local_storage/user_prefs'
const user_prefs = userPrefsStore();

defineProps({
  src: { type: String, default: null },
  src_light: { type: String, default: null },
  src_dark: { type: String, default: null },
  alt: { type: String, default: null },
  caption: { type: String, default: null },
});
</script>

<template>
  <figure>
    <div class="framed">
      <img v-if="(src_light && src_dark)" :src="user_prefs.useDarkMode ? src_dark : src_light" :alt="alt" />
      <img v-else-if="src" :src="src" :alt="alt" />
      <slot v-else></slot>
    </div>
    <figcaption v-if="$slots.caption"><slot name="caption"></slot></figcaption>
    <figcaption v-else-if="caption">{{ caption  }}</figcaption>
    <figcaption v-else-if="alt">{{ alt }}</figcaption>
  </figure>
</template>

<style scoped>
figure,
figure > .framed {
  display: flex;
  flex-direction: column;
}
figcaption {
  text-align: center;
  font-style: italic;
  font-size: small;
}
</style>