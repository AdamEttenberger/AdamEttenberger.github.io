<template>
  <section>
    <div class="message">
      <h1>
        <span>
          🚧
        </span>
        <span>Under Construction</span>
        <span>
          🚧
        </span>
      </h1>
      <h2><slot></slot></h2>
    </div>
  </section>
</template>

<style scoped>
section {
  & > .message {
    text-align: center;
    padding: 0 var(--size-padding-round);
    white-space: nowrap;
    background-color: var(--color-background-soft);
    border-radius: var(--size-border-radius);
  }
}
</style>
