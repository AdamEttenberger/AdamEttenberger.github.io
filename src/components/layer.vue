<style>
:root {
  /**
    * <Layer> adds padding, insetting all contents preventing the outer
    * area from being clicked when used as a background for a clickable
    * control. If a child component needs to "fit" the boundary of the
    * <Layer> for technical reasons then these variables
    * can be used to undo the padding from within the layer.
    * e.g., To make the entire area of the layer clickable for a <button>.
    *
    * Example:
    * {
    *   color: inherit;
    *   background-color: inherit;
    *   // See comment in '@/components/layer.vue' for details.
    *   margin: var(--inverse-component-layer-padding);
    * }
    */
  --component-layer-padding: var(--padding-large);
  --component-layer-gap: var(--padding-xxlarge);
}
</style>

<script setup lang="ts">
import { computed, PropType, unref } from 'vue'
import useTheme, { ThemeColor } from '@/composables/theme'

const props = defineProps({
  color: { type: [null, String, ThemeColor] as PropType<null|String|ThemeColor>, default: null },
  depth: { type: [null, Number] as PropType<null|Number>, default: null },
  absolute: { type: Boolean, default: false },

  /**
   * Prevents the layer from drawing a background or adding to the layer depth.
   * This is useful for situations where you want a <Section> or <Details> without
   * adding a background or affecting descendant colors, or to temporarily disable
   * stop drawing the background of a layer.
   */
  transparent: { type: Boolean, default: false },
  show_hover: { type: Boolean, default: false },
  disabled: { type: [Boolean, Object] as PropType<Boolean|Object>, default: false },
})

const { theme } = useTheme(() => ({
  color: props.color,
  depth: props.depth ?? (props.transparent ? 0 : 1),
  absolute: props.absolute && (props.depth != null),
}));

const class_names = computed(() => {
  var result = ['round', 'layer', ...theme.value.classNames];
  if (unref(props.transparent)) {
    result.push('transparent');
  } else {
    if (unref(props.show_hover)) {
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
    accent-color: var(--theme-tbackgroundext-disabled);
  }
}
</style>
