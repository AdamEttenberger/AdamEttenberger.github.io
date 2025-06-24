<script setup>
defineProps({
  src: { type: String, default: null },
  alt: { type: String, default: null },
  caption: { type: String, default: null },
});
</script>

<template>
  <figure>
    <div class="framed">
      <img v-if="src" :src="src" :alt="alt" />
      <slot v-else></slot>
    </div>
    <figcaption v-if="$slots.caption"><slot name="caption"></slot></figcaption>
    <figcaption v-else-if="caption">{{ caption  }}</figcaption>
    <figcaption v-else-if="alt">{{ alt }}</figcaption>
  </figure>
</template>

<style scoped>
figure,
figure > .framed {
  display: flex;
  flex-direction: column;
}
figcaption {
  text-align: center;
  font-style: italic;
  font-size: small;
}
</style>