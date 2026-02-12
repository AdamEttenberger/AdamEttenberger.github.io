<script setup lang="ts">
import Layer from '@/components/layer.vue'
import Link from './link.vue';
</script>

<template>
  <footer class="rows">
    <Layer class="responsive-row">
      <Link to="/about">About</Link>
      <Link to="/privacy">Privacy</Link>
      <Link to="/licenses">Licenses</Link>
      <div class="copyright">&copy;&nbsp;{{ new Date().getFullYear() }} Adam Ettenberger</div>
    </Layer>
  </footer>
</template>

<style scoped>
footer {
  container: footer / inline-size;

  & :any-link {
    text-decoration: none;
  }
  & :any-link:hover {
    text-decoration: underline;
  }
}

.responsive-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 0;

  & > :not(:first-child)::before {
    display: inline-block;
    content: '\00B7 ';
    padding: 0 var(--padding-normal);
  }

  @container (max-width: 35rem) {
    flex-direction: column;
    & > :not(:first-child)::before {
      content: none;
    }
  }
}
</style>
