<script setup lang="ts">
import { unref } from 'vue'
import Button from '@/components/button.vue'
import { ToggleOptions } from '@/util/property_editor/property_interfaces';

const options = defineProps<ToggleOptions>();
const model = defineModel({
  type: Boolean,
  required: true,
});
</script>

<template>
  <div class="toggle">
    <Button class="button"
            :icon="model ? (icon ?? ['fas', 'xmark']) : undefined"
            :disabled="unref(disabled)"
            @click="model = !model" />
  </div>
</template>

<style scoped>
.toggle {
  display: flex;
  flex-direction: row-reverse;
  height: 1lh;
}

.button {
  aspect-ratio: 1;
  width: auto;
}
</style>