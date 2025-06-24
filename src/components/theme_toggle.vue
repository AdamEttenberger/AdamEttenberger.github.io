<script setup>
import { onMounted, watch } from 'vue'
import ImageButton from '@/components/image_button.vue'
// Pinia Stores
import { colorSchemeStore } from '@/stores/color_scheme'
const store = colorSchemeStore();

function applyColorScheme() {
  document.body.style.colorScheme = store.colorScheme;
}

function onToggle() {
  localStorage.setItem('colorScheme', store.toggleColorScheme());
  applyColorScheme();
}

watch(store, () => applyColorScheme());

onMounted(() => {
  const savedColorScheme = localStorage.getItem('colorScheme');
  if (!["normal", "light", "dark"].includes(savedColorScheme)) {
    return;
  }
  store.colorScheme = savedColorScheme;
  applyColorScheme();
});
</script>

<template>
  <ImageButton class="button" @click="onToggle()">
    <font-awesome-icon v-if="store.isDarkMode" :icon="['fas', 'sun']" aria-label="toggle light mode" />
    <font-awesome-icon v-else :icon="['fas', 'moon']" aria-label="toggle dark mode" />
  </ImageButton>
</template>

<style scoped>
.button {
  height: 100%;
  aspect-ratio: 1;
  font-size: 1.2rem;
}
</style>