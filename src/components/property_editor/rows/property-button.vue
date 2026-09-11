<script setup lang="ts">
import { toValue } from 'vue'
import Button from '@/components/buttons/button.vue'
import { type IPropertyButtonRow } from '@/util/property_editor/property_interfaces'
defineProps<IPropertyButtonRow>();
defineEmits(['click']);
</script>

<template>
  <Button class="property-editor-button"
          :name
          :color="toValue(color)"
          :disabled="toValue(disabled)"
          :text="label"
          @click="$emit('click', $event)" />
</template>
