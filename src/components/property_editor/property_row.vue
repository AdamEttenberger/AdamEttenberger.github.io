<script setup lang="ts" generic="T extends AnyPropertyOptions">
import { computed, unref, nextTick } from 'vue'

import { AnyPropertyOptions, ButtonOptions, ComboBoxOptions, NumberRangeOptions, PropertyKind, PropertyValueOptions, ToggleOptions } from '@/util/property_editor/property_interfaces'

import Button from '@/components/button.vue'
import ComboBox from '@/components/property_editor/combo_box.vue'
import Toggle from '@/components/property_editor/toggle.vue'
import NumberRange from '@/components/property_editor/number_range.vue'

const emit = defineEmits([
  'property-changing', // (new_value: any)
  'property-changed', // ()
  'property-click',   // ()
]);

const props = defineProps<{
  options: T,
}>();

const model = defineModel({
  set(new_value) {
    emit('property-changing', new_value);
    nextTick(() => {
      emit('property-changed');
    });
    return new_value;
  }
});
const is_model_changed = computed(() => unref(model) != unref((props.options as PropertyValueOptions)?.default_value));

const kind = computed(() => unref(props.options.kind));
const classes = computed(() => unref(props.options.classes) ?? []);
const name = computed(() => unref(props.options.name));
const label = computed(() => unref(props.options.label));
const disabled = computed(() => unref(props.options.disabled));
const visible = computed(() => !unref(props.options.collapsed));
</script>

<template>
  <div v-if="visible" :class="['property-row', ...classes]">
    <label :for="name">{{ label }}</label>
    <Button :class="['undo', is_model_changed ? '' : 'hidden']"
            :name="'undo:' + name"
            :disabled="disabled"
            :icon="['fas', 'rotate-left']"
            @click="model = unref((props.options as PropertyValueOptions)?.default_value)" />
    <!-- Filter by property control type -->
    <Button v-if="kind === PropertyKind.Button"
            :name="name"
            v-bind="options as ButtonOptions"
            @click="$emit('property-click')" />
    <ComboBox v-if="kind === PropertyKind.ComboBox"
              :name="name"
              v-bind="options as ComboBoxOptions"
              v-model="model" />
    <NumberRange v-if="kind === PropertyKind.NumberRange"
                 :name="name"
                 v-bind="options as NumberRangeOptions"
                 v-model="model" />
    <Toggle v-if="kind === PropertyKind.Toggle"
            :name="name"
            v-bind="options as ToggleOptions"
            v-model="model"
            @click="$emit('property-click')" />
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
