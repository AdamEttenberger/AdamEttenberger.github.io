<script setup>
import { ref } from 'vue';
import Figure from '@/components/figure.vue'
import ProjectLabel from '@/components/project_label.vue'

/**
 * Emits `target_frame: HTMLIFrameElement`
 */
defineEmits(['load']);

const props = defineProps({
  title: { type: String, required: true },
  date: { type: Date, default: null },
  lastmod: { type: Date, default: null },
  frame: { type: String, required: true },
  aspect: { type: Number, default: Number(4 / 3) },
  paused: { type: Boolean, default: true },
})

const player_frame = ref();
const requested_play = ref(false);
</script>

<template>
  <Figure class="player">
    <div class="responsive-frame">
      <button v-if="!requested_play && paused" class="play-button" @click.once="requested_play = true"><font-awesome-icon :icon="['fas', 'circle-play']" /></button>
      <iframe v-else ref="player_frame" class="renderer" :title="title" :src="frame" @load="$emit('load', player_frame)"></iframe>
    </div>
    <template v-slot:caption>
      <ProjectLabel :title="title" :date="date" :lastmod="lastmod" />
    </template>
  </Figure>
</template>

<style scoped>
.player {
  display: flex;
  flex-direction: column;
}

.responsive-frame {
  display: block;
  position: relative;
  width: 100%;
  height: 0;
  /**
   * It's important that the `height` is rounded-up to the next-nearest whole pixel
   * to avoid unexpected overflow with responsive layout. Here `padding-bottom`
   * is acting similar to `aspect-ratio`, indirectly defining `height` relative to `width`.
   * Unlike `aspect-ratio`, `padding-bottom` allows pixel rounding operations.
   * e.g., The equivalent `aspect-ratio: 4 / 3` is the inverse (4 / 3) => (3 / 4) ~ 0.75 ~ 75%.
   */
  padding-bottom: round(up, calc(100% / v-bind(aspect)), 1px);
}
.responsive-frame > button.play-button,
.responsive-frame > iframe.renderer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

button.play-button {
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

iframe.renderer {
  /**
   * The background needs to be black for some of the WebGL projects
   * which involve blending but either expect the canvas to have a
   * black background, or weren't setup correctly.
   */
  background-color: black;
  /**
   * Prevent selecting the canvas frame.
   */
  user-select: none;
}
</style>
