<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import { IPropertyButtonOptions } from '@/util/property_editor/property_interfaces';

defineProps<IPropertyButtonOptions>();
</script>

<template>
  <Button class="property-editor-button"
          :name="name"
          :disabled="disabled"
          :text="label"
          @click="$emit('property-click')" />
</template>
