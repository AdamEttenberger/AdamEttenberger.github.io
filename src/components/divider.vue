<script setup lang="ts">
defineProps({
  heading: { type: String, default: null },
});
</script>

<template>
  <div class="divider">
    <h2 v-if="$slots.default" class="heading"><slot></slot></h2>
    <h2 v-else-if="heading" class="heading">{{ heading }}</h2>
  </div>
</template>

<style scoped>
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  padding: var(--padding-normal) var(--padding-xxlarge);

  & .heading {
    border: 3px solid var(--color-divider);
    border-radius: var(--size-border-radius);
    padding: 0 var(--padding-xxlarge);
  }

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 3px solid var(--color-divider);
  }
}
</style>