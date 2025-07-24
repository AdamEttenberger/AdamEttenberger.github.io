<script setup>
/**
 * Emits `name: String, new_value: Number`
 */
const emit = defineEmits(['property-changed']);

const props = defineProps({
  name: { type: String, required: true },
  disabled: { type: Boolean, required: true },
  min_value: { type: Number, required: true },
  max_value: { type: Number, required: true },
  step_value: { type: Number, required: true },
});

const model = defineModel({
  type: Number,
  required: true,
  set(value) {
    var new_value = Math.min(Math.max(value, props.min_value), props.max_value);
    emit('property-changed', props.name, new_value);
    return new_value;
  },
});
</script>

<template>
  <div class="number-range">
    <input :name="name" type="number"
           :disabled="disabled"
           inputmode="decimal"
           :min="min_value"
           :max="max_value"
           :step="step_value"
           v-model.number.lazy="model" />
    <input :name="name" type="range"
           :disabled="disabled"
           :min="min_value"
           :max="max_value"
           :step="step_value"
           v-model.number="model" />
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
}
</style>
