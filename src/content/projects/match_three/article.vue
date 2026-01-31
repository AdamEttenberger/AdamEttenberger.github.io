<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Column from '@/components/column.vue'
import Player from '@/components/player.vue'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import UnderConstruction from '@/components/under_construction.vue'
import Section from '@/components/section.vue'
import {
  ButtonOptions,
  ToggleOptions,
} from '@/util/property_editor/property_types'
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'
import { useConsentStore } from '@/stores/consent'
import { IProjectInfo } from '@/types/project_types'

defineProps<IProjectInfo>();

const gamedata = useMatchThreeScorecardStore();
const { allow_saving_match_three_scorecard } = storeToRefs(useConsentStore());

const editor_properties = [
  new ToggleOptions('consent.allow_saving_match_three_scorecard', 'Save Match-3 Personal Scorecard', false).setModel(allow_saving_match_three_scorecard),
  new ButtonOptions('action.delete_match_three_scorecard', 'Delete Scorecard').setClasses(['delete']).setDisabled(computed(() => !gamedata?.scorecard)),
];

onMounted(() => {
  // Uninstall service workers to fix caching issue when re-visiting the page
  // after the game had been updated on the server.
  navigator.serviceWorker.getRegistrations().then(registrations => registrations.forEach(item => item.unregister()));
});

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

function onPropertyButtonClick(name) {
  switch (name) {
    case 'action.delete_match_three_scorecard':
      gamedata.scorecard = null;
      break;
  }
}
</script>

<template>
  <article>
    <Player :title="title"
            :date="date"
            :lastmod="lastmod"
            frame="/library/projects/tile_match/tile_match.html"
            @load="bindGodotBridge" />
    <Column>
      <Section heading="Controls">
        <p>
          This game supports saving your personal scorecard to device local storage.
        </p>
        <br />
        <PropertyEditor :properties="editor_properties"
                        @property-click="onPropertyButtonClick" />
      </Section>
    </Column>
    <UnderConstruction />
  </article>
</template>
