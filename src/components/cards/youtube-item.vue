<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Button from '@/components/buttons/button.vue'
import Divider from '@/components/divider.vue'
import Layer from '@/components/layer.vue'
import { ThemeColor, type IThemeProps } from '@/composables/theme'

import { useConsentStore } from '@/stores/consent'
const consent = useConsentStore();
const {
  allow_embedded_youtube_videos,
} = storeToRefs(consent);

defineProps<IThemeProps & {
  youtube_id: string;
  title: Array<string>;
  role: Array<string>;
}>();
</script>

<template>
  <div class="youtube-item">
    <Layer class="responsive-container" transparent>
      <div class="player-wrapper">
        <iframe v-if="allow_embedded_youtube_videos"
                class="player"
                :src="`https://www.youtube-nocookie.com/embed/${youtube_id}`"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
        </iframe>
        <div v-if="!allow_embedded_youtube_videos" class="player">
          <Button class="play-button"
                  :to="`https://www.youtube.com/watch/?v=${youtube_id}`"
                  :icon="['fas', 'up-right-from-square']"
                  :color="ThemeColor.Secondary"
                  alt="Watch on YouTube" />
          <div class="play-description">Watch on YouTube</div>
        </div>
      </div>
      <Layer class="info">
        <div class="title">
          <div v-for="item in title"><b>{{ item }}</b></div>
        </div>
        <Divider class="divider" />
        <div class="role">
          <div v-for="item in role">{{ item }}</div>
        </div>
      </Layer>
    </Layer>
  </div>
</template>

<style scoped>
.youtube-item {
  container: footer / inline-size;
  border-radius: var(--size-border-radius);

  & > .responsive-container {
    display: flex;
    flex-direction: row;
    padding: 0;
    overflow: hidden;
    gap: 0;

    & > .player-wrapper {
      flex: 1;

      & > .player {
        display: grid;
        aspect-ratio: 16/9;

        & > .play-button {
          grid-area: 1 / 1 / 2 / 2;
          border-radius: 0;
          font-size: 4rem;
        }

        & > .play-description {
          grid-area: 1 / 1 / 2 / 2;
          font-size: 2rem;
          pointer-events: none;
          align-self: start;
          justify-self: center;
        }
      }
    }

    & > .info {
      flex-shrink: 0;
      width: var(--component-project-item-size);
      gap: 0;
      text-align: center;
      border-radius: 0 var(--size-border-radius) var(--size-border-radius) 0;

      & > .title,
      & > .role {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }

  @container (max-width: 35rem) {
    .responsive-container {
      flex-direction: column;

      & > .info {
        display: flex;
        flex-direction: row;
        justify-content: space-around;
        width: 100%;
        border-radius: 0 0 var(--size-border-radius) var(--size-border-radius);

        & > .divider {
          display: none;
        }
      }
    }
  }
}


</style>