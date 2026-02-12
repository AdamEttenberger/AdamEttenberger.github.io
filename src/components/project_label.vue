<script setup lang="ts">
import DateLabel from '@/components/date_label.vue'

defineProps({
  title: { type: String, required: true },
  date: { type: Date },
  lastmod: { default: null },
})
</script>

<template>
  <div class="label columns">
    <h2 class="title">{{ title }}</h2>
    <DateLabel v-if="date" :date="date" :lastmod="lastmod" />
  </div>
</template>

<style scoped>
.label {
  justify-content: space-between;
  align-items: center;

  & > .title {
    font-size: larger;
    font-weight: bold;
  }
}
</style>