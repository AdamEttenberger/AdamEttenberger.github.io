<script setup lang="ts">
import { type IPropertyLabelRow } from '@/util/property_editor/property_interfaces'
defineProps<IPropertyLabelRow>();
const model = defineModel({ required: true });
</script>

<template>
  <div class="property-editor-label">
    <div>{{ model }}</div>
  </div>
</template>

<style scoped>
.property-editor-label {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
</style>