<script setup>
import ProjectCardList from './components/ProjectCardList.vue'
</script>

<template>
  <header>
    <img alt="Logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <h1 class="green">Adam Ettenberger</h1>
      <h2>
        <a target="_blank" href="https://www.linkedin.com/in/adamettenberger/"><font-awesome-icon size="2x" title="LinkedIn" icon="fa-brands fa-linkedin" aria-label="LinkedIn" /></a>
        <a target="_blank" href="https://github.com/AdamEttenberger"><font-awesome-icon size="2x" title="GitHub" icon="fa-brands fa-github-square" aria-label="GitHub" /></a>
      </h2>
    </div>
  </header>

  <main>
    <ProjectCardList />
  </main>

  <footer>&copy;&nbsp;{{ new Date().getFullYear() }} Adam Ettenberger</footer>
</template>

<style scoped>
header {
  display: flex;
  place-items: center;
  padding-right: calc(var(--section-gap) / 2);
  padding-bottom: 1rem;
  line-height: 1.5;

  & > .logo {
    display: block;
    margin: 0 2rem 0 0;
  }
}

footer {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: medium;
  height: 2.5rem;
  border-radius: 25px;
  background-color: var(--color-background-soft);
}
</style>
