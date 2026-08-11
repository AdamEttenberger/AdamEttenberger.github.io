<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import Footer from '@/components/footer.vue'
import Header from '@/components/header.vue'
// Pinia Stores
import { useConsentStore } from '@/stores/consent'
import { useUserPreferencesStore } from '@/stores/user_preferences'
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'
import useTheme from '@/composables/theme'
import { useRootThemeStore } from '@/stores/root_theme'
import useLocalStorage from '@/composables/local_storage'
const consent = useConsentStore();
const {
  allow_saving_user_preferences,
  allow_saving_match_three_scorecard,
} = storeToRefs(consent);

const local_storage = useLocalStorage();

const any_consent_given = computed<boolean>(() => Object.values(consent.$state).some((item: boolean) => item));
local_storage.bind(consent, any_consent_given);
local_storage.bind(useUserPreferencesStore(), allow_saving_user_preferences);
local_storage.bind(useMatchThreeScorecardStore(), allow_saving_match_three_scorecard);

const root_theme = useRootThemeStore();
const { theme } = useTheme(() => root_theme.value);
</script>

<template>
  <div :class="['app', ...theme.classNames]">
    <Header class="header" />

    <div class="app-column">
      <main>
        <RouterView />
      </main>
    </div>

    <Footer class="footer" />
  </div>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-columns: minmax(0, auto) minmax(0, var(--app-column-max-width)) minmax(0, auto);
  grid-template-rows: min-content auto min-content;
  min-height: 100svh;

  & > :is(.header, .footer) {
    grid-column: 1 / 4;
  }

  & > .header {
    padding-bottom: var(--padding-xxlarge);
  }

  & > .footer {
    padding-top: var(--padding-xxlarge);
  }

  & > .app-column {
    grid-column: 2 / 3;
    display: flex;
    flex-direction: column;
    & > main {
      flex: 1;
    }
  }
}
</style>
