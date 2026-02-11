<script setup lang="ts">
import { onUnmounted } from 'vue'
import Layer from '@/components/layer.vue'
import Note from '@/components/note.vue'
import MatchThreeProperties from '@/content/settings/match_three_properties.vue'
import Player from '@/components/player.vue'
import Section from '@/components/section.vue'
import { ThemeColor } from '@/composables/theme'
import { IProjectInfo } from '@/types/project_types'
// Pinia Stores
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'

defineProps<IProjectInfo>();

const gamedata = useMatchThreeScorecardStore();

onUnmounted(() => {
  // Uninstall service workers when leaving, this prevents the browser from caching
  // the last version of the game served when revisiting the page.
  navigator.serviceWorker.getRegistrations().then(registrations => registrations.forEach(item => item.unregister()));
})

function bindGodotBridge(frame) {
  addEventListener('message', (event) => {
    if (event.origin !== window.location.origin) {
      return;
    }
    switch (event.data.type) {
      case 'ready':
        if (gamedata.scorecard) {
          frame.contentWindow.postMessage({'scorecard': JSON.stringify(gamedata.scorecard)}, window.location.origin);
        }
        break;
      case 'scorecard':
        gamedata.scorecard = JSON.parse(event.data.scorecard);
        break;
    }
  });
}
</script>

<template>
  <article>
    <Player :title="title"
            :date="date"
            :lastmod="lastmod"
            frame="/library/projects/tile_match/tile_match.html"
            @load="bindGodotBridge" />
    <Layer>
      <Section heading="Controls">
        <p>
          This game supports saving your personal scorecard to device local storage.
        </p>
        <MatchThreeProperties />
      </Section>
    </Layer>
    <Note :color="ThemeColor.Todo">
      This article is currently being finalized, expect an update very soon.
    </Note>
  </article>
</template>
