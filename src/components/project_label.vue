<script setup>
import DateLabel from './date_label.vue'

const props = defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
})
</script>

<template>
  <div class="label">
    <h3 class="title">{{ title }}</h3>
    <h4 class="date"><DateLabel :date="date" :lastmod="lastmod" /></h4>
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
    text-align: left;
  }

  & > .date {
    font-size: 1rem;
    font-style: italic;
    text-align: right;
  }
}
</style>
