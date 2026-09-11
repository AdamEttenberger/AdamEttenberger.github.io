<script setup lang="ts">
import { date_formatJSON, date_formatLongDate, type DateLike } from '@/util/date'

defineProps<{
  date: DateLike;
}>();
</script>

<template>
  <time class="date" :datetime="date_formatJSON(date)">{{ date_formatLongDate(date) }}</time>
</template>
