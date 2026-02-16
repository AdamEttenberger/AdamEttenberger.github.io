<script setup lang="ts">
import { IPropertyLabelOptions } from '@/util/property_editor/property_interfaces';
defineProps<IPropertyLabelOptions>();
</script>

<template>
  <div class="property-editor-label">
    <div>{{ modelValue }}</div>
  </div>
</template>

<style scoped>
.property-editor-label {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>