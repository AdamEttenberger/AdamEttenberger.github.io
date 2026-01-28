<script setup lang="ts">
defineProps({
  heading: { type: String, default: "Terms" },
})
</script>

<template>
  <div>
    <h3 v-if="heading">{{ heading }}</h3>
    <dl>
      <slot></slot>
    </dl>
  </div>
</template>

<style scoped>
dl {
  display: grid;
  grid-template-columns: max-content auto;
}
</style>
