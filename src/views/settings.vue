<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Button from '@/components/button.vue'
import Column from '@/components/column.vue'
import PropertyBuilder from '@/util/property_builder'
import PropertyEditor from '@/components/property_editor/property_editor.vue'
import Section from '@/components/section.vue'
// Pinia Stores
import { useConsentStore } from '@/stores/consent'
import { useUserPreferencesStore } from '@/stores/user_preferences'
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'

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
    .addToggle('consent.allow_hiding_consent_banner', 'Hide consent banner', allow_hiding_consent_banner)
    .addToggle('consent.allow_first_party_tracking', 'Allow first-party tracking', allow_first_party_tracking)
    .addToggle('consent.allow_saving_user_preferences', 'Save User Preferences', allow_saving_user_preferences)
    .addToggle('consent.allow_saving_match_three_scorecard', 'Save Match-3 Scorecard', allow_saving_match_three_scorecard)
    .build());

const user_preferences_properties = ref(new PropertyBuilder()
    .addToggle('consent.allow_saving_user_preferences', 'Save User Preferences', allow_saving_user_preferences)
    .addComboBox('user.color_scheme', "Color Scheme", color_scheme, {
      "normal": { label: 'System Default' },
      "dark": { label: 'Dark' },
      "light": { label: 'Light' },
    })
    .build());

const match_three_scorecard_properties = ref(new PropertyBuilder()
    .addToggle('consent.allow_saving_match_three_scorecard', 'Save Match-3 Personal Scorecard', allow_saving_match_three_scorecard)
    .build());
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
        For more details, please review the <RouterLink to="/privacy_statement">privacy statement</RouterLink>.
      </p>
    </Section>

    <Section heading="Consent">
      <PropertyEditor :properties="consent_properties" />
    </Section>

    <Section heading="Preferences">
      <PropertyEditor :properties="user_preferences_properties" />
    </Section>

    <Section heading="Match-3 Game">
      <PropertyEditor :properties="match_three_scorecard_properties" />
    </Section>

    <Section heading="Delete Everything">
      <p>
        If you would like to delete all local storage associated with this website, click the following button.
        This will restore the site to a clean slate, revoking all consent toggles, erasing user preferences, and erasing game data such as personal scorecards and save files.
      </p>
      <br />
      <div class="row">
        <Button class="delete">Delete All Local Storage</Button>
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