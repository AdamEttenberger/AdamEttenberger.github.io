<script setup labg="ts">
import { onMounted, watch } from 'vue'
import Button from '@/components/button.vue'
// Pinia Stores
import userPrefsStore from '@/stores/local_storage/user_prefs'
const user_prefs = userPrefsStore();

function applyColorScheme() {
  document.body.style.colorScheme = user_prefs.getColorScheme;
}

watch(user_prefs, applyColorScheme);
onMounted(applyColorScheme);
</script>

<template>
  <Button class="button"
          :title="`set theme to ${user_prefs.useDarkMode ? 'light' : 'dark'} mode`"
          :icon="['fas', 'lightbulb']"
          @click="user_prefs.toggleColorScheme()" />
</template>

<style scoped>
.button :deep(svg.image-button-fa-icon) {
  color: light-dark(var(--theme-white), var(--theme-black));
}
</style>