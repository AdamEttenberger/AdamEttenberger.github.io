<script setup lang="ts" generic="T extends AnyPropertyOptions">
import { computed, unref, nextTick } from 'vue'
import Button from '@/components/buttons/button.vue'
import useTheme, { ThemeColor } from '@/composables/theme'
import {
  AnyPropertyOptions,
  PropertyKind,
  IPropertyValueOptions,
} from '@/util/property_editor/property_interfaces'

import PropertyButton from '@/components/property_editor/property_button.vue'
import PropertyComboBox from '@/components/property_editor/property_combo_box.vue'
import PropertyDivider from '@/components/property_editor/property_divider.vue'
import PropertyGroup from '@/components/property_editor/property_group.vue'
import PropertyNumberRange from '@/components/property_editor/property_number_range.vue'
import PropertyToggle from '@/components/property_editor/property_toggle.vue'

const PropertyPicker = new Map([
  [PropertyKind.Button, PropertyButton],
  [PropertyKind.Color3, null],
  [PropertyKind.Color4, null],
  [PropertyKind.ComboBox, PropertyComboBox],
  [PropertyKind.Divider, PropertyDivider],
  [PropertyKind.Group, PropertyGroup],
  [PropertyKind.NumberRange, PropertyNumberRange],
  [PropertyKind.Toggle, PropertyToggle],
]);
const PropertyClickable = new Map([
  [PropertyKind.Button, true],
  [PropertyKind.Color3, false],
  [PropertyKind.Color4, false],
  [PropertyKind.ComboBox, false],
  [PropertyKind.Divider, false],
  [PropertyKind.Group, false],
  [PropertyKind.NumberRange, false],
  [PropertyKind.Toggle, true],
]);

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
const is_model_changed = computed(() => unref(model) != unref((props.options as IPropertyValueOptions)?.default_value));

// const kind = computed(() => unref(props.options.kind));
const name = computed(() => unref(props.options.name));
const label = computed(() => unref(props.options.label));
const disabled = computed(() => unref(props.options.disabled));
const visible = computed(() => !unref(props.options.collapsed));
const has_value = computed(() => unref(model) !== undefined);
const show_label = computed(() => unref(props.options.show_label));
const show_undo = computed(() => has_value.value && unref(props.options.show_undo));
const dynamic_component = computed(() => PropertyPicker.get(unref(props.options.kind)));

function onPropertyClicked() {
  if (!PropertyClickable.get(unref(props.options.kind))) {
    return;
  }
  emit('property-click');
}

const { theme } = useTheme(() => ({ color: unref(props.options.color) }));
</script>

<template>
  <div v-show="visible" :class="['property-row', ...theme.classNames]">
    <label v-if="show_label && label" class="label" :for="name">{{ label }}</label>
    <Button v-if="show_undo && model !== undefined"
            :color="ThemeColor.Error"
            :class="['undo', is_model_changed ? '' : 'hidden']"
            :name="'undo:' + name"
            :disabled="disabled"
            :icon="['fas', 'trash']"
            @click="model = unref((props.options as IPropertyValueOptions)?.default_value)" />
    <!-- Filter by property control type -->
    <component :is="dynamic_component"
               class="editor"
               v-bind="options"
               v-model="model"
               @click="onPropertyClicked()" />
  </div>
</template>

<style scoped>
.property-row {
  display: contents;

  & .label  { grid-column: 1 / 2; }
  & .undo   { grid-column: 2 / 3; }
  & .editor { grid-column: 3 / 4; }

  & .property-editor-button,
  & .property-editor-divider,
  & .property-editor-group {
    grid-column: 1 / 4;
  }

  @container property-editor (max-width: 35rem) {
    display: grid;
    grid-column: 1 / 4;
    grid-template-rows: auto auto;
    grid-template-columns: min-content auto;

    & .label  { grid-row: 1 / 2; grid-column: 1 / 3; }
    & .undo   { grid-row: 2 / 3; grid-column: 1 / 2; }
    & .editor { grid-row: 2 / 3; grid-column: 2 / 3; }

    & .property-editor-button,
    & .property-editor-divider,
    & .property-editor-group {
      grid-row: 1 / 3;
      grid-column: 1 / 3;
    }
  }
}

.hidden {
  visibility: hidden;
}
</style>
