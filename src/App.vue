<script setup>
import ExternalLink from '/src/components/external_link.vue'
import ImageButton from '/src/components/image_button.vue'
import ThemeToggle from '/src/components/theme_toggle.vue'
import LogoIcon from '@/assets/logo.svg'
</script>

<template>
  <div class="app">
    <header>
      <ImageButton class="logo" route="/" :src="LogoIcon" alt="Logo" />
      <div class="title">
        <RouterLink to="/"><h1>Adam Ettenberger</h1></RouterLink>
        <div class="links">
          <ExternalLink to="https://www.linkedin.com/in/adamettenberger/" :show_ext="false"><font-awesome-icon size="2x" title="LinkedIn" icon="fa-brands fa-linkedin" aria-label="LinkedIn" /></ExternalLink>
          <ExternalLink to="https://github.com/AdamEttenberger" :show_ext="false"><font-awesome-icon size="2x" title="GitHub" icon="fa-brands fa-github-square" aria-label="GitHub" /></ExternalLink>
          <div class="controls">
            <ThemeToggle class="theme-toggle" />
          </div>
        </div>
      </div>
    </header>

    <main>
      <RouterView />
    </main>

    <footer><div class="copyright">&copy;&nbsp;{{ new Date().getFullYear() }} Adam Ettenberger</div></footer>
  </div>
</template>

<style scoped>

header,
header .links,
header .controls {
  display: flex;
  flex-direction: row;
  place-items: center;
  align-items: center;
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

footer > .copyright {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: medium;
  height: 2.5rem;
  border-radius: var(--size-border-radius);
  background-color: var(--color-background-soft);
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
