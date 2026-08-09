<script setup lang="ts">
import { storeToRefs } from 'pinia'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
// Pinia Stores
import { useConsentStore } from '@/stores/consent'
import {
  ToggleRow,
} from '@/util/property_editor/property_types'
import usePropertyEditorModel from '@/composables/property_editor_model';

const consent = useConsentStore();

const {
  allow_hiding_consent_banner,
  allow_saving_user_preferences,
  allow_saving_match_three_scorecard
} = storeToRefs(consent);

const editor = usePropertyEditorModel(
  [
    new ToggleRow('consent.allow_hiding_consent_banner', 'Hide consent banner', false).setModel(allow_hiding_consent_banner),
    new ToggleRow('consent.allow_saving_user_preferences', 'Save User Preferences', false).setModel(allow_saving_user_preferences),
    new ToggleRow('consent.allow_saving_match_three_scorecard', 'Save Match-3 Scorecard', false).setModel(allow_saving_match_three_scorecard),
  ]
);
</script>

<template>
  <div>
    <PropertyEditor v-bind:rows="editor.rows" v-model="editor.models" v-on="editor.onPropertyEmit" />
  </div>
</template>