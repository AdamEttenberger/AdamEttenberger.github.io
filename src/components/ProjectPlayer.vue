<script setup>
const props = defineProps({
  name: { type: String, required: true },
})
</script>

<template>
  <div class="message">
    <h1>🚧 Under Construction 🚧</h1>
    <h2>{{ name }}</h2>
    <h2><font-awesome-icon :icon="['fas', 'server']" /> <font-awesome-icon :icon="['fas', 'cloud-arrow-down']" /> <font-awesome-icon :icon="['fas', 'laptop-code']" /> <font-awesome-icon :icon="['fas', 'cloud-arrow-up']" /> <font-awesome-icon :icon="['fas', 'server']" /></h2>
    <h2>Page Coming Soon!</h2>
  </div>
</template>

<style scoped>
.message {
  flex: 1;
  justify-items: center;
  align-content: center;
  white-space: nowrap;
}
</style>