<script setup lang="ts">
import { storeToRefs } from 'pinia'
import ConsentBanner from '@/components/consent_banner.vue'
import Layer from '@/components/layer.vue'
import Link from '@/components/link.vue'
import HomeButton from '@/components/buttons/home.vue'
import PaletteButton from '@/components/buttons/palette_button.vue'
import SettingsButton from '@/components/buttons/settings.vue'
import ThemeToggle from '@/components/buttons/theme_toggle.vue'
import { useConsentStore } from '@/stores/consent'
import useTheme, { ThemeColor } from '@/composables/theme'
import { type IAuthor } from '@/content/author'

defineProps<{
  author: IAuthor;
}>();

const consent = useConsentStore();
const {
  allow_hiding_consent_banner,
} = storeToRefs(consent);

const { theme } = useTheme(() => ({ depth: 1, absolute: true }));
</script>

<template>
  <header :class="['rows', ...theme.classNames]">
    <Layer class="responsive-row" :depth="0" absolute>
      <Link class="title-text" to="/" :color="ThemeColor.Accent" :depth="5" absolute>{{ author.name }}</Link>
      <div class="buttons columns gap-s">
        <HomeButton />
        <PaletteButton />
        <ThemeToggle />
        <SettingsButton />
      </div>
    </Layer>
    <ConsentBanner v-if="!allow_hiding_consent_banner" class="consent-banner" />
  </header>
</template>

<style scoped>
header {
  position: sticky;
  inset: 0;
  z-index: var(--z-index-max);

  & > .responsive-row {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 calc(var(--padding-xxlarge) * 2.0);
    height: var(--size-header-height);
    gap: 0;
    border-radius: 0;
    border-bottom: var(--size-header-footer-border) solid var(--theme-accent-500);

    & > .title-text {
      font-size: xx-large;
      font-weight: bolder;
      color: var(--theme-background);
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }

  & > .consent-banner {
    padding-top: var(--padding-normal);
  }
}

@media only screen and (max-width: 35rem) {
  header > .responsive-row {
    display: flex;
    flex-direction: column;

    & > .buttons {
      padding-bottom: var(--padding-normal);
    }
  }
}
</style>