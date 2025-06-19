<script setup>
import { ref } from 'vue';
import ProjectLabel from './project_label.vue'

const props = defineProps({
  title: { type: String, required: true },
  date: { type: Date, default: null },
  lastmod: { type: Date, default: null },
  frame: { type: String, required: true },
  aspect: { type: String, default: "4 / 3" },
  paused: { type: Boolean, default: true },
})

const requested_play = ref(false);
</script>

<template>
  <div class="column-inset player">
    <div class="framed">
      <button v-if="!requested_play && paused" class="play-button" @click.once="requested_play = true"><font-awesome-icon :icon="['fas', 'circle-play']" /></button>
      <iframe v-else class="renderer" :title="title" :src="frame"></iframe>
    </div>
    <ProjectLabel class="label" :title="title" :date="date" :lastmod="lastmod" />
  </div>
</template>

<style scoped>
.player {
  display: flex;
  flex-direction: column;
  user-select: none;

  /**
   * Mostly mitigates an issue where there's a small inexplicable gap between
   * the lower edge of the iframe and the lower border.
   */
  & > .framed {
    display: flex;
  }

  & .play-button,
  & .renderer {
    aspect-ratio: v-bind(aspect);
    width: 100%;
  }

  & .play-button {
    font-size: 4rem;
    color: var(--color-link);
    transition-property: background-color, color;
    transition-duration: var(--anim-transition-duration);
    transition-timing-function: var(--anim-transition-timing-function);
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

  & .renderer {
    /**
     * The background needs to be black for some of the WebGL projects
     * which involve blending but either expect the canvas to have a
     * black background, or weren't setup correctly.
     */
    background-color: black;
  }
}
</style>
