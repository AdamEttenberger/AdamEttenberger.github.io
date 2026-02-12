<script setup lang="ts">
import { computed, PropType, unref } from 'vue'
import Button from '@/components/buttons/button.vue'
import Layer from '@/components/layer.vue';
import DateText from '@/components/date_text.vue'
import useTheme, { ThemeColor } from '@/composables/theme'

defineProps({
  color: { type: [null, String, ThemeColor] as PropType<null|String|ThemeColor>, default: null },
  depth: { type: [null, Number] as PropType<null|Number>, default: null },
  absolute: { type: Boolean, default: false },

  image: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: Date },
  to: { type: String, required: true },
});
</script>

<template>
  <Layer class="project-item">
    <Button class="thumbnail-button" :to :icon="image" :alt="title" transparent />
    <Layer class="text-layer" :color>
      <b class="title">{{ title }}</b>
      <DateText class="date" :date />
    </Layer>
  </Layer>
</template>

<style scoped>
.project-item {
  width: var(--component-project-item-size);
  height: var(--component-project-item-size);
  padding: 0;
  position: relative;
  overflow: hidden;

  & > .thumbnail-button {
    & :deep(a.button-link) { padding: 0; }
    padding: 0;
    aspect-ratio: 1;
  }

  & > .text-layer {
    position: absolute;
    display: flex;
    flex-direction: column;
    justify-self: stretch;
    width: 100%;
    pointer-events: none;

    left: 0;
    bottom: 0;
    gap: 0;
    border: 3px solid var(--theme-border);

    & > .title {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    transition: color, background-color, accent-color var(--anim-transition);
  }

  &:hover {
    & > .text-layer {
      color: var(--theme-text-hover);
      background-color: var(--theme-background-hover);
      accent-color: var(--theme-background-hover);
    }
  }
  &:active {
    & > .text-layer {
      color: var(--theme-text-active);
      background-color: var(--theme-background-active);
      accent-color: var(--theme-background-active);
    }
  }
}
</style>