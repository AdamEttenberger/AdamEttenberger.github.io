<script setup lang="ts">
import DateUtil from '@/util/date'

defineProps({
  date: { required: true },
})
</script>

<template>
  <time class="date" :datetime="DateUtil.formatJSON(date)">{{ DateUtil.formatLongDate(date) }}</time>
</template>
