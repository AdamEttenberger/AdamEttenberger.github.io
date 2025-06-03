<template>
  <header>
    <img alt="Logo" class="logo" src="./assets/logo.svg" width="125" height="125" />
    <div>
      <h1>Adam Ettenberger</h1>
      <h2>
        <a target="_blank" href="https://www.linkedin.com/in/adamettenberger/"><font-awesome-icon size="2x" title="LinkedIn" icon="fa-brands fa-linkedin" aria-label="LinkedIn" /></a>
        <a target="_blank" href="https://github.com/AdamEttenberger"><font-awesome-icon size="2x" title="GitHub" icon="fa-brands fa-github-square" aria-label="GitHub" /></a>
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

  & > .logo {
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
  border-radius: 25px;
  background-color: var(--color-background-soft);
}
</style>
