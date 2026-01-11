<script setup lang="ts">
import { computed, unref } from 'vue'
import { NumberRangeOptions } from '@/util/property_editor/property_interfaces';

const options = defineProps<NumberRangeOptions>();
const model = defineModel({
  type: Number,
  required: true,
  set(value) {
    return Math.min(Math.max(value, options.min_value), options.max_value);
  },
});

const display_min = computed(() => !options.as_scalar ? options.min_value : 0.0);
const display_max = computed(() => !options.as_scalar ? options.max_value : 1.0);
const display_step = computed(() => !options.as_scalar ? options.step_value : (options.step_value / (options.max_value - options.min_value).toFixed(2)));
const display_model = computed({
  get() {
    return !options.as_scalar
        ? model.value
        : (model.value - options.min_value) / (options.max_value - options.min_value);
  },
  set(value) {
    model.value = !options.as_scalar
        ? value
        : options.min_value + value * (options.max_value - options.min_value);
  },
});
</script>

<template>
  <div class="number-range">
    <input :name="name" type="number"
           :disabled="unref(disabled)"
           inputmode="decimal"
           :min="display_min"
           :max="display_max"
           :step="display_step"
           v-model.number.lazy="display_model" />
    <input :name="name" type="range"
           :disabled="unref(disabled)"
           :min="display_min"
           :max="display_max"
           :step="display_step"
           v-model.number="display_model" />
  </div>
</template>

<style scoped>
.number-range {
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
