<script setup>
import DateLabel from './date_label.vue'

const props = defineProps({
  title: { type: String, required: true },
  date: { type: Date },
  lastmod: { type: Date },
  route: { type: String },
})
</script>

<template>
  <RouterLink v-if="route" class="label" :to="route">
    <h3 class="title">{{ title }}</h3>
    <h4 v-if="date" class="date"><DateLabel :date="date" :lastmod="lastmod" /></h4>
  </RouterLink>

  <div v-else class="label">
    <h3 class="title">{{ title }}</h3>
    <h4 v-if="date" class="date"><DateLabel :date="date" :lastmod="lastmod" /></h4>
  </div>
</template>

<style scoped>
.label {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  & > .title {
    font-size: 1.2rem;
    font-weight: bold;
  }

  & > .date {
    font-size: 1rem;
    font-style: italic;
  }
}
</style>
