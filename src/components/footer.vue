<script setup>
import Column from '@/components/column.vue'
</script>

<template>
  <footer>
    <Column class="column">
      <div class="copyright">&copy;&nbsp;{{ new Date().getFullYear() }} Adam Ettenberger</div>
      &nbsp;&middot;
      <RouterLink to="/privacy_statement">privacy statement</RouterLink>
      &nbsp;&middot;
      <RouterLink to="/about">about</RouterLink>
    </Column>
  </footer>
</template>

<style scoped>
footer > .column {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  font-size: medium;
  height: 2.5rem;
  border-radius: var(--size-border-radius);
  background-color: var(--color-background-soft);
}
</style>