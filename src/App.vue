<script setup>
import ConsentBanner from '@/components/consent_banner.vue'
import Footer from '@/components/footer.vue'
import LogoHomeButton from '@/components/image_buttons/logo_home_button.vue'
import SettingsButton from '@/components/settings_button.vue'
import SocialLink from '@/components/image_buttons/social_link.vue'
import ThemeToggle from '@/components/image_buttons/theme_toggle.vue'
</script>

<template>
  <div class="app">
    <header>
      <div class="logo">
        <LogoHomeButton />
      </div>
      <div class="title">
        <RouterLink to="/"><h1>Adam Ettenberger</h1></RouterLink>
        <div class="links">
          <div class="socials">
            <SocialLink type="about" />
            <SocialLink type="hire-me" />
            <SocialLink type="linkedin" />
            <SocialLink type="github" />
            <SocialLink type="resume" />
          </div>
          <div class="controls">
            <ThemeToggle />
            <SettingsButton />
          </div>
        </div>
      </div>
    </header>

    <ConsentBanner />

    <main>
      <RouterView />
    </main>

    <Footer />
  </div>
</template>

<style scoped>

header {
  display: flex;
  flex-direction: row;
  place-items: center;
  align-items: center;
}

header .socials,
header .controls {
  display: flex;
  flex-direction: row;
  height: 2em;
  gap: 0 var(--size-padding-round);
  & > * {
    height: 100%;
  }
}

header .controls {
  margin-left: auto;
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
    display: flex;
    flex-direction: row;
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
