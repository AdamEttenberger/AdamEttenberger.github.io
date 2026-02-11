import { ref } from 'vue'
import { defineStore } from 'pinia'
import { ThemeLayer } from '@/composables/theme';

export const useRootThemeStore = defineStore('root-theme', () => {
  const active_theme = ref<ThemeLayer>(new ThemeLayer());

  function $reset() {
    active_theme.value = new ThemeLayer();
  }

  return {
    // State
    value: active_theme,
    // Actions
    $reset,
  };
});
