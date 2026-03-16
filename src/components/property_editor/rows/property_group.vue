<script setup lang="ts">
import { toValue } from 'vue'
import Details from '@/components/details.vue'
import { type IPropertyGroupRow } from '@/util/property_editor/property_interfaces'
defineProps<IPropertyGroupRow>();
const model = defineModel({
  type: Boolean,
  required: true,
});
</script>

<template>
  <Details class="property-editor-group"
           :summary="label"
           :disabled="toValue(disabled)"
           thin
           v-model="model">
  </Details>
</template>

<style scoped>
.property-editor-group {
  padding: var(--padding-xxsmall) var(--padding-large);
}
</style>