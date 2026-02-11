<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
import ConsentProperties from '@/content/settings/consent_properties.vue'
import UserPreferencesProperties from '@/content/settings/user_preferences_properties.vue'
import MatchThreeProperties from '@/content/settings/match_three_properties.vue'
import Section from '@/components/section.vue'
import { ThemeColor } from '@/composables/theme'
// Pinia Stores
import { useConsentStore } from '@/stores/consent'
import { useUserPreferencesStore } from '@/stores/user_preferences'
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'

const consent = useConsentStore();
const user_preferences = useUserPreferencesStore();
const match_three_scorecard = useMatchThreeScorecardStore();

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
  <article>
    <Section heading="Summary">
      <p>
        This page contains all user consent, preference, and local storage (game scorecards and save files) controls for managing how this site behaves while you visit.
      </p>
      <p>
        Selected preferences are stored locally on your device in browser local storage and will not be collected, sold, or shared.
        Selections will not persist between different browsers, devices, or when exiting 'private' browsing sessions that automatically erase local storage.
      </p>
      <p>
        For more details, please review the <RouterLink to="/privacy">privacy statement</RouterLink>.
      </p>
    </Section>

    <Section heading="Consent">
      <ConsentProperties />
    </Section>

    <Section heading="Preferences">
      <UserPreferencesProperties />
    </Section>

    <Section heading="Match-3 Game">
      <MatchThreeProperties />
    </Section>

    <Section heading="Delete Everything">
      <p>
        If you would like to delete all local storage associated with this website, click the following button.
        This will restore the site to a clean slate, revoking all consent toggles, erasing user preferences, and erasing game data such as personal scorecards and save files.
      </p>
      <div class="columns">
        <Button class="delete-all" text="Delete All Local Storage" @click="onDeleteAllLocalStorage" :color="ThemeColor.Error" />
      </div>
    </Section>
  </article>
</template>

<style scoped>
.delete-all { flex: 1; }
</style>