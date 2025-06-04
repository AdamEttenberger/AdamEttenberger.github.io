<script setup>
const props = defineProps({
  date: { type: Date, required: true },
  lastmod: { type: Date },
})

function formatDate(date) {
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
  });
}
</script>

<template>
  <span>
    <time class="date" :datetime="date">{{ formatDate(date) }}</time>
    <time v-if="lastmod && lastmod.getTime() != date.getTime()" class="lastmod" :datetime="lastmod">{{ formatDate(lastmod) }}</time>
  </span>
</template>

<style scoped>
.lastmod {
  font-style: italic;
  &::before {
    content: " [edit: ";
  }
  &::after {
    content: "]";
  }
}
</style>
