<script setup lang="ts">
import { computed, unref } from 'vue'
import { IPropertyNumberRangeOptions } from '@/util/property_editor/property_interfaces';

const options = defineProps<IPropertyNumberRangeOptions>();
const model = defineModel({
  type: Number,
  required: true,
  set(value) {
    return Math.min(Math.max(value, options.range.min), options.range.max);
  },
});

const display_range = computed(() => {
  if (options.converter) {
    var a = options.converter.toView(options, options.range.min);
    var b = options.converter.toView(options, options.range.max);
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
  <div class="property-editor-number-range">
    <input :name="name" type="number"
           :disabled="unref(disabled)"
           inputmode="decimal"
           :min="display_range.min"
           :max="display_range.max"
           :step="display_step"
           v-model.number.lazy="display_model" />
    <input :name="name" type="range"
           :disabled="unref(disabled)"
           :min="display_range.min"
           :max="display_range.max"
           :step="display_step"
           v-model.number="display_model" />
  </div>
</template>

<style scoped>
.property-editor-number-range {
  display: flex;
  flex-direction: row;
  gap: var(--size-property-grid-gap);
}
input[type=number] {
  color: var(--color-text-button);
  background-color: var(--color-background-button);
  font-family: Consolas, Monaco, 'Lucida Console', 'Courier New', Courier, monospace;
  border-radius: var(--size-border-radius);
  padding-left: var(--size-padding-round);
  font-size: 1rem;

  display: block;
  width: 4.5rem;
  transition: background-color var(--anim-transition);
  &:hover,
  &:focus {
    background-color: var(--color-background-button-hover);
  }
  &:active {
    background-color: var(--color-background-button-active);
  }
  &:disabled {
    background-color: var(--color-background-button-disabled);
  }
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    mask: url("@/assets/property_editor/number_spinner.svg");
    background-color: var(--color-text-button);
    width: 1rem;
    height: 1rem;
    padding-right: var(--size-padding-hard);
    cursor: pointer;
  }
  /**
   * Firefox doesn't appear to have a mechanism similar to
   * webkit-{inner|outer}-spin-button for styling the native
   * controls. Hide the spin button instead.
   */
  -moz-appearance: textfield;
}
input[type=range] {
  flex: 1;
  width: 100%;

  transition: accent-color var(--anim-transition);
  accent-color: var(--color-background-button);
  &:hover,
  &:focus {
    accent-color: var(--color-background-button-hover);
  }
  &:active {
    accent-color: var(--color-background-button-active);
  }
  &:disabled {
    accent-color: var(--color-background-button-disabled);
  }
}
</style>
