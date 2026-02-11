<script setup lang="ts">
import { unref } from 'vue'
import Details from '@/components/details.vue'
import { IPropertyGroupOptions } from '@/util/property_editor/property_interfaces';

defineProps<IPropertyGroupOptions>();
const model = defineModel({
  type: Boolean,
  required: true,
});
</script>

<template>
  <Details class="property-editor-group"
           :summary="label"
           :disabled="unref(disabled)"
           :thin="true"
           v-model="model">
  </Details>
</template>

<style scoped>
.property-editor-group {
  padding: var(--padding-xxsmall) var(--padding-large);
}
</style>