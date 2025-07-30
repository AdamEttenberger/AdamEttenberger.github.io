<script setup>
defineProps({
  summary: { type: String, default: null },
});
</script>

<template>
  <details>
    <summary v-if="$slots.summary"><slot name="summary"></slot></summary>
    <summary v-else>{{ summary }}</summary>
    <slot></slot>
  </details>
</template>

<style scoped>
details:open > *:not(summary) {
  padding-left: 1rem;
}
summary{
  cursor: pointer;
  font-size: medium;
  background-color: var(--color-background-button);
  color: var(--color-text-button);
  border-radius: var(--size-border-radius);
  padding: 0 var(--size-padding-round);
  margin: var(--size-property-grid-gap) 0;
}
</style>