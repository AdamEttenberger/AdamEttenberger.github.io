<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import Button from '@/components/buttons/button.vue'
import Column from '@/components/column.vue'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Section from '@/components/section.vue'
// Pinia Stores
import { useConsentStore } from '@/stores/consent'
import { useUserPreferencesStore } from '@/stores/user_preferences'
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'
import {
  ButtonOptions,
  ComboBoxOptions,
  ToggleOptions,
} from '@/util/property_editor/property_types'

const consent = useConsentStore();
const user_preferences = useUserPreferencesStore();
const match_three_scorecard = useMatchThreeScorecardStore();

const {
  allow_hiding_consent_banner,
  allow_first_party_tracking,
  allow_saving_user_preferences,
  allow_saving_match_three_scorecard
} = storeToRefs(consent);

const {
  color_scheme,
} = storeToRefs(user_preferences);

const consent_properties = [
  new ToggleOptions('consent.allow_hiding_consent_banner', 'Hide consent banner', false).setModel(allow_hiding_consent_banner),
  new ToggleOptions('consent.allow_first_party_tracking', 'Allow first-party tracking', false).setModel(allow_first_party_tracking),
  new ToggleOptions('consent.allow_saving_user_preferences', 'Save User Preferences', false).setModel(allow_saving_user_preferences),
  new ToggleOptions('consent.allow_saving_match_three_scorecard', 'Save Match-3 Scorecard', false).setModel(allow_saving_match_three_scorecard),
];

const user_preferences_properties = [
  new ToggleOptions('consent.allow_saving_user_preferences', 'Save User Preferences', false).setModel(allow_saving_user_preferences),
  new ComboBoxOptions('user.color_scheme', 'Color Scheme', 'normal', [
    ['normal', 'System Default'],
    ['dark', 'Dark'],
    ['light', 'Light'],
  ]).setModel(color_scheme),
];

const match_three_scorecard_properties = [
  new ToggleOptions('consent.allow_saving_match_three_scorecard', 'Save Match-3 Personal Scorecard', false).setModel(allow_saving_match_three_scorecard),
  new ButtonOptions('action.delete_match_three_scorecard', 'Delete Scorecard').setClasses(['delete']).setDisabled(computed(() => !match_three_scorecard?.scorecard)),
];

function onPropertyButtonClick(name) {
  switch (name) {
    case 'action.delete_match_three_scorecard':
      match_three_scorecard.scorecard = null;
      break;
  }
}

function onDeleteAllLocalStorage() {
  // Calling $reset ensures the website behaves reactively since
  // neither localStorage.clear() or localStorage.removeItem()
  // trigger 'storage' events.
  consent.$reset();
  user_preferences.$reset();
  match_three_scorecard.$reset();
  // If anything was left behind, call localStorage.clear().
  // During development I've observed both Edge and Chrome failing
  // on their first attempt to delete particular localStorage keys.
  // Arbitrarily limit attempts (3) to safeguard against infinite loops
  // for any situation where a key cannot be deleted; either because the
  // browser refuses to delete it or something is injecting localStorage
  // keys unexpectedly.
  for (var i = 0; localStorage.length > 0 && i < 3; ++i) {
    localStorage.clear();
  }
}
</script>

<template>
  <Column>
    <Section heading="Summary">
      <p>
        This page contains all user consent, preference, and local storage (game scorecards and save files) controls for managing how this site behaves while you visit.
      </p>
      <br />
      <p>
        Selected preferences are stored locally on your device in browser local storage and will not be collected, sold, or shared.
        Selections will not persist between different browsers, devices, or when exiting 'private' browsing sessions that automatically erase local storage.
      </p>
      <br />
      <p>
        For more details, please review the <RouterLink to="/privacy">privacy statement</RouterLink>.
      </p>
    </Section>

    <Section heading="Consent">
      <PropertyEditor :properties="consent_properties" />
    </Section>

    <Section heading="Preferences">
      <PropertyEditor :properties="user_preferences_properties" />
    </Section>

    <Section heading="Match-3 Game">
      <PropertyEditor :properties="match_three_scorecard_properties"
                      @property-click="onPropertyButtonClick" />
    </Section>

    <Section heading="Delete Everything">
      <p>
        If you would like to delete all local storage associated with this website, click the following button.
        This will restore the site to a clean slate, revoking all consent toggles, erasing user preferences, and erasing game data such as personal scorecards and save files.
      </p>
      <br />
      <div class="row">
        <Button class="delete" text="Delete All Local Storage" @click="onDeleteAllLocalStorage" />
      </div>
    </Section>
  </Column>
</template>

<style scoped>
.row {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.delete {
  width: max-content;
}
</style>