<script setup lang="ts">
import { unref } from 'vue'
import useTheme, { type IThemeProps, type ThemeOptions } from '@/composables/theme'

const props = defineProps<IThemeProps & {
  heading?: string;
}>();
const { theme } = useTheme(() => ({ color: unref(props.color), depth: 0 }));
</script>

<template>
  <div :class="['divider', transparent?'transparent':'', ...theme.classNames]">
    <h2 v-if="$slots.default" class="heading"><slot></slot></h2>
    <h2 v-else-if="heading" class="heading">{{ heading }}</h2>
  </div>
</template>

<style scoped>
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  padding: var(--padding-normal) var(--padding-xxlarge);

  &:is(.transparent) {
    & .heading {
      color: var(--theme-border);
    }
  }
  &:not(.transparent) {
    & .heading {
      color: var(--theme-text);
      background-color: var(--theme-background);
      border: 3px solid var(--theme-border);
      border-radius: var(--size-border-radius);
    }
  }

  & .heading {
    padding: 0 var(--padding-xxlarge);
  }

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 3px solid var(--theme-border);
  }
}
</style>