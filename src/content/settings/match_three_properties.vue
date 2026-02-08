<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import {
  ButtonOptions,
  ToggleOptions,
} from '@/util/property_editor/property_types'
import { ThemeColor } from '@/composables/theme'
// Pinia Stores
import { useConsentStore } from '@/stores/consent'
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'

const consent = useConsentStore();
const match_three_scorecard = useMatchThreeScorecardStore();

const {
  allow_saving_match_three_scorecard
} = storeToRefs(consent);

const match_three_scorecard_properties = [
  new ToggleOptions('consent.allow_saving_match_three_scorecard', 'Save Match-3 Personal Scorecard', false).setModel(allow_saving_match_three_scorecard),
  new ButtonOptions('action.delete_match_three_scorecard', 'Delete Scorecard').setColor(ThemeColor.Error).setDisabled(computed(() => !match_three_scorecard?.scorecard)),
];

function onPropertyButtonClick(name) {
  switch (name) {
    case 'action.delete_match_three_scorecard':
      match_three_scorecard.scorecard = null;
      break;
  }
}
</script>

<template>
  <PropertyEditor :properties="match_three_scorecard_properties"
                  @property-click="onPropertyButtonClick" />
</template>