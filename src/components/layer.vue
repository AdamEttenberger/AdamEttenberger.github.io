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
  --inverse-component-layer-padding: calc(-1 * var(--padding-large));
  --component-layer-gap: var(--padding-xxlarge);
}
</style>

<script setup lang="ts">
import { computed, PropType, unref } from 'vue'
import useTheme, { ThemeColor } from '@/composables/theme'

const props = defineProps({
  color: { type: [null, String, ThemeColor] as PropType<null|String|ThemeColor>, default: null },
  depth_offset: { type: [null, Number] as PropType<null|Number>, default: null },
  /**
   * Prevents the layer from drawing a background or adding to the layer depth.
   * This is useful for situations where you want a <Section> or <Details> without
   * adding a background or affecting descendant colors, or to temporarily disable
   * stop drawing the background of a layer.
   */
  transparent: { type: Boolean, default: false },
  show_hover: { type: Boolean, default: false },
})

const { current_layer_info } = useTheme(() => ({
  color: props.color,
  depth: props.depth_offset ?? (props.transparent ? 0 : 1),
  absolute: false,
}));

const class_names = computed(() => {
  var result = ['round', 'layer', current_layer_info.value.color, `layer-${current_layer_info.value.depth}`];
  if (unref(props.transparent)) {
    result.push('transparent');
  } else if (unref(props.show_hover)) {
    result.push('show_hover');
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
  --primary-hover:      hsl(from var(--primary)   h s calc(l + 20));
  --primary-active:     hsl(from var(--primary)   h s calc(l - 20));
  --primary-disabled:   hsl(from var(--primary)   h 0 l);
  --secondary-hover:    hsl(from var(--secondary) h s calc(l + 20));
  --secondary-active:   hsl(from var(--secondary) h s calc(l - 20));
  --secondary-disabled: hsl(from var(--secondary) h 0 l);
  --accent-hover:       hsl(from var(--accent)    h s calc(l + 20));
  --accent-active:      hsl(from var(--accent)    h s calc(l - 20));
  --accent-disabled:    hsl(from var(--accent)    h 0 l);

  display: flex;
  flex-direction: column;
  padding: var(--component-layer-padding);
  gap: var(--component-layer-gap);

  color: var(--text);
  background-color: var(--background);
  accent-color: var(--background);
  &.primary {
    background-color: var(--primary);
    accent-color: var(--primary);
  }
  &.secondary {
    background-color: var(--secondary);
    accent-color: var(--secondary);
  }
  &.accent {
    color: var(--accent-text);
    background-color: var(--accent);
    accent-color: var(--accent);
  }
  &:is(.error, .delete) {
    background-color: var(--background-error);
    accent-color: var(--background-error);
  }
  &.transparent {
    background-color: transparent;
    accent-color: transparent;
  }
}

.layer.show_hover {
  &.primary {
    color: var(--text);
    &:hover { background-color: var(--primary-hover); accent-color: var(--primary-hover); }
    &:active { background-color: var(--primary-active); accent-color: var(--primary-active); }
    &:disabled, [disabled] & { background-color: var(--primary-disabled); accent-color: var(--primary-disabled); }
  }
  &.secondary {
    color: var(--text);
    &:hover { background-color: var(--secondary-hover); accent-color: var(--secondary-hover); }
    &:active { background-color: var(--secondary-active); accent-color: var(--secondary-active); }
    &:disabled, [disabled] & { background-color: var(--secondary-disabled); accent-color: var(--secondary-disabled); }
  }
  &.accent {
    color: var(--accent-text);
    &:hover { background-color: var(--accent-hover); accent-color: var(--accent-hover); }
    &:active { background-color: var(--accent-active); accent-color: var(--accent-active); }
    &:disabled, [disabled] & { background-color: var(--accent-disabled); accent-color: var(--accent-disabled); }
  }
  &:is(.error, .delete) {
    color: hsl(var(--hue-error), 65%, 15%);
    &:hover { background-color: var(--error-hover); accent-color: var(--error-hover); }
    &:active { background-color: var(--error-active); accent-color: var(--error-active); }
    &:disabled, [disabled] & { background-color: var(--error-disabled); accent-color: var(--error-disabled); }
  }
}
</style>
