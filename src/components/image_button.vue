<script setup>
defineEmits(['click']);

const props = defineProps({
  src: { type: String, default: null },
  alt: { type: String, default: null },
  route: { type: String, default: null },
})
</script>

<template>
  <RouterLink v-if="route" class="image_button" :to="route" @click="$emit('click')">
    <div class="animator">
      <slot v-if="$slots.default"></slot>
      <img v-else :src="src" :alt="alt" />
    </div>
  </RouterLink>
  <button v-else class="image_button" @click="$emit('click')">
    <div class="animator">
      <slot v-if="$slots.default"></slot>
      <img v-else :src="src" :alt="alt" />
    </div>
  </button>
</template>

<style scoped>
.image_button {
  display: block;
  border: none;
  padding: 0;
  margin: 0;
}

.image_button,
.animator,
.animator > img {
  width: 100%;
  height: 100%;
}

.animator > :is(img, svg, :slotted(img), :slotted(svg)) {
  border-radius: var(--size-border-radius);
}

.animator {
  transition: padding var(--anim-transition);
  padding: 5%;
  &:hover {
    padding: 0;
  }
}
</style>
