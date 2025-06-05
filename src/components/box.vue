<template>
  <div class="box">
    <slot></slot>
  </div>
</template>

<style scoped>
div.box {
  flex: 1;
  justify-items: stretch;
  align-content: center;
  padding: 0 var(--size-padding-round);
  background-color: var(--color-background-soft);
  border-radius: var(--size-border-radius);
  margin: var(--size-padding-round) 0;
}
</style>
