<script setup>
import { ref, onMounted, watch } from 'vue'
import NumberRange from './number_range.vue'
import ComboBox from './combo_box.vue'

/**
 * Emits `name: String, new_value: any`
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
    emit('property-changed', props.name, value);
    return value;
  }
});

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
    <ComboBox v-if="type === 'combobox'"
              :name="name"
              :options="options.values"
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

  font-size: 1rem;
  background-color: transparent;
  color: var(--color-text-button);

  &:has(:is(img, svg)) {
    transition-property: background-color, color, font-size;
    transition-duration: var(--anim-transition-duration);
    transition-timing-function: var(--anim-transition-timing-function);
    font-size: 1rem;
    background-color: var(--color-background-button);
    color: var(--color-text-button);
    &:hover {
      font-size: 1.2rem;
      background-color: var(--color-background-button-hover);
      color: var(--color-text-button-hover);
    }
    &:active {
      background-color: var(--color-background-button-active);
      color: var(--color-text-button-active);
    }
  }
}
</style>
