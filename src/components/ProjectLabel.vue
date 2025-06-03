<script setup>
import DateLabel from './DateLabel.vue'

const props = defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
})
</script>

<template>
  <div class="label">
    <h3 class="title">{{ title }}</h3>
    <DateLabel :date="date" />
  </div>
</template>

<style scoped>
.label {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.4rem;

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
