<script setup lang="ts">
import IndeterminateProgress from '@/components/progress/indeterminate-progress.vue'
import PropertyRow from '@/components/property_editor/property_row.vue'
import { PropertyEmits } from '@/util/property_editor/property_interfaces'
import { type PropertyModelRecords, type PropertyOptionRecords } from '@/composables/property_editor_model'
import useTheme, { type IThemeProps, type ThemeOptions } from '@/composables/theme'

const props = defineProps<IThemeProps & {
  rows: PropertyOptionRecords;
}>();

const models = defineModel<PropertyModelRecords>({ required: true });

const emit = defineEmits(Object.values(PropertyEmits));

const { theme } = useTheme(() => ({ color: props.color, depth: props.depth, absolute: props.absolute } as ThemeOptions));

function onPropertyEmitsHandler(kind: PropertyEmits, name: string, new_value?: unknown): void {
  emit(kind, name, new_value);
}
</script>

<template>
  <div>
    <Suspense>
      <template #fallback>
        <IndeterminateProgress />
      </template>

      <div :class="['property-editor', ...theme.classNames]">
        <PropertyRow  v-for="item in props.rows" :key="item.name"
                      :item
                      v-model="models[item.name]"
                      @property-loaded="onPropertyEmitsHandler"
                      @property-changing="onPropertyEmitsHandler"
                      @property-changed="onPropertyEmitsHandler"
                      @property-click="onPropertyEmitsHandler"
                      @property-reset="onPropertyEmitsHandler" />
      </div>
    </Suspense>
  </div>
</template>

<style scoped>
.property-editor {
  container: property-editor / inline-size;
  display: grid;

  /**
   * Columns: Label, Undo, Editor
   */
  grid-template-columns: min-content min-content 1fr;
  padding: var(--padding-small);
  gap: var(--padding-xsmall);
}
</style>
