<script setup lang="ts">
import DateLabel from '@/components/date_label.vue'

defineProps({
  title: { type: String, required: true },
  date: { type: Date },
  lastmod: { default: null },
  route: { type: String },
})
</script>

<template>
  <RouterLink v-if="route" class="label" :to="route">
    <h3 class="title">{{ title }}</h3>
    <DateLabel v-if="date" :date="date" :lastmod="lastmod" />
  </RouterLink>

  <div v-else class="label">
    <h3 class="title">{{ title }}</h3>
    <DateLabel v-if="date" :date="date" :lastmod="lastmod" />
  </div>
</template>

<style scoped>
.label {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  color: var(--color-text-heading);

  & > .title {
    font-size: 1.2rem;
    font-weight: bold;
    text-align: left;
  }
}
</style>
