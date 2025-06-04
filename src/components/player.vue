<script setup>
const props = defineProps({
  title: { type: String, required: true },
  frame: { type: String, required: true },
})
</script>

<template>
  <div class="player">
    <iframe class="renderer" :title="title" :src="frame"></iframe>
  </div>
</template>

<style scoped>
.player {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  border: 6px solid var(--color-divider);
  user-select: none;

  & > .renderer {
    aspect-ratio: var(--size-player-aspect);
    max-width: var(--size-player-max-width);
    max-height: var(--size-player-max-height);
    border: none;
    margin: 0;
    padding: 0;
    /**
     * The background needs to be black for some of the WebGL projects
     * which involve blending but either expect the canvas to have a
     * black background, or weren't setup correctly.
     */
    background-color: black;
  }
}
</style>
