<script setup lang="ts">
import { ref, unref } from 'vue'
import PropertyRow from '@/components/property_editor/property_row.vue'
import { AnyPropertyOptions, PropertyValueOptions } from '@/util/property_editor/property_interfaces';

const props = defineProps({
  properties: { type: Array<AnyPropertyOptions>, required: true },
});
for (const options of props.properties) {
  var value_option = options as PropertyValueOptions;
  if (!value_option || unref(value_option.model) !== undefined) {
    continue;
  }
  value_option.model = ref(unref(value_option.default_value));
}

const emit = defineEmits([
  'property-changing', // (name: String, new_value: any)
  'property-changed', // (name: String)
  'property-click',   // (name: String)
]);

const models = ref(Object.fromEntries(props.properties.map(options => [options.name, (options as PropertyValueOptions)?.model])));

function set(name: string, new_value: any) {
  models.value[name] = new_value;
}

function get(name: string) {
  return models.value[name];
}

defineExpose({
  set,
  get,
});
</script>

<template>
  <div class="framed property-editor">
    <PropertyRow v-for="options in properties"
                 :options="options"
                 v-model="models[options.name]"
                 @property-changing="new_value => $emit('property-changing', options.name, new_value)"
                 @property-changed="$emit('property-changed', options.name)"
                 @property-click="$emit('property-click', options.name)" />
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
