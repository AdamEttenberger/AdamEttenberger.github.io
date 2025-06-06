<template>
  <div class="column">
    <slot></slot>
  </div>
</template>

<style scoped>
.column {
  display: flex;
  flex-direction: column;
  justify-self: center;
  text-align: justify;
  padding: 0 var(--size-padding-round);
  background-color: var(--color-background-soft);
  border-radius: var(--size-border-radius);
  margin: var(--size-padding-round) 0;
}
</style>
