<script setup lang="ts">
import Layer from '@/components/layer.vue'
import Link from './link.vue';
</script>

<template>
  <footer class="rows">
    <Layer class="responsive-row">
      <Link to="/about">About</Link>
      &middot;
      <Link to="/privacy">Privacy</Link>
      &middot;
      <Link to="/licenses">Licenses</Link>
      &middot;
      <div class="copyright">&nbsp;&copy;&nbsp;{{ new Date().getFullYear() }} Adam Ettenberger</div>
    </Layer>
  </footer>
</template>

<style scoped>
footer {
  container: footer / inline-size;
}

.responsive-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0 var(--padding-normal);

  @container (max-width: 35rem) {
    flex-direction: column;
  }
}
</style>
