<script setup>
import Box from './box.vue'
</script>

<template>
  <div class="divider">
    <h2 class="heading">
      <slot></slot>
    </h2>
  </div>
</template>

<style scoped>
.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1lh 0;

  & .heading {
    border: 3px solid var(--color-divider);
    padding: var(--size-padding-round) calc(var(--size-padding-round) * 2);
    border-radius: var(--size-border-radius);
  }

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 3px solid var(--color-divider);
  }
}
</style>