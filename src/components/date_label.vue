<script setup lang="ts">
import DateText from '@/components/date_text.vue';
import { date_from, date_same_month, type DateLike } from '@/util/date'
import { computed } from 'vue';
const props = defineProps<{
  date: DateLike,
  lastmod?: DateLike,
}>();

const current_date = computed<Date>(() => date_from(props.date));
const current_lastmod = computed<undefined|Date>(() => {
  const lastmod_date = props.lastmod ? date_from(props.lastmod) : undefined;
  return lastmod_date && !date_same_month(current_date.value, lastmod_date)
      ? lastmod_date
      : undefined;
});
</script>

<template>
  <div class="date-label">
    <DateText class="date" :date="current_date" />
    <br v-if="current_lastmod" />
    <DateText v-if="current_lastmod"
              class="lastmod"
              :date="current_lastmod" />
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
