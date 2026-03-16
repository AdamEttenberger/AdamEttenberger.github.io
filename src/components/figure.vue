<script setup lang="ts">
import { computed } from 'vue'
// Pinia Stores
import { useUserPreferencesStore } from '@/stores/user_preferences'
const preferences = useUserPreferencesStore();

const props = defineProps<{
  src?: string;
  src_light?: string;
  src_dark?: string;
  alt?: string;
  caption?: string;
}>();

const image_source = computed<undefined|string>(() => {
  if (props.src_light && props.src_dark) {
    return preferences.useDarkMode ? props.src_dark : props.src_light;
  } else if (props.src) {
    return props.src;
  }
  return undefined;
});
</script>

<template>
  <figure>
    <slot>
      <img v-if="image_source" :src="image_source" :alt />
    </slot>

    <figcaption v-if="$slots.caption"><slot name="caption"></slot></figcaption>
    <figcaption v-else-if="caption">{{ caption }}</figcaption>
    <figcaption v-else-if="alt">{{ alt }}</figcaption>
  </figure>
</template>

<style scoped>
figure {
  display: flex;
  flex-direction: column;

  & > img {
    border-radius: var(--size-border-radius);
  }

  & > figcaption {
    text-align: center;
    font-style: italic;
    font-size: small;
  }
}
</style>