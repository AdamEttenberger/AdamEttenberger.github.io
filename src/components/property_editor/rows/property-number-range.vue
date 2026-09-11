<script setup lang="ts">
import { computed, toValue } from 'vue'
import Layer from '@/components/layer.vue'
import { type IPropertyNumberRangeRow } from '@/util/property_editor/property_interfaces'

const options = defineProps<IPropertyNumberRangeRow>();
const model = defineModel({
  type: Number,
  required: true,
  set(value) {
    return Math.min(Math.max(value, options.range.min), options.range.max);
  },
});

const display_range = computed(() => {
  const converter = options.converter;
  if (converter) {
    var a = converter.toView(options, options.range.min);
    var b = converter.toView(options, options.range.max);
    return {
      min: Math.min(a, b),
      max: Math.max(a, b),
    };
  }
  return options.range;
});

const display_step = computed(() => {
  var result = options.step;
  if (options.converter) {
    result = (result / (options.range.max - options.range.min)) * (display_range.value.max - display_range.value.min);
  }
  return result;
});

const display_model = computed({
  get() {
    return options.converter?.toView(options, model.value) ?? model.value;
  },
  set(new_value) {
    model.value = options.converter?.toModel(options, new_value) ?? new_value;
  },
});
</script>

<template>
  <Layer class="property-editor-number-range">
    <input :name type="number"
           :disabled="toValue(disabled)"
           inputmode="decimal"
           :min="display_range.min"
           :max="display_range.max"
           :step="display_step"
           v-model.number.lazy="display_model" />
    <input :name type="range"
           :disabled="toValue(disabled)"
           :min="display_range.min"
           :max="display_range.max"
           :step="display_step"
           v-model.number="display_model" />
  </Layer>
</template>

<style scoped>
.property-editor-number-range {
  display: flex;
  flex-direction: row;
  padding: 0;
  gap: var(--padding-small);
  background-color: transparent;
}

input {
  &[type=number]  { flex-shrink: 0; }
  &[type=range]   { flex-grow: 1;   }

  color: var(--theme-text);
  accent-color: var(--theme-background);
  background-color: var(--theme-background);

  transition-property: color, background-color, accent-color;
  transition-duration: var(--anim-transition);
  &:hover { background-color: var(--theme-background-hover); accent-color: var(--theme-background-hover); }
  &:active { background-color: var(--theme-background-active); accent-color: var(--theme-background-active); }
  &:disabled, [disabled] { background-color: var(--theme-background-disabled); accent-color: var(--theme-background-disabled); }
}

input[type=number] {
  font-family: Consolas, Monaco, 'Lucida Console', 'Courier New', Courier, monospace;
  border-radius: var(--size-border-radius);
  padding-left: var(--padding-normal);
  font-size: 1rem;

  display: block;
  width: 4.5rem;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    mask: url("@/assets/property_editor/number_spinner.svg");
    background-color: var(--theme-text);
    width: 1rem;
    height: 1rem;
    padding-right: var(--padding-small);
    cursor: pointer;
  }
  /**
   * Firefox doesn't appear to have a mechanism similar to
   * webkit-{inner|outer}-spin-button for styling the native
   * controls. Hide the spin button instead.
   */
  -moz-appearance: textfield;
}
</style>
