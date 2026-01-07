<script setup>
import Button from '@/components/button.vue'

const emit = defineEmits([
  'property-changed', // (name: String, new_value: boolean)
]);

const props = defineProps({
  name: { type: String, required: true },
  disabled: { type: Boolean, required: true },
  icon: { type: Array, default: null },
});

const model = defineModel({
  type: Boolean,
  required: true,
  default: false,
  set(value) {
    emit('property-changed', props.name, value);
    return value;
  },
});
</script>

<template>
  <div class="toggle">
    <Button class="button"
            :icon="model ? (icon ?? ['fas', 'xmark']) : undefined"
            :disabled="disabled"
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