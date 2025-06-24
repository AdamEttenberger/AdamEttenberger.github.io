<script setup>
import Divider from '@/components/divider.vue'

defineProps({
  heading: { type: String, default: null },
});
</script>

<template>
  <section>
    <Divider>
      <slot v-if="$slots.heading" name="heading"></slot>
      <div v-else-if="heading">{{ heading }}</div>
    </Divider>
    <slot></slot>
  </section>
</template>

<style scoped>
section {
  display: flex;
  flex-direction: column;
}
</style>
