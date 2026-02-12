<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import ConsentBanner from '@/components/consent_banner.vue'
import Footer from '@/components/footer.vue'
import Header from './components/header.vue'
import LocalStorageHelper from '@/types/local_storage_helper'
// Pinia Stores
import { useConsentStore } from '@/stores/consent'
import { useUserPreferencesStore } from '@/stores/user_preferences'
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'
import useTheme from '@/composables/theme'
import { useRootThemeStore } from '@/stores/root_theme'
const user_preferences = useUserPreferencesStore();

const consent = useConsentStore();
const {
  // allow_first_party_tracking,
  allow_hiding_consent_banner,
  allow_saving_user_preferences,
  allow_saving_match_three_scorecard,
} = storeToRefs(consent);

onMounted(() => {
  const consent = useConsentStore();
  const any_consent_given = computed(() => Object.values(consent.$state).reduce((result, item) => result || item));
  LocalStorageHelper.bind(consent, any_consent_given);
  LocalStorageHelper.bind(useUserPreferencesStore(), allow_saving_user_preferences);
  LocalStorageHelper.bind(useMatchThreeScorecardStore(), allow_saving_match_three_scorecard);
});

const root_theme = useRootThemeStore();
const { theme } = useTheme(() => root_theme.value);
</script>

<template>
  <div :class="['app', user_preferences.useDarkMode?'theme-dark-mode':'theme-light-mode', ...theme.classNames]">
    <div class="app-column">
      <Header />

      <ConsentBanner v-if="!allow_hiding_consent_banner" />

      <main>
        <RouterView />
      </main>

      <Footer />
    </div>
  </div>
</template>

<style scoped>
.app {
  display: grid;
  grid-template-columns: auto minmax(0, var(--app-column-max-width)) auto;
  height: 100svh;
  overflow-y: scroll;

  color: var(--theme-text);
  background-color: var(--theme-background);
  scrollbar-color: var(--theme-primary-300) transparent;

  &.theme-dark-mode { color-scheme: dark; }
  &.theme-light-mode { color-scheme: light; }
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
