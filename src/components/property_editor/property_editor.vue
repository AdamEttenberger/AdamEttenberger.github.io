<script setup>
import PropertyRow from './property_row.vue'

defineProps({
  properties: { type: Object, required: true },
});

/**
 * Emits `name: String, new_value: any`
 */
const emit = defineEmits(['property-changed']);

function onPropertyChanged(name, new_value) {
  emit('property-changed', name, new_value);
}
</script>

<template>
  <div class="framed property-editor">
    <PropertyRow v-for="(value, key) in properties"
                 :name="key"
                 :label="value.label"
                 :type="value.type"
                 :options="value.options"
                 v-model="value.model"
                 @property-changed="onPropertyChanged" />
  </div>
</template>

<style scoped>
.property-editor {
  display: grid;
  /**
   * Columns: Label, Undo, Editor
   */
  grid-template-columns: max-content max-content minmax(0, auto);
  gap: 2px;
  place-self: center;
  width: 100%;
  max-width: calc(var(--size-column-width) / 2);
  padding: var(--size-padding-hard);
}
</style>
