<script setup lang="ts">
defineProps<{
  name: string;
  cite_url?: string;
  cite_title?: string;
}>();
</script>

<template>
  <div class="quote">
    <blockquote :cite="cite_url">
      <p>&#x275D;<slot></slot>&#x275E;</p>
    </blockquote>
    <p class="name">&mdash;{{ name }}<cite v-if="cite_title">{{ cite_title }}</cite></p>
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
