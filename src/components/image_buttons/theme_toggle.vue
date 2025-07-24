<script setup labg="ts">
import { watch } from 'vue'
import Button from '@/components/button.vue'
// Pinia Stores
import { useUserPreferencesStore } from '@/stores/user_preferences'
const user_preferences = useUserPreferencesStore();

user_preferences.$subscribe(() => {
  document.body.style.colorScheme = user_preferences.color_scheme;
});
</script>

<template>
  <Button class="button"
          :title="`set theme to ${user_preferences.useDarkMode ? 'light' : 'dark'} mode`"
          :icon="['fas', 'lightbulb']"
          @click="user_preferences.toggleColorScheme()" />
</template>

<style scoped>
.button :deep(svg.image-button-fa-icon) {
  color: light-dark(var(--theme-white), var(--theme-black));
}
</style>