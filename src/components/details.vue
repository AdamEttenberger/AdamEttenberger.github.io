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
  color: var(--color-text-heading);
}
</style>