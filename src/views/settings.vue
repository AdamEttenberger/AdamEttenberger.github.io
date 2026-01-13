<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import Button from '@/components/button.vue'
import Column from '@/components/column.vue'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Section from '@/components/section.vue'
// Pinia Stores
import { useConsentStore } from '@/stores/consent'
import { useUserPreferencesStore } from '@/stores/user_preferences'
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'
import { PropertyKind } from '@/util/property_editor/property_interfaces'

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
  {
    kind: PropertyKind.Toggle,
    name: 'consent.allow_hiding_consent_banner',
    label: 'Hide consent banner',
    default_value: false,
    model: allow_hiding_consent_banner,
  },
  {
    kind: PropertyKind.Toggle,
    name: 'consent.allow_first_party_tracking',
    label: 'Allow first-party tracking',
    default_value: false,
    model: allow_first_party_tracking,
  },
  {
    kind: PropertyKind.Toggle,
    name: 'consent.allow_saving_user_preferences',
    label: 'Save User Preferences',
    default_value: false,
    model: allow_saving_user_preferences,
  },
  {
    kind: PropertyKind.Toggle,
    name: 'consent.allow_saving_match_three_scorecard',
    label: 'Save Match-3 Scorecard',
    default_value: false,
    model: allow_saving_match_three_scorecard,
  },

];

const user_preferences_properties = [
  {
    kind: PropertyKind.Toggle,
    name: 'consent.allow_saving_user_preferences',
    label: 'Save User Preferences',
    default_value: false,
    model: allow_saving_user_preferences,
  },
  {
    kind: PropertyKind.ComboBox,
    name: 'user.color_scheme',
    label: 'Color Scheme',
    values: [
      ['normal', 'System Default'],
      ['dark', 'Dark'],
      ['light', 'Light'],
    ],
    default_value: 'normal',
    model: color_scheme,
  },
];

const match_three_scorecard_properties = [
  {
    kind: PropertyKind.Toggle,
    name: 'consent.allow_saving_match_three_scorecard',
    label: 'Save Match-3 Personal Scorecard',
    default_value: false,
    model: allow_saving_match_three_scorecard,
  },
  {
    kind: PropertyKind.Button,
    classes: ['delete'],
    name: 'action.delete_match_three_scorecard',
    label: 'Delete personal scorecard',
    text: 'Delete',
    disabled: computed(() => !match_three_scorecard?.scorecard),
  },
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