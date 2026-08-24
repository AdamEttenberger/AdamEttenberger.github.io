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
  youtubeId: string;
  title: Array<string>;
  role: Array<string>;
}>();

function onYouTubeConsentGiven() {
  allow_embedded_youtube_videos.value = true;
}
</script>

<template>
  <div class="youtube-item">
    <Layer class="responsive-container" transparent>
      <div class="player-wrapper">
        <iframe v-if="allow_embedded_youtube_videos"
                class="player"
                :src="`https://www.youtube-nocookie.com/embed/${youtubeId}`"
                title="YouTube video player"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerpolicy="strict-origin-when-cross-origin"
                allowfullscreen>
        </iframe>
        <div v-if="!allow_embedded_youtube_videos" class="player">
          <Layer class="consent-overlay" :color="ThemeColor.Secondary">
            <div class="message">
              <font-awesome-icon class="yt-icon" :icon="['fab', 'youtube']" />
              <p class="message-title">Content Blocked Due to Privacy Settings</p>
              <p class="message-subtitle">Allow embedded YouTube videos?</p>
            </div>
            <div class="buttons">
              <Button class="button" text="Accept" @click="onYouTubeConsentGiven" :color="ThemeColor.Accent" />
              <Button class="button" text="Watch on YouTube" :to="`https://www.youtube.com/watch/?v=${youtubeId}`" :color="ThemeColor.Secondary">
                Watch on YouTube&nbsp;<font-awesome-icon class="ext-icon" :icon="['fas', 'up-right-from-square']" />
              </Button>
              <Button class="button" text="Settings" to="/settings" :color="ThemeColor.Primary" />
            </div>
          </Layer>
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

        & > .consent-overlay {
          grid-area: 1 / 1 / 2 / 2;
          width: 100%;
          height: 100%;
          border-radius: 0;
          justify-content: space-around;
          align-items: center;
          gap: var(--padding-small);

          & > .message {
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;

            & > .yt-icon {
              font-size: 4rem;
            }
            & > .message-title {
              font-size: larger;
              font-weight: bold;
            }
            & > .message-subtitle {
              font-size: larger;
            }
          }

          & > .buttons {
            display: flex;
            flex-direction: row;
            gap: var(--padding-normal);
          }
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