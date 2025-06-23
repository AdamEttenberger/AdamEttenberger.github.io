<script setup>
import { ref } from 'vue'
import ComboBox from './combo_box.vue'
import ImageButton from '../image_button.vue'
import NumberRange from './number_range.vue'

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

const initial_value = ref(model.value);

</script>

<template>
  <div class="property-row">
    <label :for="name">{{ label }}</label>
    <div class="undo">
      <ImageButton v-if="model != (options.initial_value ?? initial_value)" @click="model = (options.initial_value ?? initial_value)">
        <font-awesome-icon :icon="['fas', 'arrow-rotate-left']" />
      </ImageButton>
    </div>
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
  gap: var(--size-property-grid-gap);
}

.undo {
  height: 100%;
  aspect-ratio: 1;
}
</style>
