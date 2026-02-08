<script setup lang="ts">
import { storeToRefs } from 'pinia'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
// Pinia Stores
import { useConsentStore } from '@/stores/consent'
import {
  ToggleOptions,
} from '@/util/property_editor/property_types'

const consent = useConsentStore();

const {
  allow_hiding_consent_banner,
  allow_first_party_tracking,
  allow_saving_user_preferences,
  allow_saving_match_three_scorecard
} = storeToRefs(consent);

const consent_properties = [
  new ToggleOptions('consent.allow_hiding_consent_banner', 'Hide consent banner', false).setModel(allow_hiding_consent_banner),
  new ToggleOptions('consent.allow_first_party_tracking', 'Allow first-party tracking', false).setModel(allow_first_party_tracking),
  new ToggleOptions('consent.allow_saving_user_preferences', 'Save User Preferences', false).setModel(allow_saving_user_preferences),
  new ToggleOptions('consent.allow_saving_match_three_scorecard', 'Save Match-3 Scorecard', false).setModel(allow_saving_match_three_scorecard),
];
</script>

<template>
  <PropertyEditor :properties="consent_properties" />
</template>