<script setup lang="ts">
defineProps<{
  term: string;
  details?: string;
}>();
</script>

<template>
  <dt>{{ term }}</dt>

  <dd v-if="$slots.default"><slot></slot></dd>
  <dd v-else-if="details">{{ details }}</dd>
</template>

<style scoped>
dt,
dd {
  padding-inline-start: var(--padding-xxlarge);
}

dt {
  grid-column: 1 / 2;
  font-weight: bolder;
  color: var(--theme-text-bold);
}

dd {
  grid-column: 2 / 3;
}
</style>