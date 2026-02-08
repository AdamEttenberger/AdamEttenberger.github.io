<script setup lang="ts">
import Divider from '@/components/divider.vue'
import { IPropertyDividerOptions } from '@/util/property_editor/property_interfaces';
defineProps<IPropertyDividerOptions>();
</script>

<template>
  <Divider class="property-editor-divider"
           :heading="label" />
</template>

<style scoped>
.property-editor-divider {
  padding: 0;

  & :deep(.heading) {
    border: none;
    font-size: medium;
  }
}
</style>