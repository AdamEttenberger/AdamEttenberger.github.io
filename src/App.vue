<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import ConsentBanner from '@/components/consent_banner.vue'
import Footer from '@/components/footer.vue'
import Link from '@/components/link.vue'
import LocalStorageHelper from '@/types/local_storage_helper'
import LogoHomeButton from '@/components/buttons/logo_home_button.vue'
import SettingsButton from '@/components/buttons/settings.vue'
import SocialLink from '@/components/buttons/social_link.vue'
import ThemeToggle from '@/components/buttons/theme_toggle.vue'
// Pinia Stores
import { useConsentStore } from '@/stores/consent'
import { useUserPreferencesStore } from '@/stores/user_preferences'
import { useMatchThreeScorecardStore } from '@/stores/match_three_scorecard'
import useTheme, { ThemeColor } from '@/composables/theme'

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

useTheme(() => ({
  color: ThemeColor.Primary,
  depth: 0,
  absolute: true,
}));
</script>

<template>
  <div class="app">
    <header class="columns">
      <div class="logo">
        <LogoHomeButton />
      </div>
      <div class="title">
        <h1><Link to="/">Adam Ettenberger</Link></h1>
        <div class="links columns">
          <div class="socials columns gap-s">
            <SocialLink type="about" />
            <SocialLink type="hire-me" />
            <SocialLink type="linkedin" />
            <SocialLink type="github" />
          </div>
          <div class="controls columns gap-s">
            <ThemeToggle />
            <SettingsButton />
          </div>
        </div>
      </div>
    </header>

    <ConsentBanner v-if="!allow_hiding_consent_banner" />

    <main>
      <RouterView />
    </main>

    <Footer />
  </div>
</template>

<style scoped>
header {
  place-items: center;
  align-items: center;
}

header .links {
  justify-content: space-between;
}

header .socials,
header .controls {
  height: 2em;
  & > * {
    height: 100%;
  }
}

header {
  & .logo {
    display: block;
    width: 8rem;
  }

  & > .title {
    flex: 1;
  }

  & .links {
    flex-wrap: nowrap;
  }
}

main {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

@media only screen and (max-width: 25rem) {
  header {
    display: flex;
    flex-direction: column;
    place-items: center;
    text-align: center;

    & > .logo {
      width: 4rem;
    }
  }
}
</style>
