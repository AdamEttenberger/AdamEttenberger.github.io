<script setup lang="ts">
withDefaults(defineProps<{
  heading: string;
}>(), {
  heading: "Terms"
});
</script>

<template>
  <div>
    <h3 v-if="$slots.heading"><slot name="heading"></slot></h3>
    <h3 v-else-if="heading">{{ heading }}</h3>
    <dl>
      <slot></slot>
    </dl>
  </div>
</template>

<style scoped>
dl {
  display: grid;
  grid-template-columns: max-content auto;
  gap: var(--padding-small);
}
</style>
