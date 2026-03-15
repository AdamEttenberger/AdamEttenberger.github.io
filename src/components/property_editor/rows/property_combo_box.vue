<script setup lang="ts">
import { toValue } from 'vue'
import Layer from '@/components/layer.vue'
import { type IPropertyComboBoxRow } from '@/util/property_editor/property_interfaces'
const options = defineProps<IPropertyComboBoxRow>();
const model = defineModel<string|number>({
  required: true,
});
</script>

<template>
  <Layer class="property-editor-combo-box" show_hover>
    <select :name :disable="toValue(disabled)" v-model="model">
      <option v-for="([property_name, label]) in options.values" :key="property_name"
              :value="property_name">
        {{ label }}
      </option>
    </select>
  </Layer>
</template>

<style scoped>
.property-editor-combo-box {
  padding: 0;
}
select,
::picker(select),
option {
  accent-color: var(--theme-background);
  background-color: var(--theme-background);

  transition-property: color, background-color, accent-color;
  transition-duration: var(--anim-transition);
  &:is(:hover, :focus) { background-color: var(--theme-background-hover); accent-color: var(--theme-background-hover); }
  &:is(:active, :checked) { background-color: var(--theme-background-active); accent-color: var(--theme-background-active); }
  &:disabled, [disabled] { background-color: var(--theme-background-disabled); accent-color: var(--theme-background-disabled); }
}

select,
::picker(select) {
  appearance: base-select;
  border-radius: var(--size-border-radius);
}
option::checkmark {
  display: none;
}

select {
  flex: 1;
  font-size: 1rem;
  align-items: center;
  padding: 0 var(--padding-large);
}
</style>
