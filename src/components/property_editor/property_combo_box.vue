<script setup lang="ts">
import { PropType } from 'vue'
import { IPropertyComboBoxOptions } from '@/util/property_editor/property_interfaces';

const options = defineProps<IPropertyComboBoxOptions>();
const model = defineModel({
  type: [String, Number] as PropType<String | Number>,
  required: true,
});
</script>

<template>
  <select class="property-editor-combo-box" :name="name" :disabled="disabled" v-model="model">
    <option v-for="([property_name, label]) in options.values"
            :value="property_name">
      {{ label }}
    </option>
  </select>
</template>

<style scoped>
select,
::picker(select) {
  appearance: base-select;
  border-radius: var(--size-border-radius);
}
option::checkmark {
  display: none;
}

select {
  font-size: 1rem;
  border-radius: var(--size-border-radius);
  padding: 0 var(--size-padding-round);
  align-items: center;

  transition-property: background-color;
  transition-duration: var(--anim-transition-duration);
  transition-timing-function: var(--anim-transition-timing-function);

  color: var(--color-text-button);
  background-color: var(--color-background-button);
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
}

option {
  transition-property: background-color;
  transition-duration: var(--anim-transition-duration);
  transition-timing-function: var(--anim-transition-timing-function);
  padding: 0 var(--size-padding-round);

  color: var(--color-text-button);
  background-color: var(--color-background-button);

  &:hover,
  &:focus {
    background-color: var(--color-background-button-hover);
  }
  &:checked {
    background-color: var(--color-background-button-selected);
  }
  &:disabled {
    background-color: var(--color-background-button-disabled);
  }
}
</style>
