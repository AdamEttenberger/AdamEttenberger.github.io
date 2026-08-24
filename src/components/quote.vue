<script setup lang="ts">
defineProps<{
  name: string;
  citeUrl?: string;
  citeTitle?: string;
}>();
</script>

<template>
  <div class="quote">
    <blockquote :cite="citeUrl">
      <p>&#x275D;<slot></slot>&#x275E;</p>
    </blockquote>
    <p class="name">&mdash;{{ name }}<cite v-if="citeTitle">{{ citeTitle }}</cite></p>
  </div>
</template>

<style scoped>
cite::before {
  content: ', '
}
.quote {
  text-align: center;
}

.name {
  text-align: right;
  font-size: smaller;
  font-style: italic;
}
</style>
