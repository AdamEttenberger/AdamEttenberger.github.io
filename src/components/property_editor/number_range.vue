<script setup>
/**
 * Emits `name: String, new_value: Number`
 */
const emit = defineEmits(['property-changed']);

const props = defineProps({
  name: { type: String, required: true },
  min_value: { type: Number, required: true },
  max_value: { type: Number, required: true },
  step_value: { type: Number, required: true },
});

const model = defineModel({
  type: Number,
  required: true,
  set(value) {
    var new_value = Number(value);
    emit('property-changed', props.name, new_value);
    return new_value;
  },
});
</script>

<template>
  <input :name="name" type="range"
         :min="min_value"
         :max="max_value"
         :step="step_value"
         v-model="model" />
</template>

<style scoped>
input[type=range] {
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
