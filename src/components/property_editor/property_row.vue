<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, toValue } from 'vue'
import Button from '@/components/buttons/button.vue'
import useTheme, { ThemeColor } from '@/composables/theme'
import {
  type PropertyType,
  PropertyEmits,
  type PropertyValueType,
} from '@/util/property_editor/property_interfaces'

const emit = defineEmits(Object.values(PropertyEmits));

const props = defineProps<{
  item: PropertyType,
}>();

const model = defineModel({
  set(new_value) {
    emit(PropertyEmits.Changing, PropertyEmits.Changing, props.item.name, new_value);
    void nextTick().then(() => {
      emit(PropertyEmits.Changed, PropertyEmits.Changed, props.item.name);
    });
    return new_value;
  }
});

const label_text = computed<undefined|string>(() => props.item.meta.with_label ? props.item.label : undefined);
const show_reset = computed<boolean>(() => (model.value !== undefined) && props.item.meta.with_reset);
const dynamic_component = computed(() => props.item.meta.component ? defineAsyncComponent(props.item.meta.component) : undefined);

const is_model_changed = computed(() => model.value != toValue((props.item as PropertyValueType).default_value));

function onPropertyClick() {
  if (!props.item.meta.with_click) {
    return;
  }
  emit(PropertyEmits.Click, PropertyEmits.Click, props.item.name);
}

function onPropertyReset() {
  emit(PropertyEmits.Reset, PropertyEmits.Reset, props.item.name);
}

const { theme } = useTheme(() => ({ color: toValue(props.item.color) }));
</script>

<template>
  <div v-show="!toValue(item.collapsed)" :class="['property-row', ...theme.classNames]">
    <label v-if="label_text" class="label">{{ label_text }}</label>
    <Button v-if="show_reset"
            :color="ThemeColor.Error"
            :class="['reset', is_model_changed ? '' : 'hidden']"
            :name="`reset:${props.item.name}`"
            :disabled="toValue(item.disabled)"
            :icon="['fas', 'trash']"
            @click="onPropertyReset()" />
    <!-- Filter by property control type -->
    <component :is="dynamic_component"
              class="editor"
              v-bind="item"
              v-model="model"
              @click="onPropertyClick()" />
  </div>
</template>

<style scoped>
.property-row {
  display: grid;
  grid-template-columns: subgrid;
  grid-column: 1 / 4;

  & .label  { grid-column: 1 / 2; text-wrap: nowrap; }
  & .reset  { grid-column: 2 / 3; }
  & .editor { grid-column: 3 / 4; }

  & .property-editor-button,
  & .property-editor-divider,
  & .property-editor-group {
    grid-column: 1 / 4;
  }

  @container property-editor (max-width: 25rem) {
    display: grid;
    grid-template-rows: auto auto;
    grid-template-columns: subgrid;
    grid-column: 1 / 4;

    & .label  { grid-row: 1 / 2; grid-column: 1 / 4; text-overflow: ellipsis; }
    & .reset  { grid-row: 2 / 3; grid-column: 1 / 2; }
    & .editor { grid-row: 2 / 3; grid-column: 2 / 4; }

    & .property-editor-button,
    & .property-editor-divider,
    & .property-editor-group {
      grid-row: 1 / 3;
      grid-column: 1 / 4;
    }
  }
}

.hidden {
  visibility: hidden;
}
</style>
