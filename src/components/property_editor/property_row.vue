<script setup>
import { ref, watch } from 'vue'
import Button from '@/components/button.vue'
import ComboBox from '@/components/property_editor/combo_box.vue'
import Toggle from '@/components/property_editor/toggle.vue'
import NumberRange from '@/components/property_editor/number_range.vue'

const emit = defineEmits([
  'property-changed', // (name: String, new_value: any)
  'property-click',   // (name: String)
]);

const props = defineProps({
  name: { type: String, required: true },
  disabled: { type: Boolean, default: false },
  label: { type: String, required: true },
  type: { type: String, required: true },
  options: { type: Object },
});

const modified_model = defineModel('modified', { default: false });
const model = defineModel({
  default: null,
  set(new_value) {
    modified_model.value = (new_value != (props.options?.initial_value ?? initial_value.value));
    emit('property-changed', props.name, new_value);
    return new_value;
  }
});
const initial_value = model?.value ? ref(model.value) : undefined;
</script>

<template>
  <div class="property-row">
    <label :for="name">{{ label }}</label>
    <Toggle :class="['undo', !modified_model ? 'hidden' : '']"
            :name="'undo:' + name"
            :disabled="disabled"
            :icon="['fas', 'rotate-left']"
            v-model="modified_model"
            @click="model = (options?.initial_value ?? initial_value)" />
    <!-- Filter by property control type -->
    <Button v-if="type === 'button'"
            :name="name"
            :disabled="disabled"
            :text="options.text"
            @click="$emit('property-click', name)" />
    <ComboBox v-if="type === 'combobox'"
              :name="name"
              :disabled="disabled"
              :options="options.values"
              v-model="model" />
    <NumberRange v-if="type === 'range'"
                 :name="name"
                 :disabled="disabled"
                 :min_value="options.min_value"
                 :max_value="options.max_value"
                 :step_value="options.step_value"
                 v-model="model" />
    <Toggle v-if="type === 'toggle'"
            :name="name"
            :disabled="disabled"
            v-model="model"
            @click="$emit('property-click', name)" />
  </div>
</template>

<style scoped>
.property-row {
  display: contents;
}

.undo :deep(svg.image-button-fa-icon) {
  font-size: 1rem;
  font-weight: bolder;
}

.hidden {
  visibility: hidden;
}
</style>
