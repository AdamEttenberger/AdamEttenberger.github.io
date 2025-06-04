<template>
  <section>
    <div class="message">
      <h1><font-awesome-icon :icon="['fas', 'server']" /> <font-awesome-icon :icon="['fas', 'cloud-arrow-down']" /> 🚧 Under Construction 🚧 <font-awesome-icon :icon="['fas', 'cloud-arrow-up']" /> <font-awesome-icon :icon="['fas', 'server']" /></h1>
      <h2><slot></slot></h2>
    </div>
  </section>
</template>

<style scoped>
section {
  flex: 1;
  justify-items: stretch;
  align-content: center;
  & > .message {
    justify-items: center;
    padding: 0 25px;
    white-space: nowrap;
    background-color: var(--color-background-soft);
    border-radius: 25px;
  }
}
</style>
