<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import Button from '@/components/button.vue'
import Column from '@/components/column.vue'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Section from '@/components/section.vue'
// Pinia Stores
import { useConsentStore } from '@/stores/consent'
import { useUserPreferencesStore } from '@/stores/user_preferences'
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'
import PropertyBuilder, { PropertyButtonBuilder, PropertyComboBoxBuilder, PropertyToggleBuilder } from '@/util/property_editor/property_builder'

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

const consent_properties = ref(new PropertyBuilder()
    .addProperty('consent.allow_hiding_consent_banner', new PropertyToggleBuilder().setLabel('Hide consent banner').setModel(allow_hiding_consent_banner))
    .addProperty('consent.allow_first_party_tracking', new PropertyToggleBuilder().setLabel('Allow first-party tracking').setModel(allow_first_party_tracking))
    .addProperty('consent.allow_saving_user_preferences', new PropertyToggleBuilder().setLabel('Save User Preferences').setModel(allow_saving_user_preferences))
    .addProperty('consent.allow_saving_match_three_scorecard', new PropertyToggleBuilder().setLabel('Save Match-3 Scorecard').setModel(allow_saving_match_three_scorecard))
    .build());

const user_preferences_properties = ref(new PropertyBuilder()
    .addProperty('consent.allow_saving_user_preferences', new PropertyToggleBuilder().setLabel('Save User Preferences').setModel(allow_saving_user_preferences))
    .addProperty('user.color_scheme', new PropertyComboBoxBuilder().setLabel('Color Scheme').setModel(color_scheme).setValues({
      "normal": { label: 'System Default' },
      "dark": { label: 'Dark' },
      "light": { label: 'Light' },
    }))
    .build());

const match_three_scorecard_properties = ref(new PropertyBuilder()
    .addProperty('consent.allow_saving_match_three_scorecard', new PropertyToggleBuilder().setLabel('Save Match-3 Personal Scorecard').setModel(allow_saving_match_three_scorecard))
    .addProperty('action.delete_match_three_scorecard', new PropertyButtonBuilder().setLabel('Delete personal scorecard').setText("Delete"))
    .build());

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
  /* background-color: var(--color-background-error);
  color: var(--color-text-error); */
  width: max-content;
}
</style>