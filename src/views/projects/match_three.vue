<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Column from '@/components/column.vue'
import Player from '@/components/player.vue'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import UnderConstruction from '@/components/under_construction.vue'
import PropertyBuilder, { PropertyButtonBuilder, PropertyToggleBuilder } from '@/util/property_editor/property_builder'
import Section from '@/components/section.vue'
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'
import { useConsentStore } from '@/stores/consent'
const scorecard = useMatchThreeScorecardStore();
const { allow_saving_match_three_scorecard } = storeToRefs(useConsentStore());

const match_three_scorecard_properties = ref(new PropertyBuilder()
    .addProperty('consent.allow_saving_match_three_scorecard', new PropertyToggleBuilder().setLabel('Save Match-3 Personal Scorecard').setModel(allow_saving_match_three_scorecard))
    .addProperty('action.delete_match_three_scorecard', new PropertyButtonBuilder().setLabel('Delete personal scorecard').setText("Delete"))
    .build());

defineProps({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  lastmod: { type: Date },
  frame: { type: String, required: true },
})

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
        if (scorecard.scorecard) {
          frame.contentWindow.postMessage({'scorecard': JSON.stringify(scorecard.scorecard)}, window.location.origin);
        }
        break;
      case 'scorecard':
        scorecard.scorecard = JSON.parse(event.data.scorecard);
        break;
    }
  });
}

function onPropertyButtonClick(name) {
  switch (name) {
    case 'action.delete_match_three_scorecard':
      scorecard.scorecard = null;
      break;
  }
}
</script>

<template>
  <Player :title="title"
          :date="date"
          :lastmod="lastmod"
          :frame="frame"
          @load="bindGodotBridge" />
  <Column>
    <Section heading="Controls">
      <p>
        This game supports saving your personal scorecard to device local storage.
      </p>
      <br />
      <PropertyEditor :properties="match_three_scorecard_properties"
                      @property-click="onPropertyButtonClick" />
    </Section>
  </Column>
  <UnderConstruction />
</template>
