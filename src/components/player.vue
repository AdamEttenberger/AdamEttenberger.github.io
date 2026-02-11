<script setup lang="ts">
import { PropType, useTemplateRef } from 'vue';
import Figure from '@/components/figure.vue'
import ProjectLabel from '@/components/project_label.vue'
import { PlayerState } from '@/types/player_state'
import Button from '@/components/buttons/button.vue'

const inner_frame = useTemplateRef('inner_frame');

/**
 * Emits `target_frame: HTMLIFrameElement`
 */
defineEmits(['load']);

defineProps({
  title: { type: String, required: true },
  date: { type: Date, default: null },
  lastmod: { type: Date, default: null },
  frame: { type: String, required: true },
  aspect: { type: Number, default: Number(4 / 3) },
})

const state = defineModel('state', {
  type: [String, PlayerState] as PropType<String | PlayerState>,
  default: PlayerState.Empty,
});

defineExpose({
  inner_frame,
});
</script>

<template>
  <Figure class="player">
    <div class="responsive-frame">
      <Button v-if="state != PlayerState.Playing"
              class="play-button"
              @click.once="state = PlayerState.Playing"
              :icon="['fas', 'circle-play']" />
      <iframe v-if="state != PlayerState.Empty" ref="inner_frame" class="renderer" :title="title" :src="frame" @load="$emit('load', inner_frame)"></iframe>
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

  & .responsive-frame {
    display: flex;
    aspect-ratio: v-bind(aspect);

    & .play-button {
      cursor: pointer;
      font-size: 4rem;

      display: flex;
      flex: 1;
    }

    & iframe.renderer {
      user-select: none;
      flex: 1;
      border-radius: var(--size-border-radius);
    }
  }
}

/**
 * Forces the aspect ratio to 4:3 to try and mitigate an issue with
 * responsive layout causing the <iframe> inside the player to enter
 * overflow.
 */
.responsive-frame {
  /**
   * It's important that the `height` is rounded-up to the next-nearest whole pixel
   * to avoid unexpected overflow with responsive layout. Here `padding-bottom`
   * is acting similar to `aspect-ratio`, indirectly defining `height` relative to `width`.
   * Unlike `aspect-ratio`, `padding-bottom` allows pixel rounding operations.
   * e.g., The equivalent `aspect-ratio: 4 / 3` is the inverse (4 / 3) => (3 / 4) ~ 0.75 ~ 75%.
   */
  padding-bottom: round(up, calc(100% / v-bind(aspect)), 1px);

  position: relative;
  & > * {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
}
</style>
