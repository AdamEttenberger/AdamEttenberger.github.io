import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserPreferencesStore = defineStore('user-preferences', () => {
  const colorScheme = ref('normal');

  const useDarkMode = computed<boolean>(() => {
    return (colorScheme.value === "normal" && window.matchMedia("(prefers-color-scheme: dark)").matches) ||
            colorScheme.value === "dark";
  });

  const oppositeColorScheme = computed<string>(() => useDarkMode.value ? "light" : "dark");

  function toggleColorScheme() {
    colorScheme.value = useDarkMode.value ? "light" : "dark";
  }

  function $reset() {
    colorScheme.value = 'normal';
  }

  return {
    // State
    colorScheme,
    // Getters
    useDarkMode,
    oppositeColorScheme,
    // Actions
    toggleColorScheme,
    $reset,
  };
});
