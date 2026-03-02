<script setup lang="ts">
import DateLabel from '@/components/date_label.vue'
import { type DateLike } from '@/util/date'
defineProps<{
  title: string;
  date?: DateLike;
  lastmod?: DateLike;
}>();
</script>

<template>
  <div class="label columns">
    <h2 class="title">{{ title }}</h2>
    <DateLabel v-if="date" :date :lastmod />
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