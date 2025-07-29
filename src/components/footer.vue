<script setup>
import Column from '@/components/column.vue'
</script>

<template>
  <footer>
    <Column class="column">
      <div>
        <RouterLink to="/about">About</RouterLink>
        &middot;
        <RouterLink to="/privacy">Privacy</RouterLink>
        &middot;
      </div>
      <div class="copyright">&nbsp;&copy;&nbsp;{{ new Date().getFullYear() }} Adam Ettenberger</div>
    </Column>
  </footer>
</template>

<style scoped>
footer > .column {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  text-align: center;
}

@media only screen and (max-width: 22rem) {
  footer > .column {
    display: flex;
    flex-direction: column;
  }
}
</style>
