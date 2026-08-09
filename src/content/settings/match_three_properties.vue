<script setup lang="ts">
import { storeToRefs } from 'pinia'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import {
  ButtonRow,
  ToggleRow,
} from '@/util/property_editor/property_types'
import { ThemeColor } from '@/composables/theme'
// Pinia Stores
import { useConsentStore } from '@/stores/consent'
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'
import usePropertyEditorModel, { type IUsePropertyEditorModel } from '@/composables/property_editor_model'
import { PropertyEmits, PropertyEmitsHandler } from '@/util/property_editor/property_interfaces'

const consent = useConsentStore();
const match_three_scorecard = useMatchThreeScorecardStore();

const {
  allow_saving_match_three_scorecard
} = storeToRefs(consent);

const editor = usePropertyEditorModel(
  [
    new ToggleRow('consent.allow_saving_match_three_scorecard', 'Save Scorecard', false).setModel(allow_saving_match_three_scorecard),
    new ButtonRow('action.delete_match_three_scorecard', 'Delete Scorecard').setColor(ThemeColor.Error).setDisabled(() => !match_three_scorecard.scorecard),
  ],
  new PropertyEmitsHandler((kind: PropertyEmits, name: string) => {
    switch (kind) {
      case PropertyEmits.Click:
        if (name === 'action.delete_match_three_scorecard') {
          match_three_scorecard.scorecard = null;
        }
        break;
    }
  })
)
</script>

<template>
  <div>
    <PropertyEditor v-bind:rows="editor.rows" v-model="editor.models" v-on="editor.onPropertyEmit" />
  </div>
</template>