<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import ConsentBanner from '@/components/consent_banner.vue'
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
  allow_hiding_consent_banner,
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
  min-height: 100svh;

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
