<script setup>
const props = defineProps({
  to: { type: String, required: true },
  show_ext: { type: Boolean, default: true }
})
</script>

<template>
  <a v-if="show_ext" :href="to" target="_blank" rel="noopener noreferrer">
    <slot></slot>&nbsp;<font-awesome-icon class="ext-icon" :icon="['fas', 'up-right-from-square']" />
  </a>
  <a v-else :href="to" target="_blank" rel="noopener noreferrer">
    <slot></slot>
  </a>
</template>

<style scoped>
.ext-icon {
  font-size: small;
}
</style>
