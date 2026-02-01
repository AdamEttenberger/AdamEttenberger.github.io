<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import { IPropertyToggleOptions } from '@/util/property_editor/property_interfaces';

defineProps<IPropertyToggleOptions>();
const model = defineModel({
  type: Boolean,
  required: true,
});
</script>

<template>
  <div class="property-editor-toggle">
    <Button class="button"
            :icon="model ? (icon ?? ['fas', 'xmark']) : undefined"
            :disabled="disabled"
            @click="model = !model" />
  </div>
</template>

<style scoped>
.property-editor-toggle {
  display: flex;
  flex-direction: row-reverse;
  height: 1lh;

  & .button {
    aspect-ratio: 1;
    width: auto;
  }
}
</style>