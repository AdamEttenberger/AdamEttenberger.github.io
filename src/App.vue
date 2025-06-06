<script setup>
import ExternalLink from '/src/components/external_link.vue'
</script>

<template>
  <header>
    <RouterLink to="/">
      <img alt="Logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
    </RouterLink>
    <div>
      <RouterLink to="/"><h1>Adam Ettenberger</h1></RouterLink>
      <h2>
        <ExternalLink to="https://www.linkedin.com/in/adamettenberger/" :show_ext="false"><font-awesome-icon size="2x" title="LinkedIn" icon="fa-brands fa-linkedin" aria-label="LinkedIn" /></ExternalLink>
        <ExternalLink to="https://github.com/AdamEttenberger" :show_ext="false"><font-awesome-icon size="2x" title="GitHub" icon="fa-brands fa-github-square" aria-label="GitHub" /></ExternalLink>
      </h2>
    </div>
  </header>

  <main>
    <RouterView />
  </main>

  <footer>&copy;&nbsp;{{ new Date().getFullYear() }} Adam Ettenberger</footer>
</template>

<style scoped>
header {
  display: flex;
  place-items: center;

  & .logo {
    display: block;
    margin: 0 2rem 0 0;
  }
}

main {
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

footer {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: medium;
  height: 2.5rem;
  border-radius: var(--size-border-radius);
  background-color: var(--color-background-soft);
}
</style>
