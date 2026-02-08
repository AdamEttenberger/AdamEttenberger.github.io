<script setup lang="ts">
import Button from '@/components/buttons/button.vue'
// Pinia Stores
import { useUserPreferencesStore } from '@/stores/user_preferences'
const user_preferences = useUserPreferencesStore();

user_preferences.$subscribe(() => {
  document.body.style.colorScheme = user_preferences.color_scheme;
});
</script>

<template>
  <Button :title="`set theme to ${user_preferences.useDarkMode ? 'light' : 'dark'} mode`"
          :icon="['fas', 'lightbulb']"
          @click="user_preferences.toggleColorScheme()" />
</template>
