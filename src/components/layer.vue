<script setup lang="ts">
import { computed, type MaybeRef, unref } from 'vue'
import useTheme, { type IThemeProps, type ThemeOptions } from '@/composables/theme'

const props = defineProps<IThemeProps & {
  showHover?: boolean;
  disabled?: boolean;
}>();

const { theme } = useTheme(() => ({
  color: props.color,
  depth: props.depth ?? (props.transparent ? 0 : 1),
  absolute: props.absolute && (props.depth != null),
} as ThemeOptions));

const class_names = computed(() => {
  var result = ['round', 'layer', ...theme.value.classNames];
  if (unref(props.transparent)) {
    result.push('transparent');
  } else {
    if (unref(props.showHover)) {
      result.push('show_hover');
    }
    if (unref(props.disabled)) {
      result.push('disabled');
    }
  }
  return result;
});
</script>

<template>
  <div :class="class_names">
    <slot></slot>
  </div>
</template>

<style scoped>
.layer {
  display: flex;
  flex-direction: column;
  padding: var(--component-layer-padding);
  gap: var(--component-layer-gap);

  color: var(--theme-text);
  background-color: var(--theme-background);
  accent-color: var(--theme-background);
  &.transparent {
    background-color: transparent;
    accent-color: transparent;
  }

  &.show_hover:hover {
    color: var(--theme-text-hover);
    background-color: var(--theme-background-hover);
    accent-color: var(--theme-background-hover);
  }
  &.show_hover:active {
    color: var(--theme-text-active);
    background-color: var(--theme-background-active);
    accent-color: var(--theme-background-active);
  }
  &.show_hover:disabled,
  [disabled] &.show_hover,
  &.disabled {
    color: var(--theme-text-disabled);
    background-color: var(--theme-background-disabled);
    accent-color: var(--theme-background-disabled);
  }
}
</style>
