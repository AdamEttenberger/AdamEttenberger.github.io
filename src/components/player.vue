<script setup lang="ts">
import { useTemplateRef, type ShallowRef } from 'vue';
import Figure from '@/components/figure.vue'
import ProjectLabel from '@/components/project_label.vue'
import { PlayerState } from '@/types/player_state'
import Button from '@/components/buttons/button.vue'
import { type DateLike } from '@/util/date'
import { FrameContainerSymbol } from '@/composables/post_message'

const frame_key: string = crypto.randomUUID();
const inner_frame: Readonly<ShallowRef<HTMLIFrameElement | null>> = useTemplateRef<HTMLIFrameElement>('inner_frame');

/**
 * Emits `target_frame: HTMLIFrameElement`
 */
const emit = defineEmits<{
  load: [source: HTMLIFrameElement, frame_key: string],
}>();

withDefaults(defineProps<{
  title: string;
  frame: string;
  aspect?: number;
  date?: DateLike;
  lastmod?: DateLike;
}>(), {
  aspect: (4 / 3),
});

const state = defineModel<PlayerState>('state', { default: PlayerState.Empty });

defineExpose({
  [FrameContainerSymbol]: frame_key,
  inner_frame,
});

function onPlayerLoaded() {
  if (!inner_frame.value) {
    return;
  }
  emit('load', inner_frame.value, frame_key);
}
</script>

<template>
  <Figure class="player">
    <div class="responsive-frame">
      <Button v-if="state != PlayerState.Playing"
              class="play-button"
              @click.once="state = PlayerState.Playing"
              :icon="['fas', 'circle-play']" />
      <iframe v-if="state !== PlayerState.Empty"
              ref="inner_frame"
              class="renderer"
              :title="title"
              :src="frame"
              @load="onPlayerLoaded()">
      </iframe>
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
