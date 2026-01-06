<script setup>
import PropertyRow from '@/components/property_editor/property_row.vue'

defineProps({
  properties: { type: Object, required: true },
});

const emit = defineEmits([
  'property-changed', // (name: String, new_value: any)
  'property-click',   // (name: String)
]);

function onPropertyChanged(name, new_value) {
  emit('property-changed', name, new_value);
}
</script>

<template>
  <div class="framed property-editor">
    <PropertyRow v-for="(value, key) in properties"
                 :name="key"
                 :disabled="value.disabled"
                 :collapsed="value.collapsed"
                 :label="value.label"
                 :type="value.type"
                 :options="value.options"
                 v-model="value.model"
                 @property-changed="onPropertyChanged"
                 @property-click="$emit('property-click', key)" />
  </div>
</template>

<style scoped>
.property-editor {
  display: grid;
  /**
   * Columns: Label, Undo, Editor
   */
  grid-template-columns: max-content var(--size-property-grid-button) minmax(0, auto);
  gap: var(--size-property-grid-gap);
  place-self: center;
  width: 100%;
  max-width: calc(var(--size-column-width) / 2);
  padding: var(--size-padding-hard);
}
</style>
