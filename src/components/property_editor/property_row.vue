<script setup>
import { ref, onMounted, watch } from 'vue'
import NumberRange from './number_range.vue'

/**
 * Emits `name: String`
 */
const emit = defineEmits(['property-changed']);

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true },
  options: { type: Object },
});

const model = defineModel({
  required: true,
  set(value) {
    emit('property-changed', props.name);
    return value;
  } });

const initial_value = model.value;

</script>

<template>
  <div class="property-row">
    <label :for="name">{{ label }}</label>
    <button class="undo" @click="model = initial_value">
      <font-awesome-icon v-if="model != initial_value" :icon="['fas', 'arrow-rotate-left']" />
    </button>
    <NumberRange v-if="type === 'range'"
                 :name="name"
                 :min_value="options.min_value"
                 :max_value="options.max_value"
                 :step_value="options.step_value"
                 v-model="model" />
  </div>
</template>

<style scoped>
.property-row {
  display: contents;
}

.undo {
  height: 100%;
  aspect-ratio: 1;
  margin: 0 var(--size-padding-hard);
  border-radius: var(--size-border-radius);

  transition-property: background-color, color, font-size;
  transition-duration: var(--anim-transition-duration);
  transition-timing-function: var(--anim-transition-timing-function);

  background-color: transparent;
  color: var(--color-link);
  font-size: 1rem;

  &:has(:is(img, svg)):hover {
    font-size: 1.2rem;
    background-color: var(--color-background-button-hover);
    color: var(--color-link-hover);
  }
  &:has(:is(img, svg)):active {
    background-color: var(--color-background-button-active);
    color: var(--color-link-active);
  }
}
</style>
