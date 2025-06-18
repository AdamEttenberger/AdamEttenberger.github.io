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
  <div class="date-label">
    <time class="date" :datetime="date">{{ formatDate(date) }}</time>
    <br/>
    <time v-if="lastmod && lastmod.getTime() != date.getTime()" class="lastmod" :datetime="lastmod">{{ formatDate(lastmod) }}</time>
  </div>
</template>

<style scoped>
.date-label {
  font-size: 1rem;
  font-style: italic;
  text-align: right;

  & > .lastmod {
    &::before {
      content: " [edit: ";
    }
    &::after {
      content: "]";
    }
  }
}
</style>
