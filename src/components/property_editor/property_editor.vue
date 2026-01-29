<script setup lang="ts">
import { isRef, onMounted, ref, unref, shallowReadonly } from 'vue'
import PropertyRow from '@/components/property_editor/property_row.vue'
import { AnyPropertyOptions, IPropertyValueOptions } from '@/util/property_editor/property_interfaces';

const editor_options = ref([]);
const models = ref({});

const props = defineProps({
  properties: { type: Array<AnyPropertyOptions>, required: true },
});

const emit = defineEmits([
  'property-changing', // (name: String, new_value: any)
  'property-changed', // (name: String)
  'property-click',   // (name: String)
]);

defineExpose({
  set(name: string, new_value: any) {
    models.value[name] = new_value;
  },
  get(name: string) {
    return models.value[name];
  },
});

onMounted(() => {
  // Only taking a shallow copy because `props.properties` is expected to contain refs for
  // modelValue which allows callers to pass refs to setModel and retain reactivity outside.
  editor_options.value = shallowReadonly(props.properties);
  models.value = Object.fromEntries(editor_options.value.map(options => {
    var value_options = options as IPropertyValueOptions;
    if (!value_options) {
      return undefined;
    }
    if (value_options.modelValue === undefined) {
      return [options.name, unref(value_options.default_value)];
    }
    if (isRef(value_options.modelValue) && value_options.modelValue.value === null && unref(value_options.default_value) !== undefined) {
      value_options.modelValue.value = unref(value_options.default_value);
    }
    return [options.name, value_options.modelValue];
  }));
});
</script>

<template>
  <div class="framed property-editor">
    <PropertyRow v-for="options in editor_options"
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
  max-width: calc(var(--size-column-width) * 0.75);
  padding: var(--size-padding-hard);
}
</style>
