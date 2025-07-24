import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserPreferencesStore = defineStore('user-preferences', () => {
  const color_scheme = ref('normal');

  const useDarkMode = computed(() => {
    return (color_scheme.value === "normal" && window.matchMedia("(prefers-color-scheme: dark)")) ||
            color_scheme.value === "dark";
  });

  function toggleColorScheme() {
    color_scheme.value = useDarkMode.value ? "light" : "dark";
  }

  function $reset() {
    color_scheme.value = 'normal';
  }

  return {
    // State
    color_scheme,
    // Getters
    useDarkMode,
    // Actions
    toggleColorScheme,
    $reset,
  };
});
