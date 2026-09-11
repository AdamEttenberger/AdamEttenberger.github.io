<script setup lang="ts">
import { getThemedImageSource, type ImageSourcePath, type MaybeThemedImage } from '@/types/themed-image';
import { computed } from 'vue'
const props = defineProps<{
  image?: MaybeThemedImage;
  alt?: string;
  caption?: string;
}>();

const image_source = computed(() => getThemedImageSource(props.image));
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