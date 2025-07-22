<script setup>
import DateText from '@/components/date_text.vue';

var props = defineProps({
  date: { required: true },
  lastmod: { default: null },
})
const show_lastmod = props.lastmod && (props.lastmod.getTime ? props.lastmod : props.lastmod.value)?.getTime() != props.date.getTime();
</script>

<template>
  <div class="date-label">
    <DateText class="date" :date="date" />
    <br v-if="show_lastmod" />
    <DateText v-if="show_lastmod"
              class="lastmod"
              :date="lastmod" />
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
