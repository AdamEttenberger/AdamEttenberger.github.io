<template>
  <div class="progress-container">
    <font-awesome-icon class="fa-icon spinner" :icon="['fas', 'compass']" />
  </div>
</template>

<style scoped>
@keyframes spinner {
  from { rotate: 0deg; }
  to { rotate: 360deg; }
}
.progress-container {
  display: flex;
  flex-direction: column;
  align-items: center;

  background: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 10px,
      var(--theme-background-shade) 10px,
      var(--theme-background-shade) 20px
  );

  & .spinner {
    font-size: 5rem;
    padding: var(--padding-normal);
    animation: 2s infinite spinner;
    background-color: var(--theme-background-shade);
    clip-path: circle(50%);
  }
}
</style>