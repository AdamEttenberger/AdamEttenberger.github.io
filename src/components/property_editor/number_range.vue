<script setup>
/**
 * Emits `name: String`
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
    emit('property-changed', props.name);
    return Number(value);
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
  accent-color: var(--color-link);
}
</style>
