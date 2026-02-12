import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { ThemeLayer } from '@/composables/theme';
import { useUserPreferencesStore } from '@/stores/user_preferences'

export const useRootThemeStore = defineStore('root-theme', () => {
  const user_preferences = useUserPreferencesStore();
  const active_theme = ref<ThemeLayer>(new ThemeLayer());
  const known_classes = new Set<string>();

  function $reset() {
    active_theme.value = new ThemeLayer();
  }

  function updateClassList() {
    var currentClasses = document.documentElement.classList;
    const newClasses = new Set([
      user_preferences.useDarkMode?'theme-dark-mode':'theme-light-mode',
      ...active_theme.value.classNames,
    ]);
    const items_to_remove: Array<string> = [...known_classes].filter(item => !newClasses.has(item));
    const items_to_add: Array<string> = [...newClasses].filter(item => !known_classes.has(item));
    items_to_remove.forEach(item => {
      currentClasses.remove(item);
      known_classes.delete(item);
    });
    items_to_add.forEach(item => {
      currentClasses.add(item);
      known_classes.add(item);
    });
  }

  watch(active_theme, (_new_value) => updateClassList(), { immediate: true });
  user_preferences.$subscribe((_mutation, state) => updateClassList());

  return {
    // State
    value: active_theme,
    // Actions
    $reset,
  };
});
