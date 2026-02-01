<script setup lang="ts">
defineProps({
  summary: { type: String, default: null },
});
const open = defineModel({
  type: Boolean,
  default: false,
});
</script>

<template>
  <details :open="open">
    <summary @click.prevent="open = !open">
      <slot v-if="!summary" name="summary"></slot>
      <span v-else>{{ summary }}</span>
    </summary>
    <slot></slot>
  </details>
</template>

<style scoped>
details:open > *:not(summary) {
  padding-left: 1rem;
}
summary{
  user-select: none;
  cursor: pointer;
  font-size: medium;
  background-color: var(--color-background-button);
  color: var(--color-text-button);
  border-radius: var(--size-border-radius);
  padding: 0 var(--size-padding-round);
  margin: var(--size-property-grid-gap) 0;
}
</style>