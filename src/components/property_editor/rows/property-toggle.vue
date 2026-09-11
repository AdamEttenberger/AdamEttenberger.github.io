<script setup lang="ts">
import { toValue } from 'vue'
import Button from '@/components/buttons/button.vue'
import { type IPropertyToggleRow } from '@/util/property_editor/property_interfaces'
defineProps<IPropertyToggleRow>();
defineEmits(['click']);
const model = defineModel({
  type: Boolean,
  required: true,
});
</script>

<template>
  <div class="property-editor-toggle">
    <Button class="property-editor-toggle-button"
            :icon="model ? (icon ?? ['fas', 'xmark']) : undefined"
            :disabled="toValue(disabled)"
            @click="model = !model; $emit('click', $event);" />
  </div>
</template>

<style scoped>
.property-editor-toggle {
  display: flex;
  flex-direction: row-reverse;

  & .property-editor-toggle-button {
    aspect-ratio: 1;
  }
}
</style>