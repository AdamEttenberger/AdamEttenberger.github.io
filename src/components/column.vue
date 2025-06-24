<template>
  <div class="column">
    <slot></slot>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  text-align: justify;
  padding: var(--size-column-padding);
  background-color: var(--color-background-soft);
  border-radius: var(--size-border-radius);
  margin: var(--size-padding-round) 0;
}
</style>
