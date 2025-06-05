<script setup>
const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, required: true },
  route: { type: String, required: true },
})
</script>

<template>
  <RouterLink class="image_button" :to="route">
    <img :src="src" :alt="alt" />
  </RouterLink>
</template>

<style scoped>
.image_button {
  display: block;
  margin: 0;
  transition: padding var(--anim-transition);
  padding: 5%;
  &:hover {
    padding: 0;
  }

  & > img {
    border-radius: var(--size-border-radius);
    width: 100%;
    height: 100%;
  }
}
</style>
