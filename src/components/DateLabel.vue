<script setup>
const props = defineProps({
  date: { type: Date, required: true },
})

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
  });
}
</script>

<template>
  <time class="date" :datetime="date">{{ formatDate(date) }}</time>
</template>
