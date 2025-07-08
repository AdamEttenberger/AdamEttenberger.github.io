<script setup>

const emit = defineEmits([
  'property-click',   // (name: String)
]);

const props = defineProps({
  name: { type: String, required: true },
  label: { type: String, required: true },
});
</script>

<template>
  <button :name="name" @click="$emit('property-click')">
    {{ label }}
  </button>
</template>

<style scoped>
button {
  transition: background-color var(--anim-transition);
  background-color: var(--color-background-button);
  &:hover {
    background-color: var(--color-background-button-hover);
  }
  &:active {
    background-color: var(--color-background-button-active);
  }
}
</style>
