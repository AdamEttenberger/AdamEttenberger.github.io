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
    var new_value = Math.min(Math.max(value, props.min_value), props.max_value);
    emit('property-changed', props.name, new_value);
    return new_value;
  },
});
</script>

<template>
  <div class="number-range">
    <input :name="name" type="number"
           inputmode="decimal"
           :min="min_value"
           :max="max_value"
           :step="step_value"
           v-model.number.lazy="model" />
    <input :name="name" type="range"
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
}
input[type=number] {
  font-family: Consolas, Monaco, 'Lucida Console', 'Courier New', Courier, monospace;
  border-radius: var(--size-border-radius);
  padding-left: var(--size-padding-round);

  display: block;
  min-width: 4.5em;
  transition: background-color var(--anim-transition);
  background-color: var(--color-background-button);
  &:hover,
  &:focus {
    background-color: var(--color-background-button-hover);
  }
  &:active {
    background-color: var(--color-background-button-active);
  }
}
input[type=range] {
  flex: 1;

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
