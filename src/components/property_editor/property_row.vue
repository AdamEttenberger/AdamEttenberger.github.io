<script setup>
import { ref } from 'vue'
import Button from '@/components/property_editor/button.vue'
import ComboBox from '@/components/property_editor/combo_box.vue'
import ImageButton from '@/components/image_button.vue'
import NumberRange from '@/components/property_editor/number_range.vue'

const emit = defineEmits([
  'property-changed', // (name: String, new_value: any)
  'property-click',   // (name: String)
]);

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, required: true },
  options: { type: Object },
});

const model = defineModel({
  default: null,
  set(value) {
    emit('property-changed', props.name, value);
    return value;
  }
});

const initial_value = model?.value ? ref(model.value) : undefined;

</script>

<template>
  <div class="property-row">
    <label :for="name">{{ label }}</label>
    <div class="undo">
      <ImageButton v-if="model != (options?.initial_value ?? initial_value)" @click="model = (options?.initial_value ?? initial_value)">
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
    <Button v-if="type === 'button'"
              :name="name"
              :label="label"
              @property-click="$emit('property-click', name)" />
  </div>
</template>

<style scoped>
.property-row {
  display: contents;
}

.undo {
  height: 100%;
  aspect-ratio: 1;
}
</style>
