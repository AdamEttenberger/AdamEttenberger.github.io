<script setup lang="ts">
import Link from '@/components/link.vue'
import LogoHomeButton from '@/components/buttons/logo_home_button.vue'
import PaletteButton from '@/components/buttons/palette_button.vue'
import SettingsButton from '@/components/buttons/settings.vue'
import SocialLink from '@/components/buttons/social_link.vue'
import ThemeToggle from '@/components/buttons/theme_toggle.vue'
import useTheme, { ThemeColor } from '@/composables/theme'

const { theme } = useTheme(() => ({ depth: 1, absolute: true }));
</script>

<template>
  <header :class="['columns', ...theme.classNames]">
    <div class="logo">
      <LogoHomeButton />
    </div>
    <div class="title-bar">
      <Link class="title-text" to="/" :color="ThemeColor.Accent" :depth="5" absolute>Adam Ettenberger</Link>
      <div class="links columns">
        <div class="socials columns gap-s">
          <SocialLink type="about" />
          <SocialLink type="hire-me" />
          <SocialLink type="linkedin" />
          <SocialLink type="github" />
        </div>
        <div class="controls columns gap-s">
          <PaletteButton />
          <ThemeToggle />
          <SettingsButton />
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
header {
  place-items: center;
  align-items: center;
}

header .links {
  justify-content: space-between;
  padding-right: var(--component-layer-padding);
}

header .socials,
header .controls {
  height: 2em;
  & > * {
    height: 100%;
  }
}

header .controls {
  /**
   * Magic number based on the current logo image
   * for balancing the header symmetrically. This
   * accounts for the padding baked into the icon.
   * TODO: Remove this after creating a new logo,
   * then use normal padding to separate the buttons
   * from the screen edge.
   */
  padding-right: 36px;
}

header {
  & .logo {
    display: block;
    width: 8rem;
  }

  & > .title-bar {
    flex: 1;

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

  & .links {
    flex-wrap: nowrap;
  }
}

@media only screen and (max-width: 35rem) {
  header {
    display: flex;
    flex-direction: column;
    place-items: center;
    text-align: center;

    & > .logo {
      width: 4rem;
    }

    & .controls {
      padding-right: unset;
    }
  }
}
</style>