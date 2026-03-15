<script setup lang="ts">
import { storeToRefs } from 'pinia'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import {
  ComboBoxRow,
  ToggleRow,
} from '@/util/property_editor/property_types'
// Pinia Stores
import { useConsentStore } from '@/stores/consent'
import { useUserPreferencesStore } from '@/stores/user_preferences'
import usePropertyEditorModel from '@/composables/property_editor_model'

const consent = useConsentStore();
const user_preferences = useUserPreferencesStore();

const {
  allow_saving_user_preferences,
} = storeToRefs(consent);

const {
  color_scheme,
} = storeToRefs(user_preferences);

const editor = usePropertyEditorModel(
  [
    new ToggleRow('consent.allow_saving_user_preferences', 'Save User Preferences', false).setModel(allow_saving_user_preferences),
    new ComboBoxRow('user.color_scheme', 'Color Scheme', 'normal', [
      ['normal', 'System Default'],
      ['dark', 'Dark'],
      ['light', 'Light'],
    ]).setModel(color_scheme),
  ]
);
</script>

<template>
  <div>
    <PropertyEditor v-bind:rows="editor.rows" v-model="editor.models" v-on="editor.onPropertyEmit" />
  </div>
</template>