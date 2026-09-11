<script setup lang="ts">
import Divider from '@/components/divider.vue'
import { type IPropertyDividerRow } from '@/util/property_editor/property_interfaces'
defineProps<IPropertyDividerRow>();
</script>

<template>
  <Divider class="property-editor-divider"
           :heading="label"
           transparent />
</template>

<style scoped>
.property-editor-divider {
  padding: 0;

  & :deep(.heading) {
    font-size: medium;
  }
}
</style>