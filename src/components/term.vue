<script setup lang="ts">
defineProps({
  term: { type: String, required: true },
  details: { type: String, default: null },
})
</script>

<template>
  <dt>{{ term }}</dt>

  <dd v-if="$slots.default"><slot></slot></dd>
  <dd v-else-if="details">{{ details }}</dd>
</template>

<style scoped>
dt,
dd {
  padding-inline-start: var(--size-list-indentation);
}

dt {
  grid-column: 1 / 2;
  font-weight: bold;
  color: var(--color-text-heading);
}

dd {
  grid-column: 2 / 3;
}
</style>