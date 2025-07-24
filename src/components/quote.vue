<script setup>
defineProps({
  name: { type: String, required: true },
  cite_url: { type: String, default: null },
  cite_title: { type: String, default: null },
})
</script>

<template>
  <div class="quote">
    <blockquote :cite="cite_url">
      <p>&#x275D;<slot></slot>&#x275E;</p>
    </blockquote>
    <p class="name">&mdash;{{ name }} <cite v-if="cite_title">{{ cite_title }}</cite></p>
  </div>
</template>

<style scoped>
.quote {
  text-align: center;
}

.name {
  text-align: right;
  font-size: smaller;
  font-style: italic;
}
</style>
