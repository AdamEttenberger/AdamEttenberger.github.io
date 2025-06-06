<script setup>
import { ref } from 'vue';

const props = defineProps({
  title: { type: String, required: true },
  frame: { type: String, required: true },
  aspect: { type: String, default: "4 / 3" },
  paused: { type: Boolean, default: true },
})

const requested_play = ref(false);
</script>

<template>
  <div v-if="!requested_play && paused" class="player">
    <button class="play-button" @click.once="requested_play = true"><font-awesome-icon :icon="['fas', 'circle-play']" /></button>
  </div>
  <div v-else class="player">
    <iframe class="renderer" :title="title" :src="frame"></iframe>
  </div>
</template>

<style scoped>
.player {
  display: grid;
  grid-template-columns: 100%;
  grid-template-rows: auto;
  aspect-ratio: v-bind(aspect);

  & > * {
    grid-row: 1;
    grid-column: 1;
    place-self: stretch;
    border: none;
    margin: 0;
    padding: 0;
  }

  & > button {
    font-size: 4rem;
    color: var(--color-link);
    transition: color var(--anim-transition);
    background-color: #000;
    cursor: pointer;
    &:hover {
      color: var(--color-link-hover);
      background-color: #151515;
    }
    &:active {
      color: var(--color-link-active);
      background-color: #232323;
    }
  }

  border: 6px solid var(--color-divider);
  user-select: none;

  & > .renderer {
    aspect-ratio: v-bind(aspect);
    /**
     * The background needs to be black for some of the WebGL projects
     * which involve blending but either expect the canvas to have a
     * black background, or weren't setup correctly.
     */
    background-color: black;
  }
}
</style>
